import { toasts } from "@/utils/toasts";
import type { SpecialtyField } from "@/constants";
import {
  COMMON_CONSULTATION_FIELDS,
  MGF_CONSULTATION_TYPE_SECTIONS,
  type SpecialtyDetails,
} from "@/constants";
import type { FormValues, FieldError } from "@/hooks/consultations/types";

export function resolveTypeSections(typeValue: string | null | undefined) {
  if (!typeValue) return [];
  // Handle case-insensitive lookup (DM -> dm)
  const normalizedType = typeValue.toLowerCase();
  return MGF_CONSULTATION_TYPE_SECTIONS[normalizedType] || [];
}

function getAllRequiredFields(
  specialtyFields: SpecialtyField[],
  consultationType?: string,
  formValues?: FormValues
): SpecialtyField[] {
  const requiredFields = [
    ...COMMON_CONSULTATION_FIELDS.filter((f) => f.required),
    ...specialtyFields.filter((f) => {
      // Internship is only required when location is not 'health_unit' and not 'other'
      if (f.key === "internship") {
        const location = formValues?.location;
        return location && location !== "health_unit" && location !== "other";
      }
      // Type is only required when location is 'health_unit'
      if (f.key === "type") {
        const location = formValues?.location;
        return location === "health_unit";
      }
      return f.required;
    }),
  ];

  resolveTypeSections(consultationType).forEach((section) => {
    section.fields
      .filter((field) => field.required)
      .forEach((field) => requiredFields.push(field));
  });

  return requiredFields;
}

function isEmpty(value: string | string[] | undefined): boolean {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) {
    return value.every((item) => !item?.trim());
  }
  return typeof value === "string" && value.trim() === "";
}

function getStringValue(formValues: FormValues, key: string): string {
  const value = formValues[key];
  return typeof value === "string" ? value.trim() : "";
}

function parseIntSafe(value: string): number | null {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? null : num;
}

export function validateForm(
  formValues: FormValues,
  specialtyFields: SpecialtyField[],
  specialtyId: string | null
): FieldError | null {
  const consultationType =
    typeof formValues.type === "string" ? formValues.type : undefined;
  const requiredFields = getAllRequiredFields(
    specialtyFields,
    consultationType,
    formValues
  );

  // Check required fields
  for (const field of requiredFields) {
    if (isEmpty(formValues[field.key])) {
      const message = `Por favor preenche o campo ${field.label}.`;
      toasts.error("Campos obrigatórios em falta", message);
      return { key: field.key, message };
    }
  }

  if (!specialtyId) {
    toasts.error(
      "Especialidade não encontrada",
      "Por favor seleciona uma especialidade."
    );
    return { key: "specialty", message: "Especialidade não encontrada" };
  }

  // Validate age (0-150 inclusive)
  const ageValue = getStringValue(formValues, "age");
  const ageNum = parseIntSafe(ageValue);
  if (ageNum === null || ageNum < 0 || ageNum > 150) {
    toasts.error("Idade inválida", "A idade deve estar entre 0 e 150.");
    return { key: "age", message: "A idade deve estar entre 0 e 150." };
  }

  // Validate process number (9 digits)
  const processNumberValue = getStringValue(formValues, "process_number");
  const processNumberNum = parseIntSafe(processNumberValue);
  if (processNumberValue.length > 9) {
    toasts.error(
      "Número de processo inválido",
      "O número de processo tem um máximo de 9 dígitos."
    );
    return { key: "process_number", message: "O número de processo deve ser um número válido." };
  }
  if (processNumberNum === null || processNumberNum < 0) {
    toasts.error(
      "Número de processo inválido",
      "O número de processo deve ser um número válido."
    );
    return { key: "process_number", message: "O número de processo deve ser um número válido." };
  }

  // Validate specialty year (>= 1)
  const specialtyYearValue = getStringValue(formValues, "specialty_year");
  const specialtyYearNum = parseIntSafe(specialtyYearValue);
  if (specialtyYearNum === null || specialtyYearNum < 1) {
    toasts.error(
      "Ano de especialidade inválido",
      "Por favor seleciona o ano da especialidade."
    );
    return {
      key: "specialty_year",
      message: "Por favor seleciona o ano da especialidade.",
    };
  }

  // Validate exams inputs

  return null;
}

function serializeFieldValue(
  field: SpecialtyField,
  value: string | string[]
): SpecialtyDetails[string] {
  if (field.type === "text-list") {
    const filteredItems = (value as string[])
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return filteredItems.length > 0 ? filteredItems.join("; ") : null;
  }

  if (field.type === "boolean") {
    return typeof value === "string" ? value === "true" : null;
  }

  if (field.type === "number") {
    const numValue = typeof value === "string" && value ? Number(value) : null;
    return numValue !== null && Number.isFinite(numValue) ? numValue : null;
  }

  return typeof value === "string" && value.length > 0 ? value : null;
}

export function serializeFormValues(
  formValues: FormValues,
  specialtyFields: SpecialtyField[]
): SpecialtyDetails {
  const details: SpecialtyDetails = {};
  const consultationType =
    typeof formValues.type === "string" ? formValues.type : undefined;

  // Serialize specialty fields
  specialtyFields.forEach((field) => {
    details[field.key] = serializeFieldValue(field, formValues[field.key] || "");
  });

  // Serialize type-specific section fields
  const sections = resolveTypeSections(consultationType);
  const nestedStructures: Record<
    string,
    Record<string, Record<string, SpecialtyDetails[string]>>
  > = {};

  sections.forEach((section) => {
    if (section.key && consultationType) {
      // Nested structure: {type}.{section.key}.{field.key}
      const typeKey = consultationType.toLowerCase();
      if (!nestedStructures[typeKey]) {
        nestedStructures[typeKey] = {};
      }
      if (!nestedStructures[typeKey][section.key]) {
        nestedStructures[typeKey][section.key] = {};
      }

      section.fields.forEach((field) => {
        nestedStructures[typeKey][section.key][field.key] = serializeFieldValue(
          field,
          formValues[field.key] || ""
        );
      });
    } else {
      // Flat structure
      section.fields.forEach((field) => {
        details[field.key] = serializeFieldValue(field, formValues[field.key] || "");
      });
    }
  });

  // Add nested structures only if they have values
  Object.entries(nestedStructures).forEach(([typeKey, sections]) => {
    const hasValues = Object.values(sections).some((sectionFields) =>
      Object.values(sectionFields).some((v) => v !== null)
    );
    if (hasValues) {
      (details as Record<string, unknown>)[typeKey] = sections;
    }
  });

  return details;
}
