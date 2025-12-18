import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconX, IconCheck } from "@tabler/icons-react";
import { toasts } from "@/utils/toasts";
import {
  createConsultation,
  updateConsultation,
  prepareConsultationDetails,
  getConsultationByDateAndProcessNumber,
} from "@/lib/api/consultations";
import type {
  ConsultationInsert,
  ConsultationMGF,
} from "@/lib/api/consultations";
import type { Specialty } from "@/lib/api/specialties";
import {
  COMMON_CONSULTATION_FIELDS,
  getICPC2Codes,
  MGF_SECTION_LABELS,
} from "@/constants";
import { useConsultationForm } from "@/hooks/consultations/use-consultation-form";
import {
  validateForm,
  serializeFormValues,
} from "@/components/forms/consultation/helpers";
import {
  buildFieldRuleContext,
  evaluateFieldRule,
  isFieldRequired,
  isFieldVisible,
  resolveTypeSections,
} from "@/components/forms/consultation/helpers";
import { ConsultationFieldWithLayout } from "@/components/forms/consultation/consultation-form";
import type { FormValues } from "@/hooks/consultations/types";

interface ConsultationModalProps {
  userId: string;
  specialty: Specialty | null;
  editingConsultation?: ConsultationMGF | null;
  specialtyYear?: number | null;
  onClose: () => void;
  onConsultationSaved?: () => void;
}

export function ConsultationModal({
  userId,
  specialty,
  editingConsultation,
  specialtyYear,
  onClose,
  onConsultationSaved,
}: ConsultationModalProps) {
  const isEditing = !!editingConsultation;
  const [isSaving, setIsSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  /**
   * For updates, clear values for fields that are hidden by the current UI conditions
   * so they are written as null in `details` and don't linger in the DB.
   *
   * Note: this does NOT mutate form state; it only affects the payload we serialize.
   */
  const sanitizeFormValuesForUpdate = (values: FormValues): FormValues => {
    const sanitized: FormValues = { ...values };
    const ctx = buildFieldRuleContext(values);

    // Helper: clear a key to an "empty" value that serializes to null.
    // For array-valued fields, we use [] so serializeFieldValue returns null.
    // For all other fields, we use "" so serializeFieldValue returns null.
    const clearKey = (key: string, fieldType?: string) => {
      sanitized[key] =
        fieldType === "text-list" ||
        fieldType === "multi-select" ||
        fieldType === "icpc2-codes"
          ? []
          : "";
    };

    // Clear hidden specialty fields (driven by each field's visibleWhen)
    specialtyFields.forEach((field) => {
      if (!isFieldVisible(field, ctx)) {
        clearKey(field.key, field.type);
      }
    });

    // Clear hidden type-specific fields (driven by section.visibleWhen + field.visibleWhen)
    const typeSections = resolveTypeSections(ctx.type);
    typeSections.forEach((section) => {
      const sectionVisible = evaluateFieldRule(section.visibleWhen, ctx, true);
      if (!sectionVisible) {
        section.fields.forEach((field) => clearKey(field.key, field.type));
        return;
      }

      section.fields.forEach((field) => {
        if (!isFieldVisible(field, ctx)) {
          clearKey(field.key, field.type);
        }
      });
    });

    return sanitized;
  };

  const handleClose = () => {
    if (isSaving) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const icpc2Codes = specialty ? getICPC2Codes(specialty.code) : [];

  const {
    formValues,
    fieldError,
    updateField,
    showFieldError,
    fieldsBySection,
    sectionOrder,
    typeSpecificSectionsBySection,
    specialtyFields,
  } = useConsultationForm(
    specialty?.code || null,
    editingConsultation,
    specialtyYear
  );

  const ruleCtx = buildFieldRuleContext(formValues as FormValues);

  const ruleCtx = buildFieldRuleContext(formValues as FormValues);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm(
      formValues,
      specialtyFields,
      specialty?.id || null
    );

    if (validationError) {
      showFieldError(validationError.key, validationError.message);
      return;
    }

    // Pre-submit uniqueness check for new consultations:
    // block creation if another consultation exists with the same date + process_number.
    if (!isEditing) {
      const date = formValues.date as string;
      const processNumber = parseInt(formValues.process_number as string, 10);

      if (!Number.isNaN(processNumber)) {
        const duplicateCheck = await getConsultationByDateAndProcessNumber({
          userId,
          date,
          processNumber,
        });

        if (duplicateCheck.success && duplicateCheck.data) {
          const message =
            "Já existe uma consulta com esta data e número de processo.";
          toasts.error(message);
          showFieldError("process_number", message);
          return;
        }
      }
    }

    setIsSaving(true);

    try {
      const valuesForSerialization =
        isEditing && editingConsultation
          ? sanitizeFormValuesForUpdate(formValues as FormValues)
          : formValues;

      const details = prepareConsultationDetails(
        specialty!.code,
        serializeFormValues(valuesForSerialization, specialtyFields)
      );

      const consultation: ConsultationInsert = {
        user_id: userId,
        specialty_id: specialty!.id,
        specialty_year: parseInt(formValues.specialty_year as string, 10),
        date: formValues.date as string,
        sex: formValues.sex as string,
        age: parseInt(formValues.age as string, 10),
        age_unit: (formValues.age_unit as string) || "years",
        process_number: parseInt(formValues.process_number as string, 10),
        location: formValues.location as string,
        autonomy: formValues.autonomy as string,
        details,
      };

      const result =
        isEditing && editingConsultation
          ? await updateConsultation(editingConsultation.id!, consultation)
          : await createConsultation(consultation);

      if (!result.success) {
        toasts.apiError(
          result.error,
          `Erro ao ${isEditing ? "atualizar" : "criar"} consulta`
        );
        return;
      }

      toasts.success(
        `Consulta ${isEditing ? "atualizada" : "criada"} com sucesso!`
      );
      onConsultationSaved?.();
      handleClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 duration-200 ${
          isClosing ? "animate-out fade-out" : "animate-in fade-in"
        }`}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none sm:mx-4">
        <Card
          className={`w-full h-[95vh] sm:h-auto py-0 sm:max-w-4xl sm:max-h-[92vh] overflow-hidden flex flex-col gap-0 sm:rounded-xl rounded-b-none rounded-t-xl pointer-events-auto duration-300 shadow-2xl ${
            isClosing
              ? "animate-out slide-out-to-bottom sm:slide-out-to-bottom-0 sm:zoom-out-95"
              : "animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95"
          }`}
        >
          <CardHeader className="sticky top-0 z-20 pt-3 !pb-3 sm:pt-4 sm:!pb-4 px-4 sm:px-6 flex flex-row items-center justify-between flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b shadow-sm">
            <CardTitle className="text-lg sm:text-xl font-semibold">
              {isEditing ? "Editar Consulta" : "Nova Consulta"}
              <span className="hidden sm:inline ml-2 text-muted-foreground font-normal">
                - {specialty?.name || "MGF"}
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isSaving}
              className="flex-shrink-0 h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <IconX className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
            <form
              id="consultation-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-6 sm:space-y-7"
            >
              {/* Basic Information */}
              <section className="space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Informação Básica
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Dados gerais do doente e da consulta
                  </p>
                </div>
                <div className="rounded-lg border bg-card/50 p-4 sm:p-5 shadow-sm">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                    {COMMON_CONSULTATION_FIELDS.filter(
                      (field) => field.key !== "age_unit"
                    ).map((field) => {
                      const required = isFieldRequired(field, ruleCtx);
                      // Special handling for age field - combine with age_unit
                      if (field.key === "age") {
                        const ageUnitField = COMMON_CONSULTATION_FIELDS.find(
                          (f) => f.key === "age_unit"
                        );
                        const ageUnitRequired = ageUnitField
                          ? isFieldRequired(ageUnitField, ruleCtx)
                          : false;
                        return (
                          <div key={field.key} className="space-y-2">
                            <Label
                              htmlFor={field.key}
                              className="text-sm font-medium"
                            >
                              {field.label}
                              {required && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id={field.key}
                                type="number"
                                value={formValues[field.key] || ""}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => updateField(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                required={required}
                                min="0"
                                max="150"
                                className={`flex-1 min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                  fieldError?.key === field.key
                                    ? "border-destructive"
                                    : ""
                                }`}
                                aria-invalid={
                                  fieldError?.key === field.key || undefined
                                }
                                aria-describedby={
                                  fieldError?.key === field.key
                                    ? `${field.key}-error`
                                    : undefined
                                }
                              />
                              {ageUnitField && (
                                <Select
                                  value={
                                    typeof formValues.age_unit === "string"
                                      ? formValues.age_unit
                                      : String(
                                          ageUnitField.defaultValue || "years"
                                        )
                                  }
                                  onValueChange={(val) =>
                                    updateField("age_unit", val)
                                  }
                                  required={ageUnitRequired}
                                >
                                  <SelectTrigger
                                    id="age_unit"
                                    className=" flex-shrink-0"
                                    aria-invalid={
                                      fieldError?.key === "age_unit" ||
                                      undefined
                                    }
                                    aria-describedby={
                                      fieldError?.key === "age_unit"
                                        ? "age_unit-error"
                                        : undefined
                                    }
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ageUnitField.options?.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            {fieldError?.key === field.key && (
                              <p
                                id={`${field.key}-error`}
                                className="text-xs text-destructive mt-1"
                              >
                                {fieldError.message}
                              </p>
                            )}
                            {fieldError?.key === "age_unit" && (
                              <p
                                id="age_unit-error"
                                className="text-xs text-destructive mt-1"
                              >
                                {fieldError.message}
                              </p>
                            )}
                          </div>
                        );
                      }

                      // Regular field rendering
                      return (
                        <ConsultationFieldWithLayout
                          key={field.key}
                          field={field}
                          value={formValues[field.key] || ""}
                          errorMessage={
                            fieldError?.key === field.key
                              ? fieldError.message
                              : undefined
                          }
                          onUpdate={(value) => updateField(field.key, value)}
                          isRequired={required}
                        />
                      );
                    })}

                    {/* Specialty Year Selector */}
                    {specialty && specialty.years > 1 && (
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="specialty_year"
                          className="text-sm font-medium"
                        >
                          Ano da Especialidade
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Select
                          value={String(formValues.specialty_year || "1")}
                          onValueChange={(val) =>
                            updateField("specialty_year", val)
                          }
                          required
                          disabled={
                            typeof specialtyYear === "number" &&
                            specialtyYear > 0
                          }
                        >
                          <SelectTrigger
                            id="specialty_year"
                            aria-invalid={
                              fieldError?.key === "specialty_year" || undefined
                            }
                            aria-describedby={
                              fieldError?.key === "specialty_year"
                                ? "specialty_year-error"
                                : undefined
                            }
                          >
                            <SelectValue placeholder="Selecionar ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(
                              { length: specialty.years },
                              (_, i) => i + 1
                            ).map((year) => (
                              <SelectItem key={year} value={String(year)}>
                                {specialty.code.toUpperCase()}.{year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldError?.key === "specialty_year" && (
                          <p
                            id="specialty_year-error"
                            className="text-xs text-destructive mt-1"
                          >
                            {fieldError.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {specialtyFields.length > 0 && (
                <section className="space-y-3 sm:space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                      Detalhes da Consulta
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Informações específicas da especialidade
                    </p>
                  </div>

                  <div className="space-y-4 sm:space-y-5">
                    {/* Render fields grouped by section */}
                    {sectionOrder.map((sectionKey) => {
                      const sectionFields = fieldsBySection[sectionKey] || [];
                      const typeSpecificSections =
                        typeSpecificSectionsBySection[sectionKey] || [];

                      // Skip if no fields and no type-specific sections
                      if (
                        sectionFields.length === 0 &&
                        typeSpecificSections.length === 0
                      ) {
                        return null;
                      }

                      const visibleFields = sectionFields.filter((field) =>
                        isFieldVisible(field, ruleCtx)
                      );

                      // Skip if no visible fields and no type-specific sections
                      if (
                        visibleFields.length === 0 &&
                        typeSpecificSections.length === 0
                      ) {
                        return null;
                      }

                      const sectionLabel =
                        MGF_SECTION_LABELS[sectionKey] || sectionKey;

                      return (
                        <div key={sectionKey} className="space-y-4">
                          {/* Regular fields in this section */}
                          {visibleFields.length > 0 && (
                            <div className="rounded-lg border bg-card/50 p-4 sm:p-5 shadow-sm">
                              <h4 className="text-sm sm:text-base font-semibold mb-4 text-foreground pb-2 border-b">
                                {sectionLabel}
                              </h4>
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {visibleFields.map((field) => {
                                  const required = isFieldRequired(
                                    field,
                                    ruleCtx
                                  );

                                  return (
                                    <ConsultationFieldWithLayout
                                      key={field.key}
                                      field={field}
                                      value={formValues[field.key] || ""}
                                      errorMessage={
                                        fieldError?.key === field.key
                                          ? fieldError.message
                                          : undefined
                                      }
                                      onUpdate={(value) =>
                                        updateField(field.key, value)
                                      }
                                      icpc2Codes={icpc2Codes}
                                      isRequired={required}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Type-specific sections in this section */}
                          {typeSpecificSections.length > 0 && (
                            <div className="space-y-4">
                              {typeSpecificSections.map((section) => {
                                const sectionVisible = evaluateFieldRule(
                                  section.visibleWhen,
                                  ruleCtx,
                                  true
                                );
                                if (!sectionVisible) return null;
                                return (
                                  <div
                                    key={section.label}
                                    className="rounded-lg border bg-card/40 p-4 sm:p-5 shadow-sm"
                                  >
                                    <h4 className="text-sm sm:text-base font-semibold mb-4 text-foreground pb-2 border-b">
                                      {section.label}
                                    </h4>
                                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                      {section.fields
                                        .filter((field) =>
                                          isFieldVisible(field, ruleCtx)
                                        )
                                        .map((field) => {
                                          const required = isFieldRequired(
                                            field,
                                            ruleCtx
                                          );
                                          return (
                                            <ConsultationFieldWithLayout
                                              key={field.key}
                                              field={field}
                                              value={
                                                formValues[field.key] || ""
                                              }
                                              errorMessage={
                                                fieldError?.key === field.key
                                                  ? fieldError.message
                                                  : undefined
                                              }
                                              onUpdate={(value) =>
                                                updateField(field.key, value)
                                              }
                                              icpc2Codes={icpc2Codes}
                                              isRequired={required}
                                            />
                                          );
                                        })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </form>
          </CardContent>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 z-10 pt-4 pb-4 sm:pt-5 sm:pb-5 px-4 sm:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t shadow-lg">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSaving}
                className="w-full sm:w-auto min-w-[120px]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="consultation-form"
                disabled={isSaving}
                className="w-full sm:w-auto min-w-[140px] shadow-sm"
              >
                {isSaving ? (
                  <>
                    <span className="inline-block h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    <IconCheck className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">
                      {isEditing ? "Atualizar Consulta" : "Criar Consulta"}
                    </span>
                    <span className="inline sm:hidden">
                      {isEditing ? "Atualizar" : "Criar"}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
