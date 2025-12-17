import {
  COMMON_CONSULTATION_FIELDS,
  MGF_FIELDS,
} from "@/constants";

// Create maps for quick field lookup
export const commonFieldByKey = new Map(
  COMMON_CONSULTATION_FIELDS.map((field) => [field.key, field])
);

export const mgfFieldByKey = new Map(MGF_FIELDS.map((field) => [field.key, field]));

// Header to field key mapping (Portuguese headers from export)
// Includes variations to handle different header formats
export const HEADER_TO_KEY_MAP: Record<string, string> = {
  Data: "date",
  "NOC": "process_number",
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
  "Sector de Actividade": "professional_area",
  "Setor de Actividade": "professional_area",
  "Setor de Atividade": "professional_area",
  "Sector de Atividade": "professional_area",
  Profissão: "profession",
  Profissao: "profession",
  Contraceptivo: "contraceptive",
  "Novo Contraceptivo": "new_contraceptive",
  "Diagnóstico": "diagnosis",
  "Problemas": "problems",
  "Novo Diagnóstico": "new_diagnosis",
  "Doenças Crónicas": "chronic_diseases",
  "Doencas Cronicas": "chronic_diseases",
  Procedimento: "procedure",
  Notas: "notes",
  Referenciação: "referrence",
  Referenciacao: "referrence",
  "Motivo da Referenciação": "referrence_motive",
  "Motivo da Referenciacao": "referrence_motive",
};

// Boolean parsing constants
export const TRUE_VALUES = new Set(["sim", "s", "yes", "y", "true", "1"]);
export const FALSE_VALUES = new Set(["não", "nao", "n", "no", "false", "0"]);

// Age unit abbreviations mapping
export const AGE_UNIT_ABBREVIATIONS: Record<string, string> = {
  D: "days",
  S: "weeks",
  M: "months",
  A: "years",
} as const;

// Date parsing constants
export const EXCEL_EPOCH = new Date(1899, 11, 30); // Dec 30, 1899 (day before Jan 1, 1900)
export const MS_PER_DAY = 86400000;
export const EXCEL_SERIAL_MIN = 1;
export const EXCEL_SERIAL_MAX = 1000000;
export const DATE_FORMAT_ISO = /^\d{4}-\d{2}-\d{2}$/;
export const DATE_FORMAT_DMY = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/;

// ICPC-2 code pattern: letter followed by 2 digits (e.g., A01)
export const ICPC_CODE_PATTERN = /^([A-Z]\d{2})/;

// Top-level fields (stored directly on consultation object)
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

// ICPC-2 code fields
export const ICPC_CODE_FIELDS = new Set([
  "diagnosis",
  "problems",
  "new_diagnosis",
  "referrence_motive",
]);

// Text list fields
export const TEXT_LIST_FIELDS = new Set([
  "chronic_diseases",
  "procedure",
  "notes",
]);

// Validation constants
export const MIN_AGE = 0;
export const MAX_AGE = 150;
export const MIN_SPECIALTY_YEAR = 1;
export const MAX_PROCESS_NUMBER_DIGITS = 9;

