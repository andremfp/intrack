import type { ConsultationMGF } from "@/lib/api/consultations";
import { COMMON_CONSULTATION_FIELDS, type SpecialtyField } from "@/constants";
import { resolveTypeSections } from "@/components/forms/consultation/helpers";

/**
 * Converts a database value to the format expected by form inputs.
 *
 * Database stores values in various types (number, boolean, string, null),
 * but form inputs always work with strings (or string arrays for text-list).
 *
 * @param field - Field definition with type and default value
 * @param databaseValue - Raw value from database (can be any type or undefined), either from top level columns or flattened details (has type from db) or nested fields in details JSONB (is string or string[])
 * @returns Normalized value for form: string or string[]
 */
export function getFieldValue(
  field: SpecialtyField,
  databaseValue?: unknown
): string | string[] {
  // Text-list fields: form works with string[]
  if (field.type === "text-list") {
    if (Array.isArray(databaseValue)) {
      return databaseValue; // Already an array
    }
    // Empty: return array with one empty string for the input field
    return [""];
  }

  // ICPC-2 code fields: form works with string[]
  // Note: This is legacy - actual field type is "code-search" with multiple=true
  // Legacy: icpc2-codes type has been replaced by code-search with multiple=true
  // This check is no longer needed as the type doesn't exist anymore

  // Code-search fields: can be single (string) or multiple (array)
  // Multiple mode: ICPC2 codes (problems, diagnosis, etc.)
  // Single mode: profession
  if (field.type === "code-search") {
    if (field.multiple) {
      // Multiple selection mode (ICPC2 codes)
      if (Array.isArray(databaseValue)) {
        return databaseValue;
      }
      return [];
    } else {
      // Single selection mode (profession)
      if (typeof databaseValue === "string") {
        return databaseValue;
      }
      return "";
    }
  }

  // Boolean fields: DB stores boolean, form needs "true" or "false" string (or "" for null/optional)
  if (field.type === "boolean") {
    if (typeof databaseValue === "boolean") {
      return databaseValue ? "true" : "false";
    }
    // Already a string ("true" or "false")
    if (databaseValue === "true" || databaseValue === "false") {
      return databaseValue;
    }
    // No value: use default if provided, otherwise empty string for optional fields
    return field.defaultValue !== undefined ? String(field.defaultValue) : "";
  }

  // Multi-select fields: stored as array of strings in DB, need array for form
  if (field.type === "multi-select") {
    if (Array.isArray(databaseValue)) {
      return databaseValue;
    }
    return [];
  }

  // Other types (text, number, textarea, select): convert to string
  if (databaseValue !== undefined && databaseValue !== null) {
    return String(databaseValue);
  }

  // No database value: use field default or empty string
  return field.defaultValue !== undefined ? String(field.defaultValue) : "";
}

/**
 * Initializes form values from database consultation data.
 *
 * Reads from three different locations in the database structure:
 * 1. Top-level view columns (from consultations_mgf view)
 * 2. Flat fields in details JSONB: type, presential, diagnosis, etc. (from details.type, details.presential, etc.)
 * 3. Nested fields in details JSONB: dm.exams.creatinina (from details.dm.exams.creatinina)
 *
 * @param specialtyFields - All specialty-specific field definitions (specialty details)
 * @param editingConsultation - Existing consultation from database (null for new consultation)
 * @returns FormValues object with all fields initialized as strings/string arrays
 */
export function initializeFormValues(
  specialtyFields: SpecialtyField[],
  editingConsultation?: ConsultationMGF | null
) {
  const formValues: Record<string, string | string[]> = {};

  // ============================================================================
  // SOURCE 1: Top-level fields from database view columns
  // These are directly on the ConsultationMGF object (not in details JSONB)
  // Examples: date, sex, age, age_unit, process_number
  // ============================================================================
  COMMON_CONSULTATION_FIELDS.forEach((field) => {
    if (field.key === "date") {
      // Date field: convert to YYYY-MM-DD format for date input
      formValues[field.key] = editingConsultation?.date
        ? new Date(editingConsultation.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
    } else {
      // Other common fields: read directly from view columns
      const databaseValueFromView = editingConsultation
        ? (editingConsultation as Record<string, unknown>)[field.key]
        : undefined;
      formValues[field.key] = getFieldValue(field, databaseValueFromView);
    }
  });

  // Specialty year is also a top-level field
  formValues["specialty_year"] = editingConsultation
    ? String(editingConsultation.specialty_year || 1)
    : "1";

  // ============================================================================
  // SOURCE 2: Top-level fields in details JSONB
  // These are stored directly in details object: details.type, details.presential, etc.
  // Examples: type, presential, diagnosis, problems, contraceptive
  // ============================================================================
  const detailsJsonb =
    (editingConsultation?.details as Record<string, unknown>) || {};

  specialtyFields.forEach((field) => {
    // Skip if already initialized
    if (!(field.key in formValues)) {
      const databaseValueFromDetails = detailsJsonb[field.key];
      formValues[field.key] = getFieldValue(field, databaseValueFromDetails);
    }
  });

  // ============================================================================
  // SOURCE 3: Nested fields in details JSONB (type-specific sections)
  // These are stored in nested structure: details.dm.exams.creatinina
  // Only shown when a specific consultation type is selected (e.g., "DM")
  // ============================================================================
  const selectedConsultationType =
    typeof formValues.type === "string" ? formValues.type : undefined;
  const typeSpecificSections = resolveTypeSections(selectedConsultationType);

  typeSpecificSections.forEach((section) => {
    section.fields.forEach((field) => {
      // Skip if already initialized
      if (!(field.key in formValues)) {
        let databaseValueFromNestedStructure: unknown = undefined;

        // Section fields are ALWAYS stored in nested structure: details[type][section.key][field.key]
        // Example: details["dm"]["exams"]["creatinina"]
        // They are NEVER stored as flat fields in details
        if (section.key && selectedConsultationType) {
          const typeKey = selectedConsultationType.toLowerCase();
          const typeSection = detailsJsonb[typeKey] as
            | Record<string, Record<string, unknown>>
            | undefined;
          const sectionFields = typeSection?.[section.key];
          databaseValueFromNestedStructure = sectionFields?.[field.key];
        }
        // If nested structure not found, databaseValueFromNestedStructure remains undefined
        // getFieldValue() will handle undefined and use field defaults
        formValues[field.key] = getFieldValue(
          field,
          databaseValueFromNestedStructure
        );
      }
    });
  });

  return formValues;
}
