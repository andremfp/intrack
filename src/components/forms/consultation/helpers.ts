import { toasts } from "@/utils/toasts";
import type {
  ConstultationTypeSection,
  FieldRule,
  FieldRuleContext,
  ReferrenceEntry,
  SpecialtyField,
} from "@/constants";
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

export function buildFieldRuleContext(
  formValues: FormValues,
): FieldRuleContext {
  // Convert boolean string values to actual booleans
  const ownListValue = formValues.own_list;
  const ownListBoolean =
    typeof ownListValue === "string" && ownListValue === "true"
      ? true
      : typeof ownListValue === "string" && ownListValue === "false"
        ? false
        : undefined;

  return {
    location:
      typeof formValues.location === "string" ? formValues.location : "",
    sex: typeof formValues.sex === "string" ? formValues.sex : "",
    type: typeof formValues.type === "string" ? formValues.type : "",
    own_list: ownListBoolean,
  };
}

export function evaluateFieldRule(
  rule: FieldRule | undefined,
  ctx: FieldRuleContext,
  defaultValue: boolean,
): boolean {
  if (rule === undefined) return defaultValue;
  if (rule === "always") return true;
  if (rule === "never") return false;
  return rule(ctx);
}

export function isFieldVisible(
  field: SpecialtyField,
  ctx: FieldRuleContext,
): boolean {
  return evaluateFieldRule(field.visibleWhen, ctx, true);
}

export function isFieldRequired(
  field: SpecialtyField,
  ctx: FieldRuleContext,
): boolean {
  return evaluateFieldRule(field.requiredWhen, ctx, false);
}

function getAllRequiredFields(
  specialtyFields: SpecialtyField[],
  consultationType?: string,
  formValues?: FormValues,
): SpecialtyField[] {
  const ctx = formValues ? buildFieldRuleContext(formValues) : {};

  const requiredFields = [
    ...COMMON_CONSULTATION_FIELDS.filter(
      (f) => isFieldRequired(f, ctx) && isFieldVisible(f, ctx),
    ),
    ...specialtyFields.filter(
      (f) => isFieldRequired(f, ctx) && isFieldVisible(f, ctx),
    ),
  ];

  resolveTypeSections(consultationType).forEach((section) => {
    const sectionVisible = evaluateFieldRule(section.visibleWhen, ctx, true);
    if (!sectionVisible) return;

    section.fields
      .filter(
        (field) => isFieldRequired(field, ctx) && isFieldVisible(field, ctx),
      )
      .forEach((field) => requiredFields.push(field));
  });

  return requiredFields;
}

function isEmpty(
  value: string | string[] | ReferrenceEntry[] | undefined,
): boolean {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) {
    // ReferrenceEntry[] is empty when the array has no entries
    if (value.length === 0) return true;
    // string[] is empty when every item is blank
    if (typeof value[0] === "string") {
      return (value as string[]).every((item) => !item?.trim());
    }
    return false;
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
  specialtyId: string | null,
): FieldError | null {
  const consultationType =
    typeof formValues.type === "string" ? formValues.type : undefined;
  const requiredFields = getAllRequiredFields(
    specialtyFields,
    consultationType,
    formValues,
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
      "Por favor seleciona uma especialidade.",
    );
    return { key: "specialty", message: "Especialidade não encontrada" };
  }

  // Validate age (1-150 inclusive)
  const ageValue = getStringValue(formValues, "age");
  const ageNum = parseIntSafe(ageValue);
  if (ageNum === null || ageNum < 1 || ageNum > 150) {
    toasts.error("Idade inválida", "A idade deve estar entre 1 e 150.");
    return { key: "age", message: "A idade deve estar entre 1 e 150." };
  }

  // Validate process number: 3–9 digits, preserving leading zeros
  const processNumberValue = getStringValue(formValues, "process_number");
  if (processNumberValue.length < 3 || processNumberValue.length > 9) {
    toasts.error(
      "Número de processo inválido",
      "O número de processo deve ter entre 3 e 9 dígitos.",
    );
    return {
      key: "process_number",
      message: "O número de processo deve ter entre 3 e 9 dígitos.",
    };
  }
  if (!/^\d+$/.test(processNumberValue)) {
    toasts.error(
      "Número de processo inválido",
      "O número de processo deve ser um número válido.",
    );
    return {
      key: "process_number",
      message: "O número de processo deve ser um número válido.",
    };
  }

  // Validate specialty year (>= 1)
  const specialtyYearValue = getStringValue(formValues, "specialty_year");
  const specialtyYearNum = parseIntSafe(specialtyYearValue);
  if (specialtyYearNum === null || specialtyYearNum < 1) {
    toasts.error(
      "Ano de especialidade inválido",
      "Por favor seleciona o ano da especialidade.",
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
  value: string | string[] | ReferrenceEntry[],
): SpecialtyDetails[string] {
  // Referrence-list fields: pass through the ReferrenceEntry[] directly
  if (field.type === "referrence-list") {
    const entries = Array.isArray(value) ? (value as ReferrenceEntry[]) : [];
    return entries.length > 0 ? entries : null;
  }

  if (field.type === "text-list") {
    const filteredItems = (Array.isArray(value) ? (value as string[]) : [])
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

  if (field.type === "multi-select") {
    // array of strings
    const filteredItems = (Array.isArray(value) ? value : [])
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
    return filteredItems.length > 0 ? filteredItems : null;
  }

  // Handle code-search fields (ICPC2 codes, professions, etc.)
  // Can be single (string) or multiple (array of strings)
  if (field.type === "code-search") {
    if (Array.isArray(value)) {
      // Multiple selection mode (e.g., ICPC2 codes)
      const filteredItems = value
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);
      return filteredItems.length > 0 ? filteredItems : null;
    }
    // Single selection mode (e.g., profession)
    return typeof value === "string" && value.length > 0 ? value : null;
  }

  return typeof value === "string" && value.length > 0 ? value : null; // string or null
}

export type ClearedItems = {
  /** Specialty-level fields (e.g. Tipologia, Lista Própria) that will be cleared. */
  fields: SpecialtyField[];
  /** Type-specific sections (e.g. "Diabetes - Exames") that have values and won't be serialized. */
  sections: ConstultationTypeSection[];
};

/**
 * Returns the specialty fields and type-specific sections that currently have
 * non-empty values but would be cleared on the next submit.
 *
 * Used to warn the user before submitting an update that would destroy data.
 */
export function getFieldsThatWouldBeCleared(
  formValues: FormValues,
  specialtyFields: SpecialtyField[],
): ClearedItems {
  const ctx = buildFieldRuleContext(formValues);
  const fields: SpecialtyField[] = [];

  // 1. Check specialty-level fields (e.g. type, own_list, contraceptive…)
  specialtyFields.forEach((field) => {
    if (!isFieldVisible(field, ctx) && !isEmpty(formValues[field.key])) {
      fields.push(field);
    }
  });

  // 2. Determine the effective type for the next serialization.
  //    If 'type' itself will be cleared, serializeFormValues will receive an empty
  //    type, which means resolveTypeSections("") = [] and no sections will be written.
  const typeWillBeCleared = fields.some((f) => f.key === "type");
  const effectiveType = typeWillBeCleared ? "" : ctx.type;

  // 3. Build the set of field keys that WILL be serialized in the next update.
  const willBeSerializedKeys = new Set<string>();
  resolveTypeSections(effectiveType).forEach((section) => {
    const sectionVisible = evaluateFieldRule(section.visibleWhen, ctx, true);
    if (!sectionVisible) return;
    section.fields.forEach((field) => {
      if (isFieldVisible(field, ctx)) {
        willBeSerializedKeys.add(field.key);
      }
    });
  });

  // 4. Find sections whose data will be lost.
  //    Primary source: sections for the current type — these are what the user filled in.
  //    Fallback: all sections across all types when the current type has no sections
  //    (e.g. switching to SIJ) so orphaned data from the previous type is still surfaced.
  const sourceForSectionSearch =
    resolveTypeSections(ctx.type).length > 0
      ? resolveTypeSections(ctx.type)
      : Object.values(MGF_CONSULTATION_TYPE_SECTIONS).flat();

  const seenSectionLabels = new Set<string>();
  const sections: ConstultationTypeSection[] = [];

  sourceForSectionSearch.forEach((section) => {
    // Deduplicate by label — HTA sections share the same label across DM/HTA/SA
    if (seenSectionLabels.has(section.label)) return;
    const hasOrphanedValues = section.fields.some(
      (f) => !willBeSerializedKeys.has(f.key) && !isEmpty(formValues[f.key]),
    );
    if (hasOrphanedValues) {
      seenSectionLabels.add(section.label);
      sections.push(section);
    }
  });

  return { fields, sections };
}

export function serializeFormValues(
  formValues: FormValues,
  specialtyFields: SpecialtyField[],
): SpecialtyDetails {
  const details: SpecialtyDetails = {};
  const consultationType =
    typeof formValues.type === "string" ? formValues.type : undefined;

  // Serialize specialty fields
  specialtyFields.forEach((field) => {
    details[field.key] = serializeFieldValue(
      field,
      formValues[field.key] || "",
    );
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
          formValues[field.key] || "",
        );
      });
    } else {
      // Flat structure
      section.fields.forEach((field) => {
        details[field.key] = serializeFieldValue(
          field,
          formValues[field.key] || "",
        );
      });
    }
  });

  // Add nested structures only if they have values, keeping the {type}.{section}.{field} shape
  if (consultationType) {
    const typeKey = consultationType.toLowerCase();
    const typeSections = nestedStructures[typeKey];
    if (typeSections) {
      const includedSections: Record<
        string,
        Record<string, SpecialtyDetails[string]>
      > = {};

      Object.entries(typeSections).forEach(([sectionKey, sectionData]) => {
        const hasValues = Object.values(sectionData).some(
          (field) => field !== null,
        );
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
