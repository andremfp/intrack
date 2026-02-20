/**
 * IMPORT PROCESSING MODULE
 * ========================
 *
 * This module handles:
 * 1. File parsing (CSV/XLSX)
 * 2. Value mapping (raw values → consultation structure)
 * 3. Validation (business rules, constraints, required fields)
 *
 * Flow:
 * parseCsvFile/parseXlsxFile → mapImportRowToConsultation → validateImportRow
 */

import type { ConsultationInsert } from "@/lib/api/consultations";
import type { ImportRow, ValidationError, ImportPreviewData } from "./types";
import {
  mapHeaderToKey,
  parseBoolean,
  parseDate,
  parseNumber,
  parseSelectValue,
  parseTextList,
  parseIcpcCodes,
  parseProfessionCode,
  getFieldSource,
} from "./mapping";
import {
  COMMON_CONSULTATION_FIELDS,
  MGF_FIELDS,
  MGF_CONSULTATION_TYPE_SECTIONS,
  getDefaultSpecialtyDetails,
} from "@/constants";
import type { FieldRule, FieldRuleContext, SpecialtyField } from "@/constants";
import {
  commonFieldByKey,
  mgfFieldByKey,
  ICPC_CODE_FIELDS,
  TEXT_LIST_FIELDS,
  MIN_AGE,
  MAX_AGE,
  MIN_SPECIALTY_YEAR,
  MAX_PROCESS_NUMBER_DIGITS,
  MAX_TEXT_FIELD_LENGTH,
  MAX_TEXT_LIST_ITEM_LENGTH,
  EXCEL_EPOCH,
  MS_PER_DAY,
  parseTypeSpecificKey,
} from "./constants";

// ============================================================================
// FIELD LOOKUP
// ============================================================================

/**
 * Gets a field definition by key from either common or specialty fields
 */
export function getFieldByKey(fieldKey: string): SpecialtyField | undefined {
  return commonFieldByKey.get(fieldKey) || mgfFieldByKey.get(fieldKey);
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Converts Excel serial date number to JavaScript Date
 * Excel epoch: January 1, 1900 (serial number 1)
 */
export function excelSerialToDate(serial: number): Date {
  return new Date(EXCEL_EPOCH.getTime() + serial * MS_PER_DAY);
}

// ============================================================================
// FIELD RULE EVALUATION
// ============================================================================

/**
 * Evaluates field visibility/requirement rules based on consultation context
 */
function evaluateRule(
  rule: FieldRule | undefined,
  ctx: FieldRuleContext,
  defaultValue: boolean,
): boolean {
  if (!rule) return defaultValue;
  if (rule === "always") return true;
  if (rule === "never") return false;
  try {
    return Boolean(rule(ctx));
  } catch {
    return defaultValue;
  }
}

function getRuleContext(
  consultation: Partial<ConsultationInsert>,
): FieldRuleContext {
  const details =
    consultation.details && typeof consultation.details === "object"
      ? (consultation.details as Record<string, unknown>)
      : undefined;

  // Extract own_list as boolean from details
  const ownListValue = details?.own_list;
  const ownListBoolean =
    typeof ownListValue === "boolean"
      ? ownListValue
      : typeof ownListValue === "string" && ownListValue === "true"
        ? true
        : typeof ownListValue === "string" && ownListValue === "false"
          ? false
          : undefined;

  return {
    location:
      typeof consultation.location === "string"
        ? consultation.location
        : undefined,
    sex: typeof consultation.sex === "string" ? consultation.sex : undefined,
    type:
      typeof details?.type === "string" ? (details.type as string) : undefined,
    own_list: ownListBoolean,
  };
}

function isFieldVisible(field: SpecialtyField, ctx: FieldRuleContext): boolean {
  return evaluateRule(field.visibleWhen, ctx, true);
}

function isFieldRequired(
  field: SpecialtyField,
  ctx: FieldRuleContext,
): boolean {
  return evaluateRule(field.requiredWhen, ctx, false);
}

/**
 * Validates a select/combobox field value against its options
 * Used by validateLocationAndInternship for location/type/internship validation
 */
export function validateSelectValue(
  field: SpecialtyField,
  value: unknown,
  rowIndex: number,
): ValidationError | null {
  if (!field.options || value === null || value === undefined || value === "") {
    return null;
  }

  const validValues = new Set(field.options.map((opt) => opt.value));
  if (typeof value === "string" && !validValues.has(value)) {
    const validOptions = field.options.map((opt) => opt.label).join(", ");
    return {
      rowIndex,
      field: field.key,
      message: `Valor inválido para ${field.label}. Valores válidos: ${validOptions}`,
    };
  }

  return null;
}

/**
 * Gets a value from consultation structure (top-level or details)
 * Helper for validation functions
 */
function getConsultationValue(
  consultation: Partial<ConsultationInsert>,
  fieldKey: string,
): unknown {
  // Check top-level fields first
  if (
    fieldKey === "date" ||
    fieldKey === "process_number" ||
    fieldKey === "location" ||
    fieldKey === "autonomy" ||
    fieldKey === "sex" ||
    fieldKey === "age" ||
    fieldKey === "age_unit"
  ) {
    return (consultation as Record<string, unknown>)[fieldKey];
  }

  // Check details
  if (consultation.details && typeof consultation.details === "object") {
    return (consultation.details as Record<string, unknown>)[fieldKey];
  }

  return undefined;
}

// ============================================================================
// FILE PARSING
// ============================================================================

/**
 * Checks if a row is empty (all values are null, empty, or whitespace)
 */
export function isRowEmpty(row: ImportRow): boolean {
  return Object.values(row).every((value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    return false;
  });
}

// ============================================================================
// VALUE MAPPING
// ============================================================================

/**
 * Maps a field value based on its type
 *
 * Field type routing:
 * - ICPC_CODE_FIELDS → parseIcpcCodes()
 * - fieldKey === "profession" → parseProfessionCode()
 * - TEXT_LIST_FIELDS → parseTextList()
 * - type: "boolean" → parseBoolean()
 * - fieldKey: "date" → parseDate()
 * - fieldKey: "process_number" | "age" → parseNumber()
 * - fieldKey: "specialty_year" → parseNumber() with >= 1 check
 * - type: "select" | "combobox" → parseSelectValue()
 *
 * Returns: parsed value | null
 */
function mapFieldValue(
  fieldKey: string,
  rawValue: unknown,
  specialtyCode: string,
): unknown {
  const field = getFieldByKey(fieldKey);

  // Handle ICPC-2 code fields
  if (ICPC_CODE_FIELDS.has(fieldKey)) {
    return parseIcpcCodes(rawValue, specialtyCode);
  }

  // Handle profession code field (single field, pattern: digits.digit, e.g., 5230.2)
  if (fieldKey === "profession") {
    return parseProfessionCode(rawValue);
  }

  // Handle text list fields
  if (TEXT_LIST_FIELDS.has(fieldKey)) {
    return parseTextList(rawValue);
  }

  // Handle boolean fields
  if (field?.type === "boolean") {
    return parseBoolean(rawValue);
  }

  // Handle date fields
  if (fieldKey === "date") {
    return parseDate(rawValue);
  }

  // Handle number fields
  if (fieldKey === "process_number" || fieldKey === "age") {
    return parseNumber(rawValue);
  }

  // Handle specialty_year with special logic
  if (fieldKey === "specialty_year") {
    const num = parseNumber(rawValue);
    return num !== null && num >= 1 ? num : null;
  }

  // Handle multi-select fields
  if (field?.type === "multi-select") {
    return parseTextList(rawValue); // Multi-select stored as array
  }

  // Handle select/combobox fields
  if (field?.type === "select" || field?.type === "combobox") {
    return parseSelectValue(fieldKey, rawValue);
  }

  // Handle text fields (fallback for simple text fields)
  if (field?.type === "text") {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return null;
    }
    return String(rawValue).trim() || null;
  }

  // Handle type-specific fields (e.g., "dm_exams_creatinina")
  const typeSpecificInfo = parseTypeSpecificKey(fieldKey);
  if (typeSpecificInfo) {
    const { typeKey, sectionKey, fieldKey: actualFieldKey } = typeSpecificInfo;
    const typeSections = MGF_CONSULTATION_TYPE_SECTIONS[typeKey];
    const section = typeSections?.find((s) => s.key === sectionKey);
    const typeField = section?.fields.find((f) => f.key === actualFieldKey);

    if (!typeField) return null;

    // Handle different field types for type-specific fields
    if (typeField.type === "number") {
      return parseNumber(rawValue);
    }
    if (typeField.type === "text") {
      if (rawValue === null || rawValue === undefined || rawValue === "") {
        return null;
      }
      return String(rawValue).trim() || null;
    }
    if (typeField.type === "multi-select") {
      return parseTextList(rawValue); // Multi-select stored as array
    }
    if (typeField.type === "text-list") {
      return parseTextList(rawValue);
    }
    if (typeField.type === "select" || typeField.type === "combobox") {
      // For type-specific select/combobox fields, we need to parse using the field's options
      if (rawValue === null || rawValue === undefined || rawValue === "") {
        return null;
      }

      const str = String(rawValue).trim();
      if (!str) return null;

      if (!typeField.options || typeField.options.length === 0) {
        return str;
      }

      const normalize = (s: string) =>
        s
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase()
          .trim();

      const lowerStr = str.toLowerCase();
      const normalizedStr = normalize(str);

      // Try exact match on label (case-insensitive)
      const exactMatch = typeField.options.find(
        (opt) => opt.label?.toLowerCase() === lowerStr,
      );
      if (exactMatch?.value) return exactMatch.value;

      // Try value match (case-insensitive)
      const valueMatch = typeField.options.find(
        (opt) => opt.value?.toLowerCase() === lowerStr,
      );
      if (valueMatch?.value) return valueMatch.value;

      // Try diacritic-insensitive match on label/value
      const normalizedLabelMatch = typeField.options.find(
        (opt) => opt.label && normalize(opt.label) === normalizedStr,
      );
      if (normalizedLabelMatch?.value) return normalizedLabelMatch.value;

      const normalizedValueMatch = typeField.options.find(
        (opt) => opt.value && normalize(opt.value) === normalizedStr,
      );
      if (normalizedValueMatch?.value) return normalizedValueMatch.value;

      // Try partial match on label
      const partialMatch = typeField.options.find((opt) =>
        opt.label?.toLowerCase().includes(lowerStr),
      );
      if (partialMatch?.value) return partialMatch.value;

      // Try partial match diacritic-insensitive
      const normalizedPartialMatch = typeField.options.find(
        (opt) => opt.label && normalize(opt.label).includes(normalizedStr),
      );
      if (normalizedPartialMatch?.value) return normalizedPartialMatch.value;

      return null;
    }
  }

  return null;
}

/**
 * Maps an import row to a ConsultationInsert structure
 *
 * Process:
 * 1. For each header, map to field key
 * 2. Parse raw value based on field type
 * 3. Place in correct location (top-level vs details)
 * 4. Set defaults (specialty_year, favorite)
 */
export function mapImportRowToConsultation(
  row: ImportRow,
  headers: string[],
  userId: string,
  specialtyId: string,
  specialtyCode: string,
  defaultSpecialtyYear: number,
): Partial<ConsultationInsert> {
  const consultation: Partial<ConsultationInsert> = {
    user_id: userId,
    specialty_id: specialtyId,
    details: getDefaultSpecialtyDetails(specialtyCode),
  };

  // Process each header
  for (const header of headers) {
    // Skip empty headers
    if (!header || header.trim() === "") continue;

    const fieldKey = mapHeaderToKey(header);
    if (!fieldKey || fieldKey === "id") continue; // Skip unknown headers and ID

    const rawValue = row[header];
    const mappedValue = mapFieldValue(fieldKey, rawValue, specialtyCode);

    if (mappedValue === null || mappedValue === undefined) continue;

    // Check if this is a type-specific field
    const typeSpecificInfo = parseTypeSpecificKey(fieldKey);
    if (typeSpecificInfo) {
      // Place in nested structure: details[type][section][field]
      const {
        typeKey,
        sectionKey,
        fieldKey: actualFieldKey,
      } = typeSpecificInfo;
      if (!consultation.details) {
        consultation.details = getDefaultSpecialtyDetails(specialtyCode);
      }
      const details = consultation.details as Record<string, unknown>;

      // Initialize nested structure if needed
      if (!details[typeKey] || typeof details[typeKey] !== "object") {
        details[typeKey] = {};
      }
      const typeData = details[typeKey] as Record<string, unknown>;

      if (!typeData[sectionKey] || typeof typeData[sectionKey] !== "object") {
        typeData[sectionKey] = {};
      }
      const sectionData = typeData[sectionKey] as Record<string, unknown>;

      sectionData[actualFieldKey] = mappedValue;
      continue;
    }

    // Handle regular fields (top-level or flat details)
    const source = getFieldSource(fieldKey);
    if (source === "column") {
      // Top-level fields
      if (fieldKey === "date") {
        consultation.date = mappedValue as string;
      } else if (fieldKey === "process_number") {
        consultation.process_number = mappedValue as number;
      } else if (fieldKey === "specialty_year") {
        consultation.specialty_year = mappedValue as number;
      } else if (fieldKey === "location") {
        consultation.location = mappedValue as string;
      } else if (fieldKey === "autonomy") {
        consultation.autonomy = mappedValue as string;
      } else if (fieldKey === "sex") {
        consultation.sex = mappedValue as string;
      } else if (fieldKey === "age") {
        consultation.age = mappedValue as number;
      } else if (fieldKey === "age_unit") {
        consultation.age_unit = mappedValue as string;
      } else if (fieldKey === "favorite") {
        consultation.favorite = mappedValue as boolean;
      }
    } else {
      // Details fields (flat structure)
      if (!consultation.details) {
        consultation.details = getDefaultSpecialtyDetails(specialtyCode);
      }
      (consultation.details as Record<string, unknown>)[fieldKey] = mappedValue;
    }
  }

  // Set defaults
  if (!consultation.specialty_year) {
    consultation.specialty_year = defaultSpecialtyYear;
  }
  if (consultation.favorite === undefined) {
    consultation.favorite = false;
  }

  return consultation;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates that fields not visible for the row's context are not populated.
 * This keeps imports aligned with UI visibility rules (visibleWhen).
 */
function validateVisibilityConstraints(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number,
  specialtyFields: SpecialtyField[],
): ValidationError[] {
  const errors: ValidationError[] = [];
  const allFields = [...COMMON_CONSULTATION_FIELDS, ...specialtyFields];
  const ctx = getRuleContext(consultation);

  for (const field of allFields) {
    // Only enforce when a visibility rule exists (otherwise everything is visible)
    if (!field.visibleWhen) continue;

    const visible = isFieldVisible(field, ctx);
    if (visible) continue;

    const value = getConsultationValue(consultation, field.key);
    const hasValue =
      value !== null &&
      value !== undefined &&
      !(
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) &&
          (value.length === 0 || value.every((v) => !String(v).trim())))
      );

    if (hasValue) {
      errors.push({
        rowIndex,
        field: field.key,
        message: `Campo não permitido neste contexto: ${field.label}`,
      });
    }
  }

  return errors;
}

/**
 * Parses a CSV line handling quoted values
 */
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'; // Escaped quote
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses a CSV file and returns rows with headers
 */
export async function parseCsvFile(file: File): Promise<{
  headers: string[];
  rows: ImportRow[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          reject(new Error("Ficheiro vazio"));
          return;
        }

        const lines = text.split("\n").filter((line) => line.trim());
        if (lines.length === 0) {
          reject(new Error("Ficheiro não contém dados"));
          return;
        }

        const rawHeaders = parseCsvLine(lines[0]);
        // Filter out empty headers
        const headers = rawHeaders.filter((h) => h.trim() !== "");
        const rows: ImportRow[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseCsvLine(lines[i]);
          const row: ImportRow = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || null;
          });
          // Skip empty rows
          if (!isRowEmpty(row)) {
            rows.push(row);
          }
        }

        resolve({ headers, rows });
      } catch (error) {
        reject(
          new Error(
            `Erro ao processar CSV: ${
              error instanceof Error ? error.message : "Erro desconhecido"
            }`,
          ),
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Erro ao ler ficheiro"));
    };

    reader.readAsText(file);
  });
}

/**
 * Normalizes a cell value from XLSX to ImportRow format
 */
function normalizeXlsxValue(value: unknown): string | number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return value;
  // Handle Date objects (common in .numbers files)
  if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) {
      return value.toISOString().split("T")[0];
    }
    return null;
  }
  return null;
}

/**
 * Parses an XLSX file and returns rows with headers
 */
export async function parseXlsxFile(file: File): Promise<{
  headers: string[];
  rows: ImportRow[];
}> {
  const XLSX = await import("xlsx");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
        }) as unknown[][];

        if (jsonData.length === 0) {
          reject(new Error("Ficheiro não contém dados"));
          return;
        }

        const rawHeaders = (jsonData[0] as unknown[]).map((h) =>
          String(h || "").trim(),
        ) as string[];
        // Filter out empty headers and create a map of header to original index
        const headerIndexMap = new Map<string, number>();
        const headers: string[] = [];
        rawHeaders.forEach((header, index) => {
          if (header.trim() !== "") {
            headers.push(header);
            headerIndexMap.set(header, index);
          }
        });

        const rows: ImportRow[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const values = jsonData[i] as unknown[];
          const row: ImportRow = {};
          headers.forEach((header) => {
            const originalIndex = headerIndexMap.get(header);
            if (originalIndex !== undefined) {
              row[header] = normalizeXlsxValue(values[originalIndex]);
            }
          });
          // Skip empty rows
          if (!isRowEmpty(row)) {
            rows.push(row);
          }
        }

        resolve({ headers, rows });
      } catch (error) {
        reject(
          new Error(
            `Erro ao processar ficheiro: ${
              error instanceof Error ? error.message : "Erro desconhecido"
            }`,
          ),
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Erro ao ler ficheiro"));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validates required fields
 *
 * Checks all fields marked as required (requiredWhen rule) that are visible
 * in the current context. Reports missing values.
 */
function validateRequiredFields(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number,
  specialtyFields: SpecialtyField[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  const allFields = [...COMMON_CONSULTATION_FIELDS, ...specialtyFields];
  const ctx = getRuleContext(consultation);

  for (const field of allFields) {
    if (!isFieldVisible(field, ctx)) continue;
    if (!isFieldRequired(field, ctx)) continue;

    const value = getConsultationValue(consultation, field.key);
    const isMissing =
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) &&
        (value.length === 0 || value.every((v) => !String(v).trim())));

    if (isMissing) {
      errors.push({
        rowIndex,
        field: field.key,
        message: `Campo obrigatório: ${field.label}`,
      });
    }
  }

  return errors;
}

/**
 * Validates numeric field constraints
 *
 * Validates:
 * - age: 0-150 range
 * - process_number: non-negative, max 9 digits
 * - specialty_year: >= 1
 */
function validateNumericConstraints(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate age
  if (consultation.age !== undefined) {
    if (consultation.age < MIN_AGE || consultation.age > MAX_AGE) {
      errors.push({
        rowIndex,
        field: "age",
        message: `A idade deve estar entre ${MIN_AGE} e ${MAX_AGE}`,
      });
    }
  }

  // Validate process number
  if (consultation.process_number !== undefined) {
    if (consultation.process_number < 0) {
      errors.push({
        rowIndex,
        field: "process_number",
        message: "O número de processo deve ser não negativo",
      });
    }
    if (
      String(consultation.process_number).length > MAX_PROCESS_NUMBER_DIGITS
    ) {
      errors.push({
        rowIndex,
        field: "process_number",
        message: `O número de processo tem um máximo de ${MAX_PROCESS_NUMBER_DIGITS} dígitos`,
      });
    }
  }

  // Validate specialty year
  if (consultation.specialty_year !== undefined) {
    if (consultation.specialty_year < MIN_SPECIALTY_YEAR) {
      errors.push({
        rowIndex,
        field: "specialty_year",
        message: `O ano de especialidade deve ser >= ${MIN_SPECIALTY_YEAR}`,
      });
    }
  }

  return errors;
}

/**
 * Validates date format
 *
 * Ensures date is a valid Date object (not NaN)
 */
function validateDate(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number,
): ValidationError[] {
  if (!consultation.date) return [];

  const date = new Date(consultation.date);
  if (Number.isNaN(date.getTime())) {
    return [
      {
        rowIndex,
        field: "date",
        message: "Formato de data inválido",
      },
    ];
  }

  return [];
}

/**
 * Validates select/combobox field values
 *
 * Checks:
 * 1. If raw value was provided but parsing failed (returned null)
 * 2. If parsed value exists in field options
 */
function validateSelectFields(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number,
  specialtyFields: SpecialtyField[],
  rawRow?: ImportRow,
  headers?: string[],
): ValidationError[] {
  const errors: ValidationError[] = [];
  const allFields = [...COMMON_CONSULTATION_FIELDS, ...specialtyFields];
  const ctx = getRuleContext(consultation);

  for (const field of allFields) {
    if (field.type !== "select" && field.type !== "combobox") continue;
    if (!field.options || field.options.length === 0) continue;
    if (!isFieldVisible(field, ctx)) continue;

    const value = getConsultationValue(consultation, field.key);

    // Check if raw value was provided but parsing failed
    if (rawRow && headers) {
      const header = headers.find((h) => mapHeaderToKey(h) === field.key);
      if (header) {
        const rawValue = rawRow[header];
        if (
          rawValue !== null &&
          rawValue !== undefined &&
          rawValue !== "" &&
          (value === null || value === undefined || value === "")
        ) {
          const validOptions = field.options
            .map((opt) => opt.label)
            .filter((label): label is string => label !== undefined)
            .join(", ");
          errors.push({
            rowIndex,
            field: field.key,
            message: `Valor inválido para ${field.label}: "${rawValue}". Valores válidos: ${validOptions}`,
          });
          continue;
        }
      }
    }

    // Skip if value is empty (handled by required check)
    if (value === null || value === undefined || value === "") continue;

    // Validate against options
    const validValues = new Set(
      field.options
        .map((opt) => opt.value)
        .filter((val): val is string => val !== undefined),
    );
    if (typeof value === "string" && !validValues.has(value)) {
      const validOptions = field.options
        .map((opt) => opt.label)
        .filter((label): label is string => label !== undefined)
        .join(", ");
      errors.push({
        rowIndex,
        field: field.key,
        message: `Valor inválido para ${field.label}. Valores válidos: ${validOptions}`,
      });
    }
  }

  return errors;
}

/**
 * Validates code-search field values (profession, ICPC codes, etc.)
 *
 * Since parsing validates codes strictly (returns null if invalid), we check:
 * 1. If raw value was provided but parsing failed (returned null)
 * 2. If profession field received an array (should be single value only)
 */
function validateCodeSearchFields(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number,
  specialtyFields: SpecialtyField[],
  rawRow?: ImportRow,
  headers?: string[],
): ValidationError[] {
  const errors: ValidationError[] = [];
  const allFields = [...COMMON_CONSULTATION_FIELDS, ...specialtyFields];
  const ctx = getRuleContext(consultation);

  for (const field of allFields) {
    if (field.type !== "code-search") continue;
    if (!field.options || field.options.length === 0) continue;
    if (!isFieldVisible(field, ctx)) continue;

    const value = getConsultationValue(consultation, field.key);

    // Check if raw value was provided but parsing failed (returned null)
    if (rawRow && headers) {
      const header = headers.find((h) => mapHeaderToKey(h) === field.key);
      if (header) {
        const rawValue = rawRow[header];
        if (
          rawValue !== null &&
          rawValue !== undefined &&
          rawValue !== "" &&
          (value === null || value === undefined || value === "")
        ) {
          errors.push({
            rowIndex,
            field: field.key,
            message: `Valor inválido para ${field.label}: "${rawValue}". Forneça um código válido.`,
          });
          continue;
        }
      }
    }

    // Profession field only supports single selection (not array)
    if (field.key === "profession" && Array.isArray(value)) {
      errors.push({
        rowIndex,
        field: field.key,
        message: `${field.label} não suporta múltipla seleção. Forneça apenas um valor.`,
      });
    }
  }

  return errors;
}

/**
 * Validates text field values
 *
 * Checks:
 * - Text fields must not exceed MAX_TEXT_FIELD_LENGTH (20 characters)
 */
function validateTextFields(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number,
  specialtyFields: SpecialtyField[],
): ValidationError[] {
  const errors: ValidationError[] = [];
  const allFields = [...COMMON_CONSULTATION_FIELDS, ...specialtyFields];
  const ctx = getRuleContext(consultation);

  for (const field of allFields) {
    if (field.type !== "text") continue;
    if (!isFieldVisible(field, ctx)) continue;

    const value = getConsultationValue(consultation, field.key);
    if (typeof value === "string" && value.length > MAX_TEXT_FIELD_LENGTH) {
      errors.push({
        rowIndex,
        field: field.key,
        message: `${field.label} não pode exceder ${MAX_TEXT_FIELD_LENGTH} caracteres. Valor fornecido: ${value.length} caracteres.`,
      });
    }
  }

  return errors;
}

/**
 * Validates text list field values
 *
 * Checks:
 * - Each item in text list must not exceed MAX_TEXT_LIST_ITEM_LENGTH (100 characters)
 */
function validateTextListFields(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number,
  specialtyFields: SpecialtyField[],
): ValidationError[] {
  const errors: ValidationError[] = [];
  const allFields = [...COMMON_CONSULTATION_FIELDS, ...specialtyFields];
  const ctx = getRuleContext(consultation);

  for (const field of allFields) {
    if (!TEXT_LIST_FIELDS.has(field.key)) continue;
    if (!isFieldVisible(field, ctx)) continue;

    const value = getConsultationValue(consultation, field.key);
    if (Array.isArray(value)) {
      for (const item of value) {
        if (
          typeof item === "string" &&
          item.length > MAX_TEXT_LIST_ITEM_LENGTH
        ) {
          errors.push({
            rowIndex,
            field: field.key,
            message: `Cada item em ${field.label} não pode exceder ${MAX_TEXT_LIST_ITEM_LENGTH} caracteres. Item fornecido: ${item.length} caracteres.`,
          });
        }
      }
    }
  }

  return errors;
}

/**
 * Validates boolean field values
 *
 * Checks if raw value was provided but parsing failed (returned null).
 * parseBoolean() already handles conversion, so we just detect parsing failures.
 */
function validateBooleanFields(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number,
  specialtyFields: SpecialtyField[],
  rawRow?: ImportRow,
  headers?: string[],
): ValidationError[] {
  const errors: ValidationError[] = [];
  const allFields = [...COMMON_CONSULTATION_FIELDS, ...specialtyFields];
  const ctx = getRuleContext(consultation);

  for (const field of allFields) {
    if (field.type !== "boolean") continue;
    if (!isFieldVisible(field, ctx)) continue;

    const value = getConsultationValue(consultation, field.key);

    // Check if raw value was provided but parsing failed
    if (rawRow && headers) {
      const header = headers.find((h) => mapHeaderToKey(h) === field.key);
      if (header) {
        const rawValue = rawRow[header];
        if (
          rawValue !== null &&
          rawValue !== undefined &&
          rawValue !== "" &&
          (value === null || value === undefined)
        ) {
          errors.push({
            rowIndex,
            field: field.key,
            message: `Valor inválido para ${field.label}: "${rawValue}". Use "Sim"/"Não", "S"/"N", "true"/"false", ou "1"/"0".`,
          });
        }
      }
    }

    // Note: We don't validate the boolean value itself since parseBoolean
    // already handles conversion and returns null for invalid values
  }

  return errors;
}

/**
 * Validates a single consultation row
 *
 * Runs all validation checks in order:
 * 1. Visibility constraints (fields not visible shouldn't have values)
 * 2. Required fields (all required fields must have values)
 * 3. Numeric constraints (age, process_number, specialty_year ranges)
 * 4. Date format validation
 * 5. Select/combobox field validation
 * 6. Code-search field validation (ICPC codes, profession)
 * 7. Boolean field validation
 */
export function validateImportRow(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number,
  specialtyFields: SpecialtyField[],
  rawRow?: ImportRow,
  headers?: string[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Run all validation checks
  errors.push(
    ...validateVisibilityConstraints(consultation, rowIndex, specialtyFields),
  );
  errors.push(
    ...validateRequiredFields(consultation, rowIndex, specialtyFields),
  );
  errors.push(...validateNumericConstraints(consultation, rowIndex));
  errors.push(...validateDate(consultation, rowIndex));
  errors.push(
    ...validateSelectFields(
      consultation,
      rowIndex,
      specialtyFields,
      rawRow,
      headers,
    ),
  );
  errors.push(
    ...validateCodeSearchFields(
      consultation,
      rowIndex,
      specialtyFields,
      rawRow,
      headers,
    ),
  );
  errors.push(
    ...validateBooleanFields(
      consultation,
      rowIndex,
      specialtyFields,
      rawRow,
      headers,
    ),
  );
  errors.push(...validateTextFields(consultation, rowIndex, specialtyFields));
  errors.push(
    ...validateTextListFields(consultation, rowIndex, specialtyFields),
  );

  return errors;
}

/**
 * Validates all import rows and returns preview data
 *
 * Process:
 * 1. Map each row to consultation structure
 * 2. Validate each consultation
 * 3. Return preview with errors and summary statistics
 */
export function validateImportData(
  rows: ImportRow[],
  headers: string[],
  userId: string,
  specialtyId: string,
  specialtyCode: string,
  defaultSpecialtyYear: number,
): ImportPreviewData {
  const specialtyFields = specialtyCode === "mgf" ? MGF_FIELDS : [];
  const consultations: ImportPreviewData["consultations"] = [];
  let validCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowIndex = i + 1; // 1-based for display
    const row = rows[i];

    const consultation = mapImportRowToConsultation(
      row,
      headers,
      userId,
      specialtyId,
      specialtyCode,
      defaultSpecialtyYear,
    );

    const errors = validateImportRow(
      consultation,
      rowIndex,
      specialtyFields,
      row,
      headers,
    );

    consultations.push({
      data: consultation,
      errors,
      rowIndex,
    });

    if (errors.length === 0) {
      validCount++;
    }
  }

  return {
    consultations,
    summary: {
      total: rows.length,
      valid: validCount,
      invalid: rows.length - validCount,
    },
  };
}
