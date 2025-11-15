import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { COMMON_CONSULTATION_FIELDS, getICPC2Codes } from "@/constants";
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
    primarySpecialtyFields,
    remainingSpecialtyFields,
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
        health_number: parseInt(formValues.health_number as string, 10),
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
          className={`w-full h-[95vh] sm:h-auto py-0 sm:max-w-3xl sm:max-h-[90vh] overflow-hidden flex flex-col gap-0 sm:rounded-lg rounded-b-none rounded-t-xl pointer-events-auto duration-300 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 ${
            isClosing
              ? "animate-out slide-out-to-bottom sm:slide-out-to-bottom-0 sm:zoom-out-95"
              : "animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95"
          }`}
        >
          <CardHeader className="pt-2.5 !pb-2 sm:pt-2 sm:!pb-2 px-3 sm:px-6 flex flex-row items-center justify-between flex-shrink-0 bg-background z-10 border-b">
            <CardTitle className="text-base sm:text-lg">
              {isEditing ? "Editar Consulta" : "Nova Consulta"}
              <span className="hidden sm:inline">
                {" "}
                - {specialty?.name || "MGF"}
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isSaving}
              className="flex-shrink-0"
            >
              <IconX className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-4 sm:pt-6 pb-4 overflow-y-auto flex-1">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-6 sm:space-y-8 h-full"
            >
              {/* Basic Information */}
              <section className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Informação Básica
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Dados gerais do doente e da consulta
                  </p>
                </div>
                <div className="rounded-lg border bg-card/50 p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                    {COMMON_CONSULTATION_FIELDS.map((field) => (
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
                    ))}

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
                <section className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                      Detalhes da Consulta
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Informações específicas da especialidade
                    </p>
                  </div>

                  <div className="space-y-6">
                    {primarySpecialtyFields.length > 0 && (
                      <div className="rounded-lg border bg-card/50 p-4 sm:p-5">
                        <div
                          className="grid grid-cols-2 gap-4 sm:gap-5"
                          style={{ gridTemplateColumns: "1fr 1fr" }}
                        >
                          {primarySpecialtyFields.map((field) => (
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
                    )}

                    {sectionsForSelectedType.length > 0 && (
                      <div className="space-y-5">
                        {sectionsForSelectedType.map((section) => (
                          <div
                            key={section.label}
                            className="rounded-lg border bg-card/30 p-4 sm:p-5"
                          >
                            <h4 className="text-sm font-semibold mb-4 text-foreground">
                              {section.label}
                            </h4>
                            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-5">
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
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {remainingSpecialtyFields.length > 0 && (
                      <div className="rounded-lg border bg-card/50 p-4 sm:p-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                          {remainingSpecialtyFields.map((field) => (
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
                    )}
                  </div>
                </section>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  {isSaving ? (
                    "A guardar..."
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
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
