import { getICPC2Codes } from "@/constants";
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
  TOP_LEVEL_FIELDS,
} from "./constants";
import { getFieldByKey, excelSerialToDate, validateSelectValue } from "./helpers";

/**
 * Maps a header name to its field key
 * Handles case-insensitive matching and common variations
 */
export function mapHeaderToKey(header: string): string | null {
  const trimmed = header.trim();
  
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
  
  return null;
}

/**
 * Parses a boolean value from various formats
 * Supports: "Sim"/"Não", "S"/"N", "Yes"/"No", "Y"/"N", "true"/"false", "1"/"0"
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
 * Parses a select field value from label to option value
 * Case-insensitive matching with support for abbreviations
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

  // Special handling for age_unit: support single-letter abbreviations
  if (fieldKey === "age_unit" && str.length === 1) {
    const abbreviation = AGE_UNIT_ABBREVIATIONS[str.toUpperCase()];
    if (abbreviation) return abbreviation;
  }

  const lowerStr = str.toLowerCase();
  
  // Try exact match on label (case-insensitive)
  const exactMatch = field.options.find(
    (opt) => opt.label.toLowerCase() === lowerStr
  );
  if (exactMatch) return exactMatch.value;

  // Try value match (case-insensitive)
  const valueMatch = field.options.find(
    (opt) => opt.value.toLowerCase() === lowerStr
  );
  if (valueMatch) return valueMatch.value;

  // Try partial match on label
  const partialMatch = field.options.find((opt) =>
    opt.label.toLowerCase().includes(lowerStr)
  );
  if (partialMatch) return partialMatch.value;

  return null; // No valid match found
}


/**
 * Parses a date string in various formats to ISO date (YYYY-MM-DD)
 * Supports: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, Excel serial numbers
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
    for (const [day, month] of [[part1, part2], [part2, part1]]) {
      const dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
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
 * Parses ICPC-2 codes from semicolon-separated string
 * Validates codes against available ICPC-2 codes
 * Supports format: "A01 - Description" or just "A01"
 */
export function parseIcpcCodes(
  value: unknown,
  specialtyCode: string
): string | null {
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

    // Validate code exists
    if (codeSet.has(code)) {
      const codeData = icpc2Codes.find((c) => c.code === code);
      validCodes.push(
        codeData ? `${code} - ${codeData.description}` : code
      );
    } else {
      // Invalid code, but include it anyway (will be caught in validation)
      validCodes.push(entry);
    }
  }

  return validCodes.length > 0 ? validCodes.join("; ") : null;
}

/**
 * Gets field mapping configuration
 * Returns which fields are in details vs top-level
 */
export function getFieldSource(fieldKey: string): "column" | "details" {
  return TOP_LEVEL_FIELDS.has(fieldKey) ? "column" : "details";
}

/**
 * Validates location and internship relationship and values
 * 
 * Rules:
 * - If location is 'unidade', internship must not be provided
 * - If location is NOT 'unidade', internship is required
 * - Location and internship values must be valid options
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
    const locationError = validateSelectValue(locationField, location, rowIndex);
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
    const hasType =
      type !== null && type !== undefined && type !== "";

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
          message: `Campo obrigatório: ${typeField?.label || "Tipologia"}. A tipologia é obrigatória para o local 'Unidade de Saúde'.`,
        });
      }
    } else {
      // Internship is required for all other locations
      if (!hasInternship) {
        errors.push({
          rowIndex,
          field: "internship",
          message: `Campo obrigatório: ${internshipField?.label || "Estágio"}. O estágio é obrigatório para este local.`,
        });
      }
      // Type should not be present when location is not 'unidade'
      if (hasType) {
        errors.push({
          rowIndex,
          field: "type",
          message: `Tipologia não é permitida para o local '${locationField?.options?.find(opt => opt.value === location)?.label || location}'. Remove a tipologia para este local.`,
        });
      }
    }
  }

  return errors;
}

