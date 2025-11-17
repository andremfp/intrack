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
import { toast } from "sonner";
import {
  createConsultation,
  updateConsultation,
  prepareConsultationDetails,
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
import { useConsultationForm } from "@/hooks/use-consultation-form";
import {
  validateForm,
  serializeFormValues,
} from "@/utils/consultation-form-utils";
import { ConsultationFieldWithLayout } from "@/components/forms/consultation/consultation-form";

// TODO: understand this. Check section values validations

interface ConsultationModalProps {
  userId: string;
  specialty: Specialty | null;
  editingConsultation?: ConsultationMGF | null;
  onClose: () => void;
  onConsultationSaved?: () => void;
}

export function ConsultationModal({
  userId,
  specialty,
  editingConsultation,
  onClose,
  onConsultationSaved,
}: ConsultationModalProps) {
  const isEditing = !!editingConsultation;
  const [isSaving, setIsSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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
    sectionsForSelectedType,
    fieldsBySection,
    sectionOrder,
    specialtyFields,
  } = useConsultationForm(specialty?.code || null, editingConsultation);

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

    setIsSaving(true);

    try {
      const details = prepareConsultationDetails(
        specialty!.code,
        serializeFormValues(formValues, specialtyFields)
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
        toast.error(`Erro ao ${isEditing ? "atualizar" : "criar"} consulta`, {
          description: result.error.userMessage,
        });
        return;
      }

      toast.success(
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
          className={`w-full h-[95vh] sm:h-auto py-0 sm:max-w-4xl sm:max-h-[92vh] overflow-hidden flex flex-col gap-0 sm:rounded-xl rounded-b-none rounded-t-xl pointer-events-auto duration-300 shadow-2xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 ${
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
          <CardContent className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 overflow-y-auto flex-1">
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
                      // Special handling for age field - combine with age_unit
                      if (field.key === "age") {
                        const ageUnitField = COMMON_CONSULTATION_FIELDS.find(
                          (f) => f.key === "age_unit"
                        );
                        return (
                          <div key={field.key} className="space-y-2">
                            <Label
                              htmlFor={field.key}
                              className="text-sm font-medium"
                            >
                              {field.label}
                              {field.required && (
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
                                required={field.required}
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
                                  required={ageUnitField.required}
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
                          value={
                            typeof formValues.specialty_year === "string"
                              ? formValues.specialty_year
                              : "1"
                          }
                          onValueChange={(val) =>
                            updateField("specialty_year", val)
                          }
                          required
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
                      if (sectionFields.length === 0) return null;

                      // Filter out internship field when location is 'health_unit'
                      const visibleFields = sectionFields.filter((field) => {
                        if (field.key === "internship") {
                          return formValues.location !== "health_unit";
                        }
                        return true;
                      });

                      if (visibleFields.length === 0) return null;

                      const sectionLabel =
                        MGF_SECTION_LABELS[sectionKey] || sectionKey;

                      return (
                        <div
                          key={sectionKey}
                          className="rounded-lg border bg-card/50 p-4 sm:p-5 shadow-sm"
                        >
                          <h4 className="text-sm sm:text-base font-semibold mb-4 text-foreground pb-2 border-b">
                            {sectionLabel}
                          </h4>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {visibleFields.map((field) => (
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
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Type-specific sections (e.g., DM exams) */}
                    {sectionsForSelectedType.length > 0 && (
                      <div className="space-y-4">
                        {sectionsForSelectedType.map((section) => (
                          <div
                            key={section.label}
                            className="rounded-lg border bg-card/40 p-4 sm:p-5 shadow-sm"
                          >
                            <h4 className="text-sm sm:text-base font-semibold mb-4 text-foreground pb-2 border-b">
                              {section.label}
                            </h4>
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                              {section.fields.map((field) => (
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
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
