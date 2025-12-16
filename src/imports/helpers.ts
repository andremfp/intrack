import type { ConsultationInsert } from "@/lib/api/consultations";
import type {
  ImportRow,
  ValidationError,
  ImportPreviewData,
} from "./types";
import {
  mapHeaderToKey,
  parseBoolean,
  parseDate,
  parseNumber,
  parseSelectValue,
  parseTextList,
  parseIcpcCodes,
  getFieldSource,
  validateLocationAndInternship,
} from "./mapping";
import {
  COMMON_CONSULTATION_FIELDS,
  MGF_FIELDS,
  getDefaultSpecialtyDetails,
} from "@/constants";
import type { SpecialtyField } from "@/constants";
import {
  commonFieldByKey,
  mgfFieldByKey,
  ICPC_CODE_FIELDS,
  TEXT_LIST_FIELDS,
  MIN_AGE,
  MAX_AGE,
  MIN_SPECIALTY_YEAR,
  MAX_PROCESS_NUMBER_DIGITS,
  EXCEL_EPOCH,
  MS_PER_DAY,
} from "./constants";

/**
 * Gets a field definition by key from either common or specialty fields
 */
export function getFieldByKey(fieldKey: string): SpecialtyField | undefined {
  return commonFieldByKey.get(fieldKey) || mgfFieldByKey.get(fieldKey);
}

/**
 * Converts Excel serial date number to JavaScript Date
 * Excel epoch: January 1, 1900 (serial number 1)
 */
export function excelSerialToDate(serial: number): Date {
  return new Date(EXCEL_EPOCH.getTime() + serial * MS_PER_DAY);
}

/**
 * Validates a select field value against its options
 */
export function validateSelectValue(
  field: SpecialtyField,
  value: unknown,
  rowIndex: number
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
 * Gets a value from consultation (top-level or details)
 */
function getConsultationValue(
  consultation: Partial<ConsultationInsert>,
  fieldKey: string
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

/**
 * Checks if a row is empty (all values are null, empty, or whitespace)
 */
function isRowEmpty(row: ImportRow): boolean {
  return Object.values(row).every((value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    return false;
  });
}

/**
 * Parses a CSV line handling quoted values
 */
function parseCsvLine(line: string): string[] {
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
            `Erro ao processar CSV: ${error instanceof Error ? error.message : "Erro desconhecido"}`
          )
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
          String(h || "").trim()
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
            `Erro ao processar ficheiro: ${error instanceof Error ? error.message : "Erro desconhecido"}`
          )
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
 * Maps a field value based on its type and source
 */
function mapFieldValue(
  fieldKey: string,
  rawValue: unknown,
  specialtyCode: string
): unknown {
  const field = getFieldByKey(fieldKey);

  // Handle ICPC-2 code fields
  if (ICPC_CODE_FIELDS.has(fieldKey)) {
    return parseIcpcCodes(rawValue, specialtyCode);
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

  // Handle select/combobox fields
  if (field?.type === "select" || field?.type === "combobox") {
    return parseSelectValue(fieldKey, rawValue);
  }

  return null;
}

/**
 * Maps an import row to a ConsultationInsert structure
 */
export function mapImportRowToConsultation(
  row: ImportRow,
  headers: string[],
  userId: string,
  specialtyId: string,
  specialtyCode: string,
  defaultSpecialtyYear: number
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
    const source = getFieldSource(fieldKey);
    const mappedValue = mapFieldValue(fieldKey, rawValue, specialtyCode);

    if (mappedValue === null || mappedValue === undefined) continue;

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
      // Details fields
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


/**
 * Validates required fields
 */
function validateRequiredFields(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number,
  specialtyFields: SpecialtyField[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  const requiredFields = [
    ...COMMON_CONSULTATION_FIELDS.filter((f) => f.requiredWhen === "always"),
    ...specialtyFields.filter((f) => f.requiredWhen === "always"),
  ];

  for (const field of requiredFields) {
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
 */
function validateNumericConstraints(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number
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
    if (String(consultation.process_number).length > MAX_PROCESS_NUMBER_DIGITS) {
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
 */
function validateDate(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number
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
 */
function validateSelectFields(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number,
  specialtyFields: SpecialtyField[],
  rawRow?: ImportRow,
  headers?: string[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const allFields = [...COMMON_CONSULTATION_FIELDS, ...specialtyFields];
  const skipFields = new Set(["location", "internship"]); // Handled separately

  for (const field of allFields) {
    if (field.type !== "select" && field.type !== "combobox") continue;
    if (!field.options || field.options.length === 0) continue;
    if (skipFields.has(field.key)) continue;

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
          const validOptions = field.options.map((opt) => opt.label).join(", ");
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
    const validValues = new Set(field.options.map((opt) => opt.value));
    if (typeof value === "string" && !validValues.has(value)) {
      const validOptions = field.options.map((opt) => opt.label).join(", ");
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
 * Validates a single consultation row
 */
export function validateImportRow(
  consultation: Partial<ConsultationInsert>,
  rowIndex: number,
  specialtyFields: SpecialtyField[],
  rawRow?: ImportRow,
  headers?: string[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Run all validation checks
  errors.push(...validateRequiredFields(consultation, rowIndex, specialtyFields));
  errors.push(...validateNumericConstraints(consultation, rowIndex));
  errors.push(...validateDate(consultation, rowIndex));
  errors.push(
    ...validateLocationAndInternship(consultation, rowIndex)
  );
  errors.push(
    ...validateSelectFields(consultation, rowIndex, specialtyFields, rawRow, headers)
  );

  return errors;
}

/**
 * Validates all import rows and returns preview data
 */
export function validateImportData(
  rows: ImportRow[],
  headers: string[],
  userId: string,
  specialtyId: string,
  specialtyCode: string,
  defaultSpecialtyYear: number
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
      defaultSpecialtyYear
    );
    
    const errors = validateImportRow(
      consultation,
      rowIndex,
      specialtyFields,
      row,
      headers
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

