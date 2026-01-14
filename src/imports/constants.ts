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

import {
  COMMON_CONSULTATION_FIELDS,
  MGF_FIELDS,
  MGF_CONSULTATION_TYPE_SECTIONS,
} from "@/constants";

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
  "Lista Própria": "own_list",
  "Lista Propria": "own_list",
  "Outra Lista": "other_list",
  Fumador: "smoker",
  Favorito: "favorite",
  Estágio: "internship",
  Estagio: "internship",
  "Tipologia de Família": "family_type",
  "Tipologia de Familia": "family_type",
  Escolaridade: "school_level",
  "Situação Profissional": "professional_situation",
  "Situacao Profissional": "professional_situation",
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
  // Type-specific fields: DM (Diabetes)
  "DM - Creatinina (mg/dL)": "dm_exams_creatinina",
  "DM - Creatinina": "dm_exams_creatinina",
  "DM - Score2": "dm_exams_score2",
  "DM - Albuminuria (mg/g)": "dm_exams_albuminuria",
  "DM - Albuminuria": "dm_exams_albuminuria",
  "DM - LDL (mg/dL)": "dm_exams_ldl",
  "DM - LDL": "dm_exams_ldl",
  "DM - HbA1C (%)": "dm_exams_hba1c",
  "DM - HbA1C": "dm_exams_hba1c",
  "DM - TFG (mL/min)": "dm_exams_tfg",
  "DM - TFG": "dm_exams_tfg",
  "DM - Medicamentos": "dm_history_medicamentos",
  "DM - Complicações": "dm_history_complicacoes",
  "DM - Complicacoes": "dm_history_complicacoes",
  // Type-specific fields: HTA (Hipertensão Arterial)
  "HTA - Creatinina (mg/dL)": "hta_exams_creatinina",
  "HTA - Creatinina": "hta_exams_creatinina",
  "HTA - Score2": "hta_exams_score2",
  "HTA - Albuminuria (mg/g)": "hta_exams_albuminuria",
  "HTA - Albuminuria": "hta_exams_albuminuria",
  "HTA - LDL (mg/dL)": "hta_exams_ldl",
  "HTA - LDL": "hta_exams_ldl",
  "HTA - TFG (mL/min)": "hta_exams_tfg",
  "HTA - TFG": "hta_exams_tfg",
  "HTA - Medicamentos": "hta_history_medicamentos",
  "HTA - Complicações": "hta_history_complicacoes",
  "HTA - Complicacoes": "hta_history_complicacoes",
  // Type-specific fields: SM (Saúde Materna)
  "SM - Trimestre": "sm_history_trimestre",
  "SM - Plano de Vigilância": "sm_history_plano_vigilancia",
  "SM - Plano de Vigilancia": "sm_history_plano_vigilancia",
  "SM - Complicações": "sm_history_complicacoes",
  "SM - Complicacoes": "sm_history_complicacoes",
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

// ============================================================================
// TYPE-SPECIFIC FIELD PARSING
// ============================================================================

/**
 * Parses a type-specific field key to extract type, section, and field information
 *
 * Format: "{typeKey}_{sectionKey}_{fieldKey}"
 * Examples:
 * - "dm_exams_creatinina" → { typeKey: "dm", sectionKey: "exams", fieldKey: "creatinina" }
 * - "sm_history_plano_vigilancia" → { typeKey: "sm", sectionKey: "history", fieldKey: "plano-vigilancia" }
 *
 * Returns: parsed info or null if not a type-specific field
 */
export function parseTypeSpecificKey(
  fieldKey: string
): { typeKey: string; sectionKey: string; fieldKey: string } | null {
  // Type-specific fields follow pattern: {type}_{section}_{field}
  // We need to handle cases where fieldKey itself contains underscores (e.g., "plano-vigilancia")
  const parts = fieldKey.split("_");
  if (parts.length < 3) return null;

  const typeKey = parts[0];
  const sectionKey = parts[1];
  // Join remaining parts as fieldKey (handles fields with underscores/hyphens)
  const actualFieldKey = parts.slice(2).join("_");

  // Validate that this is a known type-specific field
  const typeSections = MGF_CONSULTATION_TYPE_SECTIONS[typeKey];
  if (!typeSections) return null;

  const section = typeSections.find((s) => s.key === sectionKey);
  if (!section) return null;

  const field = section.fields.find((f) => f.key === actualFieldKey);
  if (!field) return null;

  return { typeKey, sectionKey, fieldKey: actualFieldKey };
}
