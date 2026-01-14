/**
 * IMPORT CONSTANTS MODULE
 * =======================
 *
 * Contains:
 * - Field lookup maps (for fast field retrieval)
 * - Header to field key mappings (Portuguese → English)
 * - Field type sets (ICPC codes, text lists, code-search, etc.)
 * - Validation constants (min/max values, patterns)
 * - Parsing constants (date formats, boolean values, etc.)
 */

import { COMMON_CONSULTATION_FIELDS, MGF_FIELDS } from "@/constants";

// ============================================================================
// FIELD LOOKUP MAPS
// ============================================================================

// Create maps for quick field lookup
export const commonFieldByKey = new Map(
  COMMON_CONSULTATION_FIELDS.map((field) => [field.key, field])
);

export const mgfFieldByKey = new Map(
  MGF_FIELDS.map((field) => [field.key, field])
);

// ============================================================================
// HEADER MAPPINGS
// ============================================================================

/**
 * Maps Portuguese headers to field keys
 *
 * Includes variations to handle:
 * - Accent differences (Estágio vs Estagio)
 * - Case differences
 * - Alternative names
 */
export const HEADER_TO_KEY_MAP: Record<string, string> = {
  Data: "date",
  NOC: "process_number",
  "Número de Processo": "process_number",
  Local: "location",
  Autonomia: "autonomy",
  Sexo: "sex",
  Idade: "age",
  "Unidade de Idade": "age_unit",
  Tipologia: "type",
  "Tipologia Consulta": "type",
  Presencial: "presential",
  Fumador: "smoker",
  Favorito: "favorite",
  Estágio: "internship",
  Estagio: "internship",
  "Tipologia de Família": "family_type",
  "Tipologia de Familia": "family_type",
  Escolaridade: "school_level",
  "Situação Profissional": "professional_situation",
  "Situacao Profissional": "professional_situation",
  "Sector de Actividade": "professional_area",
  "Setor de Actividade": "professional_area",
  "Setor de Atividade": "professional_area",
  "Sector de Atividade": "professional_area",
  Profissão: "profession",
  Profissao: "profession",
  Alcoól: "alcohol",
  Alcool: "alcohol",
  Drogas: "drugs",
  Contraceptivo: "contraceptive",
  "Novo Contraceptivo": "new_contraceptive",
  Diagnóstico: "diagnosis",
  Problemas: "problems",
  "Novo Diagnóstico": "new_diagnosis",
  "Doenças Crónicas": "chronic_diseases",
  "Doencas Cronicas": "chronic_diseases",
  Procedimento: "procedure",
  Notas: "notes",
  Referenciação: "referrence",
  Referenciacao: "referrence",
  "Motivo da Referenciação": "referrence_motive",
  "Motivo da Referenciacao": "referrence_motive",
  "PNV Cumprido": "vaccination_plan",
};

// ============================================================================
// PARSING CONSTANTS
// ============================================================================

// Boolean parsing: accepted values for true/false
export const TRUE_VALUES = new Set(["sim", "s", "yes", "y", "true", "1"]);
export const FALSE_VALUES = new Set(["não", "nao", "n", "no", "false", "0"]);

// Age unit abbreviations: single letter → full value
export const AGE_UNIT_ABBREVIATIONS: Record<string, string> = {
  D: "days",
  S: "weeks",
  M: "months",
  A: "years",
} as const;

// Date parsing: Excel serial date support
export const EXCEL_EPOCH = new Date(1899, 11, 30); // Dec 30, 1899 (day before Jan 1, 1900)
export const MS_PER_DAY = 86400000;
export const EXCEL_SERIAL_MIN = 1;
export const EXCEL_SERIAL_MAX = 1000000;

// Date format patterns
export const DATE_FORMAT_ISO = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
export const DATE_FORMAT_DMY = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/; // DD/MM/YYYY variants

// Code patterns
export const ICPC_CODE_PATTERN = /^([A-Z]\d{2})/; // Letter + 2 digits (e.g., A01)
export const PROFESSION_CODE_PATTERN = /^(\d+\.\d+)/; // Digits.digit (e.g., 5230.2)

// ============================================================================
// FIELD TYPE SETS
// ============================================================================

/**
 * Top-level fields stored directly on consultation object (not in details JSONB)
 */
export const TOP_LEVEL_FIELDS = new Set([
  "date",
  "process_number",
  "specialty_year",
  "location",
  "autonomy",
  "sex",
  "age",
  "age_unit",
  "favorite",
]);

/**
 * ICPC-2 code fields (code-search type, multiple selection)
 * These use parseIcpcCodes() which returns string[]
 * Pattern: Letter + 2 digits (e.g., A01)
 */
export const ICPC_CODE_FIELDS = new Set([
  "diagnosis",
  "problems",
  "new_diagnosis",
  "referrence_motive",
]);

/**
 * Text list fields (semicolon-separated free text)
 */
export const TEXT_LIST_FIELDS = new Set([
  "chronic_diseases",
  "procedure",
  "notes",
]);

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const MIN_AGE = 0;
export const MAX_AGE = 150;
export const MIN_SPECIALTY_YEAR = 1;
export const MAX_PROCESS_NUMBER_DIGITS = 9;
export const MAX_TEXT_FIELD_LENGTH = 20;
export const MAX_TEXT_LIST_ITEM_LENGTH = 100;
