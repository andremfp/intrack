import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  prepareConsultationDetails,
} from "@/lib/api/consultations";
import type { ConsultationInsert } from "@/lib/api/consultations";
import type { Specialty } from "@/lib/api/specialties";
import {
  COMMON_CONSULTATION_FIELDS,
  getSpecialtyFields,
  getICPC2Codes,
  type SpecialtyDetails,
  type SpecialtyField,
} from "@/lib/constants";

interface ConsultationModalProps {
  userId: string;
  specialty: Specialty | null;
  onClose: () => void;
  onConsultationCreated?: () => void;
}

export function ConsultationModal({
  userId,
  specialty,
  onClose,
  onConsultationCreated,
}: ConsultationModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Get specialty-specific fields and ICPC-2 codes
  const specialtyFields = specialty ? getSpecialtyFields(specialty.code) : [];
  const icpc2Codes = specialty ? getICPC2Codes(specialty.code) : [];

  // Search state for ICPC-2 codes fields
  const [icpc2SearchTerms, setICPC2SearchTerms] = useState<
    Record<string, string>
  >({});

  // Initialize form values dynamically
  const [formValues, setFormValues] = useState<
    Record<string, string | string[]>
  >(() => {
    const initialValues: Record<string, string | string[]> = {};

    // Initialize common fields
    COMMON_CONSULTATION_FIELDS.forEach((field) => {
      if (field.key === "date") {
        initialValues[field.key] = new Date().toISOString().split("T")[0];
      } else if (field.defaultValue !== undefined) {
        initialValues[field.key] = String(field.defaultValue);
      } else {
        initialValues[field.key] = "";
      }
    });

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

    return initialValues;
  });

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

    // Validation for required common fields
    const requiredCommonFields = COMMON_CONSULTATION_FIELDS.filter(
      (f) => f.required
    );
    for (const field of requiredCommonFields) {
      if (!formValues[field.key]) {
        toast.error("Campos obrigatórios em falta", {
          description: `Por favor preencha o campo ${field.label}.`,
        });
        return;
      }
    }

    if (!specialty?.id) {
      toast.error("Especialidade não encontrada", {
        description: "Por favor selecione uma especialidade.",
      });
      return;
    }

    const ageValue = typeof formValues.age === "string" ? formValues.age : "";
    const ageNum = parseInt(ageValue);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      toast.error("Idade inválida", {
        description: "A idade deve estar entre 0 e 150.",
      });
      return;
    }

    const healthNumberValue =
      typeof formValues.health_number === "string"
        ? formValues.health_number
        : "";
    const healthNumberNum = parseInt(healthNumberValue);
    if (isNaN(healthNumberNum)) {
      toast.error("Número de saúde inválido", {
        description: "O número de saúde deve ser um número válido.",
      });
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
      date: typeof formValues.date === "string" ? formValues.date : "",
      sex: typeof formValues.sex === "string" ? formValues.sex : "",
      age: ageNum,
      health_number: healthNumberNum,
      details,
    };

    const result = await createConsultation(consultation);

    setIsSaving(false);

    if (!result.success) {
      toast.error("Erro ao criar consulta", {
        description: result.error.userMessage,
      });
      return;
    }

    toast.success("Consulta criada com sucesso!");
    onConsultationCreated?.();
    onClose();
  };

  // Field renderer function
  const renderField = (field: SpecialtyField) => {
    const value = formValues[field.key];
    const fieldId = field.key;

    const updateValue = (newValue: string | string[]) => {
      setFormValues((prev) => ({ ...prev, [field.key]: newValue }));
    };

    const labelElement = (
      <Label htmlFor={fieldId}>
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </Label>
    );

    switch (field.type) {
      case "text":
        if (field.key === "date") {
          return (
            <div key={fieldId} className="space-y-2">
              {labelElement}
              <Input
                id={fieldId}
                type="date"
                value={typeof value === "string" ? value : ""}
                onChange={(e) => updateValue(e.target.value)}
                required={field.required}
              />
            </div>
          );
        }
        return (
          <div key={fieldId} className="space-y-2">
            {labelElement}
            <Input
              id={fieldId}
              type="text"
              value={typeof value === "string" ? value : ""}
              onChange={(e) => updateValue(e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );

      case "number":
        return (
          <div key={fieldId} className="space-y-2">
            {labelElement}
            <Input
              id={fieldId}
              type="number"
              value={typeof value === "string" ? value : ""}
              onChange={(e) => updateValue(e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              min={field.key === "age" ? "0" : undefined}
              max={field.key === "age" ? "150" : undefined}
            />
          </div>
        );

      case "textarea":
        return (
          <div key={fieldId} className="space-y-2">
            {labelElement}
            <Input
              id={fieldId}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => updateValue(e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );

      case "boolean":
        return (
          <div key={fieldId} className="space-y-2">
            {labelElement}
            <Select
              value={typeof value === "string" ? value : "false"}
              onValueChange={(val) => updateValue(val)}
            >
              <SelectTrigger id={fieldId}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "select":
        return (
          <div key={fieldId} className="space-y-2">
            {labelElement}
            <Select
              value={typeof value === "string" ? value : ""}
              onValueChange={(val) => updateValue(val)}
              required={field.required}
            >
              <SelectTrigger id={fieldId}>
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
          </div>
        );

      case "text-list": {
        const listValue = (value || [""]) as string[];
        return (
          <div key={fieldId} className="space-y-2">
            {labelElement}
            <div className="space-y-2">
              {listValue.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newList = [...listValue];
                      newList[index] = e.target.value;
                      updateValue(newList);
                    }}
                    placeholder={field.placeholder}
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
                Adicionar {field.label}
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
          <div key={fieldId} className="space-y-2">
            {labelElement}

            {/* Selected codes */}
            {selectedCodeEntries.length > 0 && (
              <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/50">
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
                      className="h-auto py-1 px-2 text-xs"
                      onClick={() => {
                        const codeData = icpc2Codes.find(
                          (c) => c.code === code
                        );
                        if (codeData) {
                          toggleCode(code, codeData.description);
                        }
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-semibold">{code}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="max-w-[200px] truncate">
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
                          className={`w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors ${
                            isSelected ? "bg-primary/10" : ""
                          }`}
                          onClick={() =>
                            toggleCode(icpc2Code.code, icpc2Code.description)
                          }
                        >
                          <div className="flex items-start gap-2">
                            <code className="font-mono text-sm font-semibold text-primary min-w-[3rem]">
                              {icpc2Code.code}
                            </code>
                            <span className="text-sm flex-1">
                              {icpc2Code.description}
                            </span>
                            {isSelected && (
                              <IconCheck className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                    Nenhum código encontrado
                  </div>
                )}
                {filteredCodes.length > 10 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground border-t bg-muted/30 text-center">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Card className="w-full pt-0 max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="py-2 flex flex-row items-center justify-between sticky top-0 bg-background z-10">
          <CardTitle>Nova Consulta - {specialty?.name || "MGF"}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isSaving}
          >
            <IconX className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Informação Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMMON_CONSULTATION_FIELDS.map((field) => {
                  const fieldElement = renderField(field);
                  // Handle fields that should span 2 columns
                  if (field.type === "textarea" || field.type === "text-list") {
                    return (
                      <div key={field.key} className="md:col-span-2">
                        {fieldElement}
                      </div>
                    );
                  }
                  return fieldElement;
                })}
              </div>
            </div>

            {specialtyFields.length > 0 && (
              <>
                <Separator />

                {/* Specialty-specific fields */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Detalhes da Consulta
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <div key={field.key} className="md:col-span-2">
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
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  "A guardar..."
                ) : (
                  <>
                    <IconCheck className="h-4 w-4 mr-2" />
                    Criar Consulta
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
