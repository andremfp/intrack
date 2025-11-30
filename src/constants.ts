// User-related constants
export const USER_CONSTANTS = {
  MAX_DISPLAY_NAME_LENGTH: 30,
} as const;

// Pagination constants
export const PAGINATION_CONSTANTS = {
  CONSULTATIONS_PAGE_SIZE: 50,
} as const;

// Tab constants
export const TAB_CONSTANTS = {
  MAIN_TABS: {
    METRICS: "Métricas",
    CONSULTATIONS: "Consultas",
  },
  METRICS_SUB_TABS: {
    GENERAL: "Geral",
    CONSULTATIONS: "Consultas",
    ICPC2: "ICPC-2",
  },
} as const;

// Specialty codes
export const SPECIALTY_CODES = {
  MGF: "mgf",
} as const;

// Import ICPC-2 codes
export type { ICPC2Code } from "./icpc2-codes";
import { MGF_ICPC2_CODES } from "./icpc2-codes";
import type { FilterFieldType } from "@/components/filters/types";

// Common types
export type TabType = "Métricas" | "Consultas" | string; // string allows "Métricas.Geral", "Métricas.Consultas", "Métricas.ICPC-2", "Consultas.1", "Consultas.2", etc.

// Get ICPC-2 codes for a specialty
export function getICPC2Codes(specialtyCode: string) {
  switch (specialtyCode) {
    case SPECIALTY_CODES.MGF:
      return MGF_ICPC2_CODES;
    default:
      return [];
  }
}

// Field type definitions for forms
export type FieldType =
  | "text"
  | "boolean"
  | "select"
  | "combobox"
  | "number"
  | "text-list"
  | "icpc2-codes";

export interface SpecialtyField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  defaultValue?: string | number | boolean | null;
  options?: SpecialtyFieldOption[];
  placeholder?: string;
  units?: string;
  section?: string; // Optional section grouping for UI organization
}

export interface SpecialtyFieldOption {
  value: string;
  label: string;
}

export interface ConstultationTypeSection {
  key: string;
  label: string;
  fields: SpecialtyField[];
  section?: string; // Optional section grouping for UI organization
}

// Common fields present in all consultations
export const COMMON_CONSULTATION_FIELDS: SpecialtyField[] = [
  {
    key: "date",
    label: "Data",
    type: "text",
    required: true,
  },
  {
    key: "process_number",
    label: "Número de Processo",
    type: "number",
    required: true,
  },
  {
    key: "location",
    label: "Local",
    type: "select",
    required: true,
    options: [
      { value: "health_unit", label: "Unidade de Saúde" },
      { value: "emergency_unit", label: "Serviço de Urgência" },
      { value: "complementary", label: "Formação Complementar" },
      { value: "short_course", label: "Formação Curta" },
    ],
  },
  {
    key: "autonomy",
    label: "Autonomia",
    type: "select",
    required: true,
    options: [
      { value: "partial", label: "Parcial" },
      { value: "full", label: "Total" },
      { value: "observed", label: "Observada" },
      { value: "shoulder-to-shoulder", label: "Ombro-a-ombro" },
    ],
  },
  {
    key: "sex",
    label: "Sexo",
    type: "select",
    required: true,
    options: [
      { value: "m", label: "Masculino" },
      { value: "f", label: "Feminino" },
      { value: "other", label: "Outro" },
    ],
  },
  {
    key: "age",
    label: "Idade",
    type: "number",
    required: true,
  },
  {
    key: "age_unit",
    label: "Unidade de Idade",
    type: "select",
    required: true,
    defaultValue: "years",
    options: [
      { value: "days", label: "Dias" },
      { value: "weeks", label: "Semanas" },
      { value: "months", label: "Meses" },
      { value: "years", label: "Anos" },
    ],
  },
];

// Section labels for MGF fields
export const MGF_SECTION_LABELS: Record<string, string> = {
  consultation_type: "Tipo de Consulta",
  type_specific: "Exames e Avaliações Específicas",
  clinical_history: "História Clínica",
  diagnosis: "Diagnóstico e Problemas",
  referral: "Referenciação",
  family_planning: "Planeamento Familiar",
  procedures: "Procedimentos e Notas",
};

// MGF (Medicina Geral e Familiar) specialty fields
export const MGF_FIELDS: SpecialtyField[] = [
  // Tipo de Consulta
  {
    key: "type",
    label: "Tipologia",
    type: "select",
    required: true,
    section: "consultation_type",
    options: [
      { value: "SA", label: "Saúde Adulto" },
      { value: "SIJ", label: "Saúde Infantil e Juvenil" },
      { value: "PF", label: "Planeamento Familiar" },
      { value: "SM", label: "Saúde Materna" },
      { value: "DM", label: "Diabetes" },
      { value: "HTA", label: "Hipertensão Arterial" },
      { value: "DA", label: "Doença Aguda" },
      { value: "AM", label: "Acto Médico" },
      { value: "Domicílio", label: "Domicílio" },
    ],
  },
  {
    key: "presential",
    label: "Presencial",
    type: "boolean",
    defaultValue: true,
    section: "consultation_type",
  },
  {
    key: "internship",
    label: "Estágio",
    type: "combobox",
    required: true,
    section: "consultation_type",
    options: [
      { value: "cardiologia", label: "Cardiologia" },
      { value: "endocrinologia", label: "Endocrinologia" },
      { value: "gastroenterologia", label: "Gastroenterologia" },
      { value: "geriatria", label: "Geriatria" },
      { value: "hematologia", label: "Hematologia" },
      { value: "neurologia", label: "Neurologia" },
      { value: "nefrologia", label: "Nefrologia" },
      { value: "oncologia", label: "Oncologia" },
      { value: "otorrino", label: "Otorrino" },
      { value: "pediatria", label: "Pediatria" },
      { value: "psiquiatria", label: "Psiquiatria" },
      { value: "reumatologia", label: "Reumatologia" },
      { value: "urologia", label: "Urologia" },
      { value: "ginecologia", label: "Ginecologia" },
      { value: "obstetricia", label: "Obstetricia" },
      { value: "ortopedia", label: "Ortopedia" },
      { value: "neurocirurgia", label: "Neurocirurgia" },
      { value: "pedopsiquiatria", label: "Pedopsiquiatria" },
      { value: "dermatologia", label: "Dermatologia" },
      { value: "paliativos", label: "Paliativos" },
      { value: "pneumologia", label: "Pneumologia" },
      { value: "cirurgia_vascular", label: "Cirurgia Vascular" },
      { value: "cirurgia_toracica", label: "Cirurgia Toracica" },
      { value: "cirurgia_geral", label: "Cirurgia Geral" },
      { value: "medicina_interna", label: "Medicina Interna" },
      { value: "formacao_curta", label: "Formação Curta" },
    ],
  },
  // História Clínica
  {
    key: "smoker",
    label: "Fumador",
    type: "boolean",
    defaultValue: false,
    section: "clinical_history",
  },
  {
    key: "chronic_diseases",
    label: "Doenças Crónicas",
    type: "text-list",
    placeholder: "Digite uma doença crónica",
    section: "clinical_history",
  },
  // Diagnóstico e Problemas
  {
    key: "diagnosis",
    label: "Diagnóstico",
    type: "icpc2-codes",
    placeholder: "Pesquisar códigos ICPC-2",
    section: "diagnosis",
  },
  {
    key: "problems",
    label: "Problemas",
    type: "icpc2-codes",
    placeholder: "Pesquisar códigos ICPC-2",
    section: "diagnosis",
  },
  {
    key: "new_diagnosis",
    label: "Novo Diagnóstico",
    type: "icpc2-codes",
    placeholder: "Pesquisar códigos ICPC-2",
    section: "diagnosis",
  },
  // Referenciação
  {
    key: "referrence",
    label: "Referenciação",
    type: "combobox",
    placeholder: "Referenciação",
    section: "referral",
    options: [
      { value: "cardiologia", label: "Cardiologia" },
      { value: "endocrinologia", label: "Endocrinologia" },
      { value: "gastroenterologia", label: "Gastroenterologia" },
      { value: "geriatria", label: "Geriatria" },
      { value: "hematologia", label: "Hematologia" },
      { value: "neurologia", label: "Neurologia" },
      { value: "nefrologia", label: "Nefrologia" },
      { value: "oncologia", label: "Oncologia" },
      { value: "otorrino", label: "Otorrino" },
      { value: "pediatria", label: "Pediatria" },
      { value: "psiquiatria", label: "Psiquiatria" },
      { value: "reumatologia", label: "Reumatologia" },
      { value: "urologia", label: "Urologia" },
      { value: "ginecologia", label: "Ginecologia" },
      { value: "obstetricia", label: "Obstetricia" },
      { value: "ortopedia", label: "Ortopedia" },
      { value: "neurocirurgia", label: "Neurocirurgia" },
      { value: "pedopsiquiatria", label: "Pedopsiquiatria" },
      { value: "dermatologia", label: "Dermatologia" },
      { value: "paliativos", label: "Paliativos" },
      { value: "pneumologia", label: "Pneumologia" },
      { value: "cirurgia_vascular", label: "Cirurgia Vascular" },
      { value: "cirurgia_toracica", label: "Cirurgia Toracica" },
      { value: "cirurgia_geral", label: "Cirurgia Geral" },
      { value: "medicina_interna", label: "Medicina Interna" },
    ],
  },
  {
    key: "referrence_motive",
    label: "Motivo da referenciação",
    type: "icpc2-codes",
    placeholder: "Motivo da referenciação",
    section: "referral",
  },
  // Planeamento Familiar
  {
    key: "contraceptive",
    label: "Contraceptivo",
    type: "combobox",
    placeholder: "Tipo de contraceptivo",
    section: "family_planning",
    options: [
      { value: "coc", label: "COC" },
      { value: "cop", label: "COP" },
      { value: "siu", label: "SIU" },
      { value: "preservativo", label: "Preservativo" },
      { value: "implante", label: "Implante" },
      { value: "anel", label: "Anel Vaginal" },
      { value: "adesivo", label: "Adesivo" },
      { value: "laqueacao", label: "Laqueação" },
      { value: "natural", label: "Natural" },
      { value: "menopausa", label: "Menopausa" },
    ],
  },
  {
    key: "new_contraceptive",
    label: "Novo Contraceptivo",
    type: "combobox",
    placeholder: "Tipo de contraceptivo",
    section: "family_planning",
    options: [
      { value: "coc", label: "COC" },
      { value: "cop", label: "COP" },
      { value: "siu", label: "SIU" },
      { value: "preservativo", label: "Preservativo" },
      { value: "implant", label: "Implante" },
      { value: "anel", label: "Anel Vaginal" },
      { value: "adesivo", label: "Adesivo" },
      { value: "laqueacao", label: "Laqueação" },
      { value: "natural", label: "Natural" },
      { value: "menopausa", label: "Menopausa" },
    ],
  },
  // Procedimentos e Notas
  {
    key: "procedure",
    label: "Procedimento",
    type: "text-list",
    placeholder: "Procedimentos realizados",
    section: "procedures",
  },
  {
    key: "notes",
    label: "Notas",
    type: "text-list",
    placeholder: "Observações adicionais",
    section: "procedures",
  },
];

export const MGF_CONSULTATION_TYPE_SECTIONS: Record<
  string,
  ConstultationTypeSection[]
> = {
  dm: [{
    key: "exams",
    label: "Diabetes - Exames",
    section: "type_specific",
    fields: [
      {
        key: "creatinina",
        label: "Creatinina",
        type: "number",
        units: "mg/dL",
      },
      {
        key: "bnp",
        label: "BNP",
        type: "number",
        units: "pg/mL",
      },
      {
        key: "albuminuria",
        label: "Albuminuria",
        type: "number",
        units: "mg/g",
      },
      {
        key: "ldl",
        label: "LDL",
        type: "number",
        units: "mg/dL",
      },
      {
        key: "hba1c",
        label: "HbA1C",
        type: "number",
        units: "%",
      },
      {
        key: "tfg",
        label: "TFG",
        type: "number",
        units: "mL/min",
      },
    ],
  }],
  hta: [{
    key: "exams",
    label: "Hipertensão Arterial - Exames",
    section: "type_specific",
    fields: [
      {
        key: "creatinina",
        label: "Creatinina",
        type: "number",
        units: "mg/dL",
      },
      {
        key: "bnp",
        label: "BNP",
        type: "number",
        units: "pg/mL",
      },
      {
        key: "albuminuria",
        label: "Albuminuria",
        type: "number",
        units: "mg/g",
      },
      {
        key: "ldl",
        label: "LDL",
        type: "number",
        units: "mg/dL",
      },
      {
        key: "tfg",
        label: "TFG",
        type: "number",
        units: "mL/min",
      },
    ],
  }],
};

// Type for specialty details JSONB
export type SpecialtyDetails = Record<
  string,
  string | number | boolean | null | string[]
>;

const resolveFieldDefault = (field: SpecialtyField): SpecialtyDetails[string] => {
  if (field.defaultValue !== undefined) {
    return field.defaultValue as SpecialtyDetails[string];
  }

  if (field.type === "text-list") {
    return [] as string[];
  }

  return null;
};

// Get default details object for a specialty (with all fields initialized)
export function getDefaultSpecialtyDetails(
  specialtyCode: string
): SpecialtyDetails {
  switch (specialtyCode) {
    case SPECIALTY_CODES.MGF: {
      const details = MGF_FIELDS.reduce((acc, field) => {
        acc[field.key] = resolveFieldDefault(field);
        return acc;
      }, {} as SpecialtyDetails);

      
      return details;
    }
    default:
      return {};
  }
}

// Get specialty fields definition
export function getSpecialtyFields(specialtyCode: string): SpecialtyField[] {
  switch (specialtyCode) {
    case SPECIALTY_CODES.MGF:
      return MGF_FIELDS;
    default:
      return [];
  }
}

// Convert age to years based on unit
export function ageToYears(age: number, unit: string): number {
  switch (unit) {
    case "days":
      return age / 365.25;
    case "weeks":
      return age / 52.1429;
    case "months":
      return age / 12;
    case "years":
      return age;
    default:
      return age;
  }
}

// Filter field configurations for each component.
// Each component specifies which filters from ConsultationsFilters are enabled in the UI.

/**
 * Enabled filter fields for ConsultationsDashboard/ConsultationsTable
 */
export const CONSULTATIONS_ENABLED_FIELDS: FilterFieldType[] = [
  "processNumber",
  "location",
  "internship",
  "sex",
  "autonomy",
  "ageRange",
  "dateRange",
  "type",
  "presential",
  "smoker",
  "contraceptive",
  "new_contraceptive",
];

/**
 * Enabled filter fields for MetricsDashboard - GeneralTab
 */
export const METRICS_GENERAL_ENABLED_FIELDS: FilterFieldType[] = [
  "year",
  "location",
  "internship",
  "sex",
  "autonomy",
  "ageRange",
  "dateRange",
  "type",
  "presential",
  "smoker",
  "contraceptive",
  "new_contraceptive",
];

/**
 * Enabled filter fields for MetricsDashboard - ConsultationsTab
 */
export const METRICS_CONSULTATIONS_ENABLED_FIELDS: FilterFieldType[] = [
  "year",
  "location",
  "internship",
  "sex",
  "autonomy",
  "ageRange",
  "dateRange",
  "type",
  "presential",
  "smoker",
  "contraceptive",
  "new_contraceptive",
];

/**
 * Enabled filter fields for MetricsDashboard - ICPC2Tab
 */
export const METRICS_ICPC2_ENABLED_FIELDS: FilterFieldType[] = [
  "year",
  "location",
  "internship",
  "sex",
  "autonomy",
  "ageRange",
  "dateRange",
  "type",
  "presential",
  "smoker",
  "contraceptive",
  "new_contraceptive",
];

/**
 * SORTING CONFIGURATION
 * =====================
 */

// Shared sorting field type for consultations (used in API, UI, and utilities).
export type ConsultationsSortingField = "date" | "age" | "process_number";

/**
 * Enabled sorting fields for consultations (table, API, etc.).
 * Central place to add/remove supported sorting fields.
 */
export const CONSULTATIONS_ENABLED_SORTING_FIELDS: ConsultationsSortingField[] =
  ["date", "age", "process_number"];

/**
 * Human-readable labels for each consultations sorting field.
 * Used by sorting UI components.
 */
export const CONSULTATIONS_SORTING_FIELD_LABELS: Record<
  ConsultationsSortingField,
  string
> = {
  date: "Data",
  age: "Idade",
  process_number: "N° Processo",
};
