import { toasts } from "@/utils/toasts";
import type { FieldRule, FieldRuleContext, SpecialtyField } from "@/constants";
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

export function buildFieldRuleContext(formValues: FormValues): FieldRuleContext {
  return {
    location: typeof formValues.location === "string" ? formValues.location : "",
    sex: typeof formValues.sex === "string" ? formValues.sex : "",
    type: typeof formValues.type === "string" ? formValues.type : "",
  };
}

export function evaluateFieldRule(
  rule: FieldRule | undefined,
  ctx: FieldRuleContext,
  defaultValue: boolean
): boolean {
  if (rule === undefined) return defaultValue;
  if (rule === "always") return true;
  if (rule === "never") return false;
  return rule(ctx);
}

export function isFieldVisible(field: SpecialtyField, ctx: FieldRuleContext): boolean {
  return evaluateFieldRule(field.visibleWhen, ctx, true);
}

export function isFieldRequired(field: SpecialtyField, ctx: FieldRuleContext): boolean {
  return evaluateFieldRule(field.requiredWhen, ctx, false);
}

function getAllRequiredFields(
  specialtyFields: SpecialtyField[],
  consultationType?: string,
  formValues?: FormValues
): SpecialtyField[] {
  const ctx = formValues ? buildFieldRuleContext(formValues) : {};

  const requiredFields = [
    ...COMMON_CONSULTATION_FIELDS.filter(
      (f) => isFieldRequired(f, ctx) && isFieldVisible(f, ctx)
    ),
    ...specialtyFields.filter(
      (f) => isFieldRequired(f, ctx) && isFieldVisible(f, ctx)
    ),
  ];

  resolveTypeSections(consultationType).forEach((section) => {
    const sectionVisible = evaluateFieldRule(
      section.visibleWhen,
      ctx,
      true
    );
    if (!sectionVisible) return;

    section.fields
      .filter((field) => isFieldRequired(field, ctx) && isFieldVisible(field, ctx))
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

  return null;
}

function serializeFieldValue(
  field: SpecialtyField,
  value: string | string[]
): SpecialtyDetails[string] {
  if (field.type === "text-list") {
    const filteredItems = (Array.isArray(value) ? value : [])
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    return filteredItems.length > 0 ? filteredItems : null;
  }

  if (field.type === "icpc2-codes") {
    const filteredItems = (Array.isArray(value) ? value : [])
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    return filteredItems.length > 0 ? filteredItems : null;
  }

  if (field.type === "boolean") {
    // Empty string or empty array means null (optional field not selected)
    if (typeof value === "string" && value === "") {
      return null;
    }
    if (Array.isArray(value) && value.length === 0) {
      return null;
    }
    // Convert "true" string to boolean true, anything else to false
    return typeof value === "string" ? value === "true" : null;
  }

  if (field.type === "number") {
    const numValue = typeof value === "string" && value ? Number(value) : null;
    return numValue !== null && Number.isFinite(numValue) ? numValue : null;
  }

  if (field.type === "multi-select") { // array of strings
    const filteredItems = (Array.isArray(value) ? value : [])
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
    return filteredItems.length > 0 ? filteredItems : null;
  }

  return typeof value === "string" && value.length > 0 ? value : null; // string or null
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

  // Add nested structures only if they have values, keeping the {type}.{section}.{field} shape
  if (consultationType) {
    const typeKey = consultationType.toLowerCase();
    const typeSections = nestedStructures[typeKey];
    if (typeSections) {
      const includedSections: Record<string, Record<string, SpecialtyDetails[string]>> =
        {};

      Object.entries(typeSections).forEach(([sectionKey, sectionData]) => {
        const hasValues = Object.values(sectionData).some((field) => field !== null);
        if (hasValues) {
          includedSections[sectionKey] = sectionData;
        }
      });

      if (Object.keys(includedSections).length > 0) {
        (details as Record<string, unknown>)[typeKey] = includedSections;
      }
    }
  }

  return details;
}
