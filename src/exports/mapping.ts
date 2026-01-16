/**
 * EXPORT MAPPING MODULE
 * =====================
 *
 * This module contains functions that map field keys to headers and format
 * values for export. All formatting functions:
 * - Handle null/undefined values gracefully
 * - Convert internal values to export-friendly formats
 * - Support both single and multiple value formats
 */

import type { SpecialtyField } from "@/constants";
import type { ConsultationMGF } from "@/lib/api/consultations";
import type { ConsultationExportCell } from "./types";
import {
  commonFieldByKey,
  mgfFieldByKey,
  KEY_TO_HEADER_MAP,
  TOP_LEVEL_FIELDS,
} from "./constants";

// ============================================================================
// HEADER MAPPING
// ============================================================================

/**
 * Maps a field key to its Portuguese header name for export
 *
 * Returns the header from KEY_TO_HEADER_MAP, or falls back to the key itself
 */
export function mapKeyToHeader(fieldKey: string): string {
  return KEY_TO_HEADER_MAP[fieldKey] || fieldKey;
}

/**
 * Gets field mapping configuration
 *
 * Returns which fields are stored at top-level vs in details object
 * - "column": Top-level fields (date, process_number, location, etc.)
 * - "details": Specialty-specific fields stored in JSONB details column
 */
export function getFieldSource(fieldKey: string): "column" | "details" {
  return TOP_LEVEL_FIELDS.has(fieldKey) ? "column" : "details";
}

// ============================================================================
// VALUE FORMATTERS
// ============================================================================

/**
 * Formats a boolean value for export
 *
 * Converts: true → "Sim", false → "Não", null/undefined → null
 */
export function formatBoolean(value: unknown): ConsultationExportCell {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === "true" || value === "false") {
    return value === "true" ? "Sim" : "Não";
  }
  return null;
}

/**
 * Formats a select/combobox/multi-select field value using field options
 *
 * For single values: Looks up the option by value and returns its label
 * For arrays (multi-select): Looks up each value and joins labels with semicolons
 * Falls back to the value(s) as-is if no match found
 */
export function formatWithOptions(
  field: SpecialtyField | undefined,
  value: unknown
): ConsultationExportCell {
  if (!field) {
    if (value === null || value === undefined) return null;
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join("; ") : null;
    }
    return String(value);
  }

  if (value === null || value === undefined || value === "") return null;

  if (!field.options || field.options.length === 0) {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join("; ") : null;
    }
    return String(value);
  }

  // Handle arrays (multi-select fields)
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    const labels = value
      .map((val) => {
        const str = String(val);
        const option = field.options!.find((opt) => opt.value === str);
        return option?.label ?? str;
      })
      .filter((label) => label.length > 0);
    return labels.length > 0 ? labels.join("; ") : null;
  }

  // Handle single values (select/combobox fields)
  const str = String(value);
  const option = field.options.find((opt) => opt.value === str);
  return option?.label ?? str;
}

/**
 * Formats a text list (array) as semicolon-separated string
 *
 * Converts: ["item1", "item2"] → "item1; item2"
 */
export function formatTextList(value: unknown): ConsultationExportCell {
  if (!value) return null;

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return value.join("; ");
  }

  return String(value);
}

/**
 * Formats ICPC-2 codes (same as text list, semicolon-separated)
 *
 * These are stored as arrays of "CODE - Description" strings
 */
export function formatIcpcCodes(value: unknown): ConsultationExportCell {
  return formatTextList(value);
}

/**
 * Formats a date value to ISO format (YYYY-MM-DD)
 */
export function formatDate(value: unknown): ConsultationExportCell {
  if (!value) return null;
  try {
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toISOString().split("T")[0];
  } catch {
    return String(value);
  }
}

/**
 * Formats a number value, preserving type when possible
 */
export function formatNumber(value: unknown): ConsultationExportCell {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (value) {
    const num = Number(value);
    return Number.isNaN(num) ? String(value) : num;
  }
  return null;
}

// ============================================================================
// FIELD VALUE EXTRACTION
// ============================================================================

/**
 * Gets a value from consultation details object
 */
export function getDetailsValue(
  consultation: ConsultationMGF,
  key: string
): unknown {
  if (!consultation.details || typeof consultation.details !== "object") {
    return null;
  }
  return (consultation.details as Record<string, unknown>)[key] ?? null;
}

/**
 * Gets a type-specific value from consultation details
 *
 * For type-specific fields like DM/HTA/SM that are nested in details[type][section][field]
 */
export function getTypeSpecificValue(
  consultation: ConsultationMGF,
  type: string,
  sectionKey: string,
  fieldKey: string
): unknown {
  if (!consultation.details || typeof consultation.details !== "object") {
    return null;
  }
  const details = consultation.details as Record<string, unknown>;
  const typeKey = type.toLowerCase();
  const typeData = details[typeKey] as
    | Record<string, Record<string, unknown>>
    | undefined;
  if (!typeData) return null;
  const sectionData = typeData[sectionKey] as
    | Record<string, unknown>
    | undefined;
  if (!sectionData) return null;
  return sectionData[fieldKey] ?? null;
}

// ============================================================================
// FIELD LOOKUP HELPERS
// ============================================================================

/**
 * Gets a field definition by key from either common or specialty fields
 */
export function getFieldByKey(fieldKey: string): SpecialtyField | undefined {
  return commonFieldByKey.get(fieldKey) || mgfFieldByKey.get(fieldKey);
}
