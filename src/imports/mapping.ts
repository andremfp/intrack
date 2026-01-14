/**
 * VALUE PARSING MODULE
 * ====================
 *
 * This module contains functions that parse and validate raw string values
 * from import files into typed values. All parsing functions:
 * - Return null if value is empty/invalid
 * - Perform strict validation (invalid values = null)
 * - Handle multiple input formats when possible
 */

import { getICPC2Codes } from "@/constants";
import { PROFESSIONS } from "@/professions";
import type { ValidationError } from "./types";
import type { ConsultationInsert } from "@/lib/api/consultations";
import {
  HEADER_TO_KEY_MAP,
  TRUE_VALUES,
  FALSE_VALUES,
  AGE_UNIT_ABBREVIATIONS,
  EXCEL_SERIAL_MIN,
  EXCEL_SERIAL_MAX,
  DATE_FORMAT_ISO,
  DATE_FORMAT_DMY,
  ICPC_CODE_PATTERN,
  PROFESSION_CODE_PATTERN,
  TOP_LEVEL_FIELDS,
} from "./constants";
import {
  getFieldByKey,
  excelSerialToDate,
  validateSelectValue,
} from "./helpers";

// ============================================================================
// HEADER MAPPING
// ============================================================================

/**
 * Maps a Portuguese header name to its field key
 * Handles case-insensitive matching and common variations (e.g., "Estagio" vs "Estágio")
 */
export function mapHeaderToKey(header: string): string | null {
  const trimmed = header.trim();

  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();

  // Try exact match first
  if (HEADER_TO_KEY_MAP[trimmed]) {
    return HEADER_TO_KEY_MAP[trimmed];
  }

  // Try case-insensitive match
  const lowerTrimmed = trimmed.toLowerCase();
  for (const [key, value] of Object.entries(HEADER_TO_KEY_MAP)) {
    if (key.toLowerCase() === lowerTrimmed) {
      return value;
    }
  }

  // Try diacritic-insensitive match (e.g. "Estagio" vs "Estágio")
  const normalizedTrimmed = normalize(trimmed);
  for (const [key, value] of Object.entries(HEADER_TO_KEY_MAP)) {
    if (normalize(key) === normalizedTrimmed) {
      return value;
    }
  }

  return null;
}

// ============================================================================
// VALUE PARSERS
// ============================================================================

/**
 * Parses a boolean value from various formats
 *
 * Accepted formats:
 * - Portuguese: "Sim"/"Não", "S"/"N"
 * - English: "Yes"/"No", "Y"/"N"
 * - Technical: "true"/"false", "1"/"0"
 *
 * Returns: boolean | null (null if invalid/empty)
 */
export function parseBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  const str = String(value).trim().toLowerCase();
  if (TRUE_VALUES.has(str)) return true;
  if (FALSE_VALUES.has(str)) return false;

  return null;
}

/**
 * Parses a select/combobox field value from label to option value
 *
 * Matching strategy (in order):
 * 1. Exact match on label (case-insensitive)
 * 2. Exact match on value (case-insensitive)
 * 3. Diacritic-insensitive match on label/value
 * 4. Partial match on label
 *
 * Special handling:
 * - age_unit: Supports single-letter abbreviations (D/S/M/A)
 *
 * Returns: string | null (null if no match found)
 */
export function parseSelectValue(
  fieldKey: string,
  value: unknown
): string | null {
  if (value === null || value === undefined || value === "") return null;

  const str = String(value).trim();
  if (!str) return null;

  const field = getFieldByKey(fieldKey);
  if (!field?.options) {
    return str; // No options defined, return value as-is
  }

  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();

  // Special handling for age_unit: support single-letter abbreviations
  if (fieldKey === "age_unit" && str.length === 1) {
    const abbreviation = AGE_UNIT_ABBREVIATIONS[str.toUpperCase()];
    if (abbreviation) return abbreviation;
  }

  const lowerStr = str.toLowerCase();
  const normalizedStr = normalize(str);

  // Try exact match on label (case-insensitive)
  const exactMatch = field.options.find(
    (opt) => opt.label?.toLowerCase() === lowerStr
  );
  if (exactMatch?.value) return exactMatch.value;

  // Try value match (case-insensitive)
  const valueMatch = field.options.find(
    (opt) => opt.value?.toLowerCase() === lowerStr
  );
  if (valueMatch?.value) return valueMatch.value;

  // Try diacritic-insensitive match on label/value (e.g. "urgencia" vs "urgência")
  const normalizedLabelMatch = field.options.find(
    (opt) => opt.label && normalize(opt.label) === normalizedStr
  );
  if (normalizedLabelMatch?.value) return normalizedLabelMatch.value;

  const normalizedValueMatch = field.options.find(
    (opt) => opt.value && normalize(opt.value) === normalizedStr
  );
  if (normalizedValueMatch?.value) return normalizedValueMatch.value;

  // Try partial match on label
  const partialMatch = field.options.find((opt) =>
    opt.label?.toLowerCase().includes(lowerStr)
  );
  if (partialMatch?.value) return partialMatch.value;

  // Try partial match diacritic-insensitive
  const normalizedPartialMatch = field.options.find(
    (opt) => opt.label && normalize(opt.label).includes(normalizedStr)
  );
  if (normalizedPartialMatch?.value) return normalizedPartialMatch.value;

  return null; // No valid match found
}

/**
 * Parses a date string in various formats to ISO date (YYYY-MM-DD)
 *
 * Supported formats:
 * - ISO: YYYY-MM-DD
 * - European: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
 * - Excel serial numbers (converted to date)
 * - Date objects (converted to ISO string)
 *
 * For DD/MM/YYYY format, tries both DD/MM and MM/DD interpretations
 *
 * Returns: string (ISO format) | null (null if invalid)
 */
export function parseDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;

  // Handle Date objects directly
  if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) {
      return value.toISOString().split("T")[0];
    }
    return null;
  }

  // Handle Excel serial date numbers
  if (typeof value === "number") {
    if (value >= EXCEL_SERIAL_MIN && value <= EXCEL_SERIAL_MAX) {
      try {
        const date = excelSerialToDate(value);
        if (!Number.isNaN(date.getTime())) {
          return date.toISOString().split("T")[0];
        }
      } catch {
        // Fall through to string parsing
      }
    }
  }

  const str = String(value).trim();
  if (!str) return null;

  // Try ISO format first (YYYY-MM-DD)
  if (DATE_FORMAT_ISO.test(str)) {
    const date = new Date(str);
    if (!Number.isNaN(date.getTime())) {
      return str;
    }
  }

  // Try DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY format
  const dateMatch = str.match(DATE_FORMAT_DMY);
  if (dateMatch) {
    const [, part1, part2, year] = dateMatch;
    // Try both DD/MM/YYYY and MM/DD/YYYY interpretations
    for (const [day, month] of [
      [part1, part2],
      [part2, part1],
    ]) {
      const dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0"
      )}`;
      const date = new Date(dateStr);
      if (!Number.isNaN(date.getTime())) {
        return dateStr;
      }
    }
  }

  // Try parsing as Date object
  const date = new Date(str);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().split("T")[0];
  }

  return null;
}

/**
 * Parses a number from string
 *
 * Returns: number | null (null if invalid/empty)
 */
export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;

  const str = String(value).trim();
  if (!str) return null;

  const num = Number(str);
  return Number.isNaN(num) ? null : num;
}

/**
 * Parses a text list (semicolon-separated)
 *
 * Fields: chronic_diseases, procedure, notes
 *
 * Format: "item1; item2; item3"
 * - Splits by semicolon
 * - Trims each item
 * - Filters empty items
 *
 * Returns: string[] | null (null if empty)
 */
export function parseTextList(value: unknown): string[] | null {
  if (value === null || value === undefined || value === "") return null;

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  const str = String(value).trim();
  if (!str) return null;

  const items = str
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : null;
}

/**
 * Parses and validates ICPC-2 codes from semicolon-separated string
 *
 * Fields: diagnosis, problems, new_diagnosis, referrence_motive
 *
 * Format: "A01 - Description; B02; C03 - Another Description"
 * - Multiple codes separated by semicolon
 * - Accepts "CODE - Description" or just "CODE"
 * - Validates against available ICPC-2 codes for specialty
 *
 * Validation: STRICT - returns null if ANY code is invalid
 *
 * Returns: string[] (formatted as "CODE - Description") | null
 */
export function parseIcpcCodes(
  value: unknown,
  specialtyCode: string
): string[] | null {
  if (value === null || value === undefined || value === "") return null;

  const str = String(value).trim();
  if (!str) return null;

  const entries = str
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (entries.length === 0) return null;

  const validCodes: string[] = [];
  const icpc2Codes = getICPC2Codes(specialtyCode);
  const codeSet = new Set(icpc2Codes.map((c) => c.code));

  for (const entry of entries) {
    // Extract code from "A01 - Description" format or use as-is
    const match = entry.match(ICPC_CODE_PATTERN);
    const code = match ? match[1] : entry.trim().toUpperCase();

    // Only include valid codes
    if (codeSet.has(code)) {
      const codeData = icpc2Codes.find((c) => c.code === code);
      validCodes.push(codeData ? `${code} - ${codeData.description}` : code);
    } else {
      // Invalid code found - return null to indicate parsing failure
      return null;
    }
  }

  return validCodes.length > 0 ? validCodes : null;
}

/**
 * Parses and validates profession codes from string (single selection only)
 *
 * Field: profession
 *
 * Format: "2655.0 - Description" or just "2655.0"
 * - Single selection only (not multiple)
 * - Validates against PROFESSIONS list
 *
 * Validation: STRICT - returns null if code is invalid
 *
 * Returns: string (formatted as "CODE - Description") | null
 */
export function parseProfessionCode(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;

  const str = String(value).trim();
  if (!str) return null;

  // Extract code from "2655.0 - Description" format or use as-is
  const match = str.match(PROFESSION_CODE_PATTERN);
  const code = match ? match[1] : str.trim();
  const codeSet = new Set(PROFESSIONS.map((p) => p.code));

  // Only return valid codes
  if (codeSet.has(code)) {
    const professionData = PROFESSIONS.find((p) => p.code === code);
    return professionData ? `${code} - ${professionData.description}` : code;
  }

  // Invalid code - return null to indicate parsing failure
  return null;
}

// ============================================================================
// FIELD CONFIGURATION
// ============================================================================

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
// BUSINESS RULE VALIDATION
// ============================================================================

/**
 * Validates location and internship relationship and values
 *
 * Business Rules:
 * - If location is 'unidade': internship must NOT be provided, type is REQUIRED
 * - If location is NOT 'unidade': internship is REQUIRED, type must NOT be provided
 * - All values must be valid options from their respective fields
 */
export function validateLocationAndInternship(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  const locationField = getFieldByKey("location");
  const internshipField = getFieldByKey("internship");
  const typeField = getFieldByKey("type");

  const location = consultation.location;
  const internship =
    consultation.details && typeof consultation.details === "object"
      ? (consultation.details as Record<string, unknown>).internship
      : undefined;
  const type =
    consultation.details && typeof consultation.details === "object"
      ? (consultation.details as Record<string, unknown>).type
      : undefined;

  // Validate location value
  if (locationField) {
    const locationError = validateSelectValue(
      locationField,
      location,
      rowIndex
    );
    if (locationError) errors.push(locationError);
  }

  // Validate internship value (if provided)
  if (internshipField) {
    const internshipError = validateSelectValue(
      internshipField,
      internship,
      rowIndex
    );
    if (internshipError) errors.push(internshipError);
  }

  // Validate type value (if provided)
  if (typeField) {
    const typeError = validateSelectValue(typeField, type, rowIndex);
    if (typeError) errors.push(typeError);
  }

  // Validate location/internship relationship (only if location is valid)
  if (
    location &&
    typeof location === "string" &&
    locationField?.options?.some((opt) => opt.value === location)
  ) {
    const hasInternship =
      internship !== null && internship !== undefined && internship !== "";
    const hasType = type !== null && type !== undefined && type !== "";

    if (location === "unidade") {
      if (hasInternship) {
        errors.push({
          rowIndex,
          field: "internship",
          message:
            "Estágio não é permitido para o local 'Unidade de Saúde'. Remove o estágio para este local.",
        });
      }
      // Type is required when location is 'unidade'
      if (!hasType) {
        errors.push({
          rowIndex,
          field: "type",
          message: `Campo obrigatório: ${
            typeField?.label || "Tipologia"
          }. A tipologia é obrigatória para o local 'Unidade de Saúde'.`,
        });
      }
    } else {
      // Internship is required for all other locations
      if (!hasInternship) {
        errors.push({
          rowIndex,
          field: "internship",
          message: `Campo obrigatório: ${
            internshipField?.label || "Estágio"
          }. O estágio é obrigatório para este local.`,
        });
      }
      // Type should not be present when location is not 'unidade'
      if (hasType) {
        errors.push({
          rowIndex,
          field: "type",
          message: `Tipologia não é permitida para o local '${
            locationField?.options?.find((opt) => opt.value === location)
              ?.label || location
          }'. Remove a tipologia para este local.`,
        });
      }
    }
  }

  return errors;
}
