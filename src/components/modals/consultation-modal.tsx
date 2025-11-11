import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconX,
  IconCheck,
  IconPlus,
  IconTrash,
  IconSearch,
} from "@tabler/icons-react";
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
  getSpecialtyFields,
  getICPC2Codes,
  type SpecialtyDetails,
  type SpecialtyField,
} from "@/constants";

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
    if (isSaving) return; // Prevent closing while saving
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match the animation duration
  };

  // Get specialty-specific fields and ICPC-2 codes
  const specialtyFields = specialty ? getSpecialtyFields(specialty.code) : [];
  const icpc2Codes = specialty ? getICPC2Codes(specialty.code) : [];

  // Search state for ICPC-2 codes fields
  const [icpc2SearchTerms, setICPC2SearchTerms] = useState<
    Record<string, string>
  >({});

  const [fieldError, setFieldError] = useState<{
    key: string;
    message: string;
  } | null>(null);

  // Initialize form values dynamically
  const [formValues, setFormValues] = useState<
    Record<string, string | string[]>
  >(() => {
    const initialValues: Record<string, string | string[]> = {};

    if (isEditing && editingConsultation) {
      // Populate with existing consultation data
      COMMON_CONSULTATION_FIELDS.forEach((field) => {
        const value = (editingConsultation as Record<string, unknown>)[
          field.key
        ];
        if (field.key === "date" && value) {
          initialValues[field.key] = new Date(value as string)
            .toISOString()
            .split("T")[0];
        } else if (value !== null && value !== undefined) {
          initialValues[field.key] = String(value);
        } else {
          initialValues[field.key] = "";
        }
      });

      // Set specialty year
      initialValues["specialty_year"] = String(
        editingConsultation.specialty_year || 1
      );

      // Populate specialty fields from details
      const details =
        (editingConsultation.details as Record<string, unknown>) || {};
      specialtyFields.forEach((field) => {
        const value = details[field.key];
        if (field.type === "text-list") {
          if (typeof value === "string" && value) {
            initialValues[field.key] = value
              .split(";")
              .map((item) => item.trim());
          } else {
            initialValues[field.key] = [""];
          }
        } else if (field.type === "boolean") {
          initialValues[field.key] = value ? "true" : "false";
        } else if (value !== null && value !== undefined) {
          initialValues[field.key] = String(value);
        } else {
          initialValues[field.key] = "";
        }
      });
    } else {
      // Initialize with default values for new consultation
      COMMON_CONSULTATION_FIELDS.forEach((field) => {
        if (field.key === "date") {
          initialValues[field.key] = new Date().toISOString().split("T")[0];
        } else if (field.defaultValue !== undefined) {
          initialValues[field.key] = String(field.defaultValue);
        } else {
          initialValues[field.key] = "";
        }
      });

      // Initialize specialty_year field (default to year 1)
      initialValues["specialty_year"] = "1";

      // Initialize specialty fields
      specialtyFields.forEach((field) => {
        if (field.type === "text-list") {
          initialValues[field.key] = [""];
        } else if (field.type === "boolean") {
          initialValues[field.key] =
            field.defaultValue !== undefined
              ? String(field.defaultValue)
              : "false";
        } else if (field.defaultValue !== undefined) {
          initialValues[field.key] = String(field.defaultValue);
        } else {
          initialValues[field.key] = "";
        }
      });
    }

    return initialValues;
  });

  const showFieldError = (key: string, message: string) => {
    setFieldError({ key, message });
    requestAnimationFrame(() => {
      const element = document.getElementById(key);
      if (element instanceof HTMLElement) {
        element.focus();
        if ("scrollIntoView" in element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });
  };

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

    setFieldError(null);

    // Validation for required common fields
    const requiredCommonFields = COMMON_CONSULTATION_FIELDS.filter(
      (f) => f.required
    );
    const requiredSpecialtyFields = specialtyFields.filter((f) => f.required);
    const requiredFields = [
      ...requiredCommonFields,
      ...requiredSpecialtyFields,
    ];
    for (const field of requiredFields) {
      if (!formValues[field.key]) {
        const message = `Por favor preenche o campo ${field.label}.`;
        toast.error("Campos obrigatórios em falta", {
          description: message,
        });
        showFieldError(field.key, message);
        return;
      }
    }

    if (!specialty?.id) {
      toast.error("Especialidade não encontrada", {
        description: "Por favor seleciona uma especialidade.",
      });
      return;
    }

    const ageValue = typeof formValues.age === "string" ? formValues.age : "";
    const ageNum = parseInt(ageValue);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      const message = "A idade deve estar entre 0 e 150.";
      toast.error("Idade inválida", {
        description: message,
      });
      showFieldError("age", message);
      return;
    }

    const healthNumberValue =
      typeof formValues.health_number === "string"
        ? formValues.health_number
        : "";
    const healthNumberNum = parseInt(healthNumberValue);
    if (isNaN(healthNumberNum) || healthNumberValue.length !== 9) {
      const message = "O número de saúde deve ser um número válido.";
      toast.error("Número de saúde inválido", {
        description: message,
      });
      showFieldError("health_number", message);
      return;
    }

    const specialtyYearValue =
      typeof formValues.specialty_year === "string"
        ? formValues.specialty_year
        : "";
    const specialtyYearNum = parseInt(specialtyYearValue);
    if (isNaN(specialtyYearNum) || specialtyYearNum < 1) {
      const message = "Por favor seleciona o ano da especialidade.";
      toast.error("Ano de especialidade inválido", {
        description: message,
      });
      showFieldError("specialty_year", message);
      return;
    }

    setIsSaving(true);

    // Build specialty details dynamically
    const providedDetails: SpecialtyDetails = {};

    specialtyFields.forEach((field) => {
      const value = formValues[field.key];

      if (field.type === "text-list") {
        // Handle text-list fields
        const filteredItems = (value as string[])
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        providedDetails[field.key] =
          filteredItems.length > 0 ? filteredItems.join("; ") : null;
      } else if (field.type === "boolean") {
        // Handle boolean fields
        providedDetails[field.key] = value ? value === "true" : null;
      } else if (field.type === "number") {
        // Handle number fields
        const numValue =
          typeof value === "string" && value ? parseInt(value) : null;
        providedDetails[field.key] =
          numValue !== null && !isNaN(numValue) ? numValue : null;
      } else {
        // Handle text, textarea, select fields
        providedDetails[field.key] = value || null;
      }
    });

    // Merge with default specialty fields to ensure all fields are present
    const details = prepareConsultationDetails(specialty.code, providedDetails);

    const consultation: ConsultationInsert = {
      user_id: userId,
      specialty_id: specialty.id,
      specialty_year: specialtyYearNum,
      date: typeof formValues.date === "string" ? formValues.date : "",
      sex: typeof formValues.sex === "string" ? formValues.sex : "",
      age: ageNum,
      age_unit:
        typeof formValues.age_unit === "string" ? formValues.age_unit : "years",
      health_number: healthNumberNum,
      details,
    };

    let result;
    if (isEditing && editingConsultation) {
      result = await updateConsultation(editingConsultation.id!, consultation);
    } else {
      result = await createConsultation(consultation);
    }

    setIsSaving(false);

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
  };

  // Field renderer function
  const renderField = (field: SpecialtyField) => {
    const value = formValues[field.key];
    const fieldId = field.key;

    const errorMessage =
      fieldError?.key === field.key ? fieldError.message : undefined;
    const isInvalid = Boolean(errorMessage);

    const updateValue = (newValue: string | string[]) => {
      setFormValues((prev) => ({ ...prev, [field.key]: newValue }));
      if (fieldError?.key === field.key) {
        setFieldError(null);
      }
    };

    const labelElement = (
      <Label htmlFor={fieldId} className="text-sm">
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </Label>
    );

    switch (field.type) {
      case "text":
        if (field.key === "date") {
          return (
            <div key={fieldId} className="space-y-1.5">
              <DatePicker
                id={fieldId}
                label={field.label}
                value={typeof value === "string" ? value : ""}
                onChange={(date: string) => updateValue(date)}
                placeholder="dd/mm/aaaa"
                required={field.required}
                isInvalid={isInvalid}
                describedBy={isInvalid ? `${fieldId}-error` : undefined}
              />
              {isInvalid && (
                <p id={`${fieldId}-error`} className="text-xs text-destructive">
                  {errorMessage}
                </p>
              )}
            </div>
          );
        }
        return (
          <div key={fieldId} className="space-y-1.5">
            {labelElement}
            <Input
              id={fieldId}
              type="text"
              value={typeof value === "string" ? value : ""}
              onChange={(e) => updateValue(e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              aria-invalid={isInvalid || undefined}
              aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
            />
            {isInvalid && (
              <p id={`${fieldId}-error`} className="text-xs text-destructive">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={fieldId} className="space-y-1.5">
            {labelElement}
            <Input
              id={fieldId}
              type="number"
              value={typeof value === "string" ? value : ""}
              onChange={(e) => updateValue(e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              min="0"
              max={field.key === "age" ? "150" : "999999999"}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-invalid={isInvalid || undefined}
              aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
            />
            {isInvalid && (
              <p id={`${fieldId}-error`} className="text-xs text-destructive">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={fieldId} className="space-y-1.5">
            {labelElement}
            <Input
              id={fieldId}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => updateValue(e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              aria-invalid={isInvalid || undefined}
              aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
            />
            {isInvalid && (
              <p id={`${fieldId}-error`} className="text-xs text-destructive">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case "boolean":
        return (
          <div key={fieldId} className="space-y-1.5">
            {labelElement}
            <Select
              value={typeof value === "string" ? value : "false"}
              onValueChange={(val) => updateValue(val)}
            >
              <SelectTrigger
                id={fieldId}
                aria-invalid={isInvalid || undefined}
                aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
            {isInvalid && (
              <p id={`${fieldId}-error`} className="text-xs text-destructive">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={fieldId} className="space-y-1.5">
            {labelElement}
            <Select
              value={typeof value === "string" ? value : ""}
              onValueChange={(val) => updateValue(val)}
              required={field.required}
            >
              <SelectTrigger
                id={fieldId}
                aria-invalid={isInvalid || undefined}
                aria-describedby={isInvalid ? `${fieldId}-error` : undefined}
              >
                <SelectValue
                  placeholder={field.placeholder || `Selecionar ${field.label}`}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isInvalid && (
              <p id={`${fieldId}-error`} className="text-xs text-destructive">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case "text-list": {
        const listValue = (value || [""]) as string[];
        return (
          <div key={fieldId} className="space-y-1.5">
            {labelElement}
            <div className="space-y-2">
              {listValue.map((item, index) => (
                <div key={index} className="flex gap-1.5 sm:gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newList = [...listValue];
                      newList[index] = e.target.value;
                      updateValue(newList);
                    }}
                    placeholder={field.placeholder}
                    className="min-w-0"
                  />
                  {listValue.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newList = listValue.filter((_, i) => i !== index);
                        updateValue(newList);
                      }}
                      className="flex-shrink-0"
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateValue([...listValue, ""])}
                className="w-full"
              >
                <IconPlus className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">
                  Adicionar {field.label}
                </span>
                <span className="inline xs:hidden">Adicionar</span>
              </Button>
            </div>
          </div>
        );
      }

      case "icpc2-codes": {
        // Parse currently selected codes from semicolon-separated string
        // Format: "CODE - Description; CODE - Description"
        const stringValue = typeof value === "string" ? value : "";
        const selectedCodeEntries = stringValue
          .split(";")
          .map((c) => c.trim())
          .filter((c) => c.length > 0);

        // Extract just the codes for comparison
        const selectedCodes = selectedCodeEntries.map((entry) => {
          const match = entry.match(/^([A-Z]\d{2})/);
          return match ? match[1] : entry;
        });

        // Get search term for this field
        const searchTerm = (icpc2SearchTerms[fieldId] || "").toLowerCase();

        // Filter codes based on search term
        const filteredCodes = searchTerm
          ? icpc2Codes.filter(
              (icpc2Code) =>
                icpc2Code.code.toLowerCase().includes(searchTerm) ||
                icpc2Code.description.toLowerCase().includes(searchTerm)
            )
          : [];

        // Only show top 10 results
        const displayedCodes = filteredCodes.slice(0, 10);

        const toggleCode = (code: string, description: string) => {
          const isSelected = selectedCodes.includes(code);
          let newCodeEntries: string[];

          if (isSelected) {
            // Remove the entry
            newCodeEntries = selectedCodeEntries.filter((entry) => {
              const match = entry.match(/^([A-Z]\d{2})/);
              const entryCode = match ? match[1] : entry;
              return entryCode !== code;
            });
          } else {
            // Add new entry with format "CODE - Description"
            newCodeEntries = [
              ...selectedCodeEntries,
              `${code} - ${description}`,
            ];
          }

          updateValue(newCodeEntries.join("; "));
        };

        return (
          <div key={fieldId} className="space-y-1.5">
            {labelElement}

            {/* Selected codes */}
            {selectedCodeEntries.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-muted/50">
                {selectedCodeEntries.map((entry, idx) => {
                  const match = entry.match(/^([A-Z]\d{2})\s*-\s*(.+)$/);
                  const code = match ? match[1] : entry;
                  const description = match ? match[2] : "";

                  return (
                    <Button
                      key={`${code}-${idx}`}
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-auto py-1 px-2 text-xs max-w-full"
                      onClick={() => {
                        const codeData = icpc2Codes.find(
                          (c) => c.code === code
                        );
                        if (codeData) {
                          toggleCode(code, codeData.description);
                        }
                      }}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-mono font-semibold flex-shrink-0">
                          {code}
                        </span>
                        <span className="text-muted-foreground flex-shrink-0">
                          -
                        </span>
                        <span className="max-w-[120px] sm:max-w-[200px] truncate">
                          {description}
                        </span>
                        <IconX className="h-3 w-3 ml-1 flex-shrink-0" />
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Search input */}
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={icpc2SearchTerms[fieldId] || ""}
                onChange={(e) => {
                  setICPC2SearchTerms((prev) => ({
                    ...prev,
                    [fieldId]: e.target.value,
                  }));
                }}
                placeholder={field.placeholder}
                className="pl-9"
              />
            </div>

            {/* Search results */}
            {searchTerm && (
              <div className="border rounded-md max-h-60 overflow-y-auto">
                {displayedCodes.length > 0 ? (
                  <div className="divide-y">
                    {displayedCodes.map((icpc2Code) => {
                      const isSelected = selectedCodes.includes(icpc2Code.code);
                      return (
                        <button
                          key={icpc2Code.code}
                          type="button"
                          className={`w-full text-left px-2 sm:px-3 py-2 hover:bg-muted/50 transition-colors ${
                            isSelected ? "bg-primary/10" : ""
                          }`}
                          onClick={() =>
                            toggleCode(icpc2Code.code, icpc2Code.description)
                          }
                        >
                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <code className="font-mono text-xs sm:text-sm font-semibold text-primary min-w-[2.5rem] sm:min-w-[3rem] flex-shrink-0">
                              {icpc2Code.code}
                            </code>
                            <span className="text-xs sm:text-sm flex-1 min-w-0 break-words">
                              {icpc2Code.description}
                            </span>
                            {isSelected && (
                              <IconCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-2 sm:px-3 py-4 text-xs sm:text-sm text-muted-foreground text-center">
                    Nenhum código encontrado
                  </div>
                )}
                {filteredCodes.length > 10 && (
                  <div className="px-2 sm:px-3 py-2 text-xs text-muted-foreground border-t bg-muted/30 text-center">
                    Mostrando 10 de {filteredCodes.length} resultados. Refine a
                    pesquisa.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 duration-200 ${
          isClosing ? "animate-out fade-out" : "animate-in fade-in"
        }`}
        onClick={handleClose}
      />

      {/* Modal Container - slides from bottom on mobile, centered on desktop */}
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
          <CardContent className="px-3 sm:px-6 pt-3 sm:pt-4 pb-2 overflow-y-auto flex-1">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-3 sm:space-y-4 h-full"
            >
              {/* Basic Information */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">
                  Informação Básica
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  {COMMON_CONSULTATION_FIELDS.map((field) => {
                    const fieldElement = renderField(field);
                    // Handle fields that should span 2 columns
                    if (
                      field.type === "textarea" ||
                      field.type === "text-list"
                    ) {
                      return (
                        <div key={field.key} className="sm:col-span-2">
                          {fieldElement}
                        </div>
                      );
                    }
                    return fieldElement;
                  })}

                  {/* Specialty Year Selector */}
                  {specialty && specialty.years > 1 && (
                    <div className="space-y-1.5">
                      <Label htmlFor="specialty_year" className="text-sm">
                        Ano da Especialidade
                        <span className="text-destructive"> *</span>
                      </Label>
                      <Select
                        value={
                          typeof formValues.specialty_year === "string"
                            ? formValues.specialty_year
                            : "1"
                        }
                        onValueChange={(val) => {
                          if (fieldError?.key === "specialty_year") {
                            setFieldError(null);
                          }
                          setFormValues((prev) => ({
                            ...prev,
                            specialty_year: val,
                          }));
                        }}
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
                          className="text-xs text-destructive"
                        >
                          {fieldError.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {specialtyFields.length > 0 && (
                <>
                  <Separator />

                  {/* Specialty-specific fields */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-3">
                      Detalhes da Consulta
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                      {specialtyFields.map((field) => {
                        const fieldElement = renderField(field);
                        // Handle fields that should span 2 columns
                        if (
                          field.type === "textarea" ||
                          field.type === "text-list" ||
                          [
                            "diagnosis",
                            "problems",
                            "new_diagnosis",
                            "notes",
                          ].includes(field.key)
                        ) {
                          return (
                            <div key={field.key} className="sm:col-span-2">
                              {fieldElement}
                            </div>
                          );
                        }
                        return fieldElement;
                      })}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pb-2">
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
