/**
 * EXPORT CONSTANTS MODULE
 * =======================
 *
 * Contains:
 * - Field lookup maps (for fast field retrieval)
 * - Key to header mappings (English → Portuguese)
 * - Export-specific constants
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
// KEY TO HEADER MAPPINGS
// ============================================================================

/**
 * Maps field keys to Portuguese headers for export
 *
 * This is the reverse of imports/constants.ts HEADER_TO_KEY_MAP
 * Used to generate export column headers from field keys
 *
 * Note: For fields with multiple header variations in imports (e.g., "Estágio" vs "Estagio"),
 * we use the canonical/accented version for exports.
 */
export const KEY_TO_HEADER_MAP: Record<string, string> = {
  id: "ID Consulta",
  date: "Data",
  process_number: "Número de Processo",
  specialty_year: "Ano de Especialidade",
  favorite: "Favorito",
  location: "Local",
  autonomy: "Autonomia",
  sex: "Sexo",
  age: "Idade",
  age_unit: "Unidade de Idade",
  family_type: "Tipologia de Família",
  school_level: "Escolaridade",
  professional_situation: "Situação Profissional",
  professional_area: "Sector de Actividade",
  profession: "Profissão",
  alcohol: "Alcoól",
  drugs: "Drogas",
  vaccination_plan: "PNV Cumprido",
  type: "Tipologia",
  presential: "Presencial",
  smoker: "Fumador",
  chronic_diseases: "Doenças Crónicas",
  internship: "Estágio",
  contraceptive: "Contraceptivo",
  new_contraceptive: "Novo Contraceptivo",
  diagnosis: "Diagnóstico (ICPC-2)",
  problems: "Problemas (ICPC-2)",
  new_diagnosis: "Novo Diagnóstico (ICPC-2)",
  referrence: "Referenciação",
  referrence_motive: "Motivo da Referenciação (ICPC-2)",
  procedure: "Procedimento",
  notes: "Notas",
};

// ============================================================================
// EXPORT CONSTANTS
// ============================================================================

/**
 * Top-level fields stored directly on consultation object (not in details JSONB)
 * Used to determine field source for export
 */
export const TOP_LEVEL_FIELDS = new Set([
  "id",
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
 * These are formatted as semicolon-separated strings in exports
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
