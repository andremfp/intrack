// User-related constants
export const USER_CONSTANTS = {
  MAX_DISPLAY_NAME_LENGTH: 30,
} as const;

// Specialty codes
export const SPECIALTY_CODES = {
  MGF: "mgf",
} as const;

// Import ICPC-2 codes
export type { ICPC2Code } from "./icpc2-codes";
import { MGF_ICPC2_CODES } from "./icpc2-codes";

// Common types
export type TabType = "Resumo" | "Consultas";

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
  | "number"
  | "textarea"
  | "text-list"
  | "icpc2-codes";

export interface SpecialtyField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  defaultValue?: string | number | boolean | null;
  options?: { value: string; label: string }[];
  placeholder?: string;
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
    key: "health_number",
    label: "Número de Saúde",
    type: "number",
    required: true,
  },
];

// MGF (Medicina Geral e Familiar) specialty fields
export const MGF_FIELDS: SpecialtyField[] = [
  {
    key: "type",
    label: "Tipologia de Consulta",
    type: "select",
    required: true,
    options: [
      { value: "SA", label: "Saúde Adulto" },
      { value: "SIJ", label: "Saúde Infantil e Juvenil" },
      { value: "PF", label: "Planeamento Familiar" },
      { value: "SM", label: "Saúde Materna" },
      { value: "DM", label: "Diabetes" },
      { value: "HTA", label: "Hipertensão Arterial" },
      { value: "DA", label: "Doença Aguda" },
      { value: "AM", label: "Acto Médico" },
    ],
  },
  {
    key: "presential",
    label: "Presencial",
    type: "boolean",
    defaultValue: true,
  },
  {
    key: "chronic_diseases",
    label: "Doenças Crónicas",
    type: "text-list",
    placeholder: "Digite uma doença crónica",
  },
  {
    key: "diagnosis",
    label: "Diagnóstico",
    type: "icpc2-codes",
    placeholder: "Pesquisar códigos ICPC-2",
  },
  {
    key: "problems",
    label: "Problemas",
    type: "icpc2-codes",
    placeholder: "Pesquisar códigos ICPC-2",
  },
  {
    key: "new_diagnosis",
    label: "Novo Diagnóstico",
    type: "icpc2-codes",
    placeholder: "Pesquisar códigos ICPC-2",
  },
  {
    key: "alert",
    label: "Alerta",
    type: "text",
    placeholder: "Tipo de alerta",
  },
  {
    key: "alert_motive",
    label: "Motivo do Alerta",
    type: "text",
    placeholder: "Razão do alerta",
  },
  {
    key: "contraceptive",
    label: "Contraceptivo",
    type: "select",
    placeholder: "Tipo de contraceptivo",
    options: [
      { value: "none", label: "Nenhum" },
      { value: "coc", label: "COC" },
      { value: "cop", label: "COP" },
      { value: "siu", label: "SIU" },
      { value: "condom", label: "Preservativo" },
      { value: "implant", label: "Implante" },
      { value: "ring", label: "Anel Vaginal" },
      { value: "adhesive", label: "Adesivo" },
      { value: "ligation", label: "Laqueação" },
      { value: "natural", label: "Natural" },
      { value: "menopause", label: "Menopausa" },
      { value: "man", label: "Homem" },
    ],
  },
  {
    key: "new_contraceptive",
    label: "Novo Contraceptivo",
    type: "select",
    placeholder: "Tipo de contraceptivo",
    options: [
      { value: "none", label: "Nenhum" },
      { value: "coc", label: "COC" },
      { value: "cop", label: "COP" },
      { value: "siu", label: "SIU" },
      { value: "condom", label: "Preservativo" },
      { value: "implant", label: "Implante" },
      { value: "ring", label: "Anel Vaginal" },
      { value: "adhesive", label: "Adesivo" },
      { value: "ligation", label: "Laqueação" },
      { value: "natural", label: "Natural" },
      { value: "menopause", label: "Menopausa" },
      { value: "man", label: "Homem" },
    ],
  },
  {
    key: "smoker",
    label: "Fumador",
    type: "boolean",
    defaultValue: false,
  },
  {
    key: "procedure",
    label: "Procedimento",
    type: "text",
    placeholder: "Procedimentos realizados",
  },
  {
    key: "notes",
    label: "Notas",
    type: "textarea",
    placeholder: "Observações adicionais",
  },
];

// Type for specialty details JSONB
export type SpecialtyDetails = Record<
  string,
  string | number | boolean | null | string[]
>;

// Get default details object for a specialty (with all fields initialized)
export function getDefaultSpecialtyDetails(
  specialtyCode: string
): SpecialtyDetails {
  switch (specialtyCode) {
    case SPECIALTY_CODES.MGF:
      return MGF_FIELDS.reduce((acc, field) => {
        acc[field.key] =
          field.defaultValue !== undefined ? field.defaultValue : null;
        return acc;
      }, {} as SpecialtyDetails);
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
