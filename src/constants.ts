export const SCROLLBAR_CLASSES =
  "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-corner]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40";

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
    REPORTS: "Relatórios",
  },
  METRICS_SUB_TABS: {
    GENERAL: "Geral",
    CONSULTATIONS: "Consultas",
  },
} as const;

// Specialty codes
export const SPECIALTY_CODES = {
  MGF: "mgf",
} as const;

// Import ICPC-2 codes
import { MGF_ICPC2_CODES } from "./icpc2-codes";
import { PROFESSIONS } from "./professions";
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
  | "multi-select"
  | "boolean"
  | "select"
  | "combobox"
  | "number"
  | "text-list"
  | "code-search";

export type FieldRuleContext = {
  location?: string;
  sex?: string;
  type?: string;
  own_list?: boolean;
};

export type FieldRule =
  | "always"
  | "never"
  | ((ctx: FieldRuleContext) => boolean);

export interface SpecialtyField {
  key: string;
  label: string;
  type: FieldType;
  requiredWhen?: FieldRule;
  visibleWhen?: FieldRule;
  defaultValue?: string | number | boolean | null;
  options?: SpecialtyFieldOption[];
  placeholder?: string;
  units?: string;
  section?: string; // Optional section grouping for UI organization
  mainLocation?: string; // Main location for specialty (used for general metrics tab)
  multiple?: boolean; // For code-search fields: true = multiple selection, false/undefined = single selection
}

// Traditional select/combobox options use value/label
// Code-search options use code/description
export type SpecialtyFieldOption =
  | { value: string; label: string; code?: never; description?: never }
  | { code: string; description: string; value?: never; label?: never };

export interface ConstultationTypeSection {
  key: string;
  label: string;
  fields: SpecialtyField[];
  section?: string; // Optional section grouping for UI organization
  visibleWhen?: FieldRule;
}

// Common fields present in all consultations
export const COMMON_CONSULTATION_FIELDS: SpecialtyField[] = [
  {
    key: "date",
    label: "Data",
    type: "text",
    requiredWhen: "always",
  },
  {
    key: "process_number",
    label: "Número de Processo",
    type: "number",
    requiredWhen: "always",
  },
  {
    key: "sex",
    label: "Sexo",
    type: "select",
    requiredWhen: "always",
    options: [
      { value: "f", label: "Feminino" },
      { value: "m", label: "Masculino" },
      { value: "other", label: "Outro" },
    ],
  },
  {
    key: "age",
    label: "Idade",
    type: "number",
    requiredWhen: "always",
  },
  {
    key: "age_unit",
    label: "Unidade de Idade",
    type: "select",
    requiredWhen: "always",
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
  patient_info: "Caracterização do Utente",
  consultation_info: "Informação da Consulta",
  type_specific: "Exames e Avaliações Específicas",
  clinical_history: "História Clínica",
  diagnosis: "Diagnóstico e Problemas",
  referral: "Referenciação",
  family_planning: "Planeamento Familiar",
  procedures: "Procedimentos e Notas",
};

// MGF (Medicina Geral e Familiar) specialty fields
export const MGF_FIELDS: SpecialtyField[] = [
  // Informação da Consulta
  {
    key: "location",
    label: "Local",
    type: "select",
    requiredWhen: "always",
    section: "consultation_info",
    mainLocation: "unidade",
    options: [
      { value: "unidade", label: "Unidade de Saúde" },
      { value: "urgência", label: "Serviço de Urgência" },
      { value: "complementar", label: "Formação Complementar" },
      { value: "form_curta", label: "Formação Curta" },
    ],
  },
  {
    key: "autonomy",
    label: "Autonomia",
    type: "select",
    requiredWhen: "always",
    section: "consultation_info",
    options: [
      { value: "observada", label: "Observada" },
      { value: "ombro-a-ombro", label: "Ombro-a-ombro" },
      { value: "parcial", label: "Parcial" },
      { value: "total", label: "Total" },
    ],
  },
  {
    key: "type",
    label: "Tipologia",
    type: "select",
    requiredWhen: (ctx) => ctx.location === "unidade",
    visibleWhen: (ctx) => ctx.location === "unidade",
    section: "consultation_info",
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
    requiredWhen: "always",
    section: "consultation_info",
  },
  {
    key: "own_list",
    label: "Lista Própria",
    type: "boolean",
    requiredWhen: (ctx) => !!ctx.location && ctx.location === "unidade",
    visibleWhen: (ctx) => ctx.location === "unidade",
    section: "consultation_info",
  },
  {
    key: "other_list",
    label: "Outra Lista",
    type: "text",
    visibleWhen: (ctx) =>
      !!ctx.location && ctx.location === "unidade" && ctx.own_list === false,
    section: "consultation_info",
  },
  {
    key: "internship",
    label: "Estágio",
    type: "combobox",
    requiredWhen: (ctx) =>
      !!ctx.location && ctx.location !== "unidade" && ctx.location !== "other",
    visibleWhen: (ctx) => ctx.location !== "unidade",
    section: "consultation_info",
    options: [
      { value: "cardio", label: "Cardiologia" },
      { value: "endocrino", label: "Endocrinologia" },
      { value: "gastro", label: "Gastroenterologia" },
      { value: "geriatria", label: "Geriatria" },
      { value: "hemato", label: "Hematologia" },
      { value: "neuro", label: "Neurologia" },
      { value: "nefro", label: "Nefrologia" },
      { value: "onco", label: "Oncologia" },
      { value: "otorrino", label: "Otorrino" },
      { value: "pediatria", label: "Pediatria" },
      { value: "psiquiatria", label: "Psiquiatria" },
      { value: "reumato", label: "Reumatologia" },
      { value: "urologia", label: "Urologia" },
      { value: "gineco", label: "Ginecologia" },
      { value: "obstetricia", label: "Obstetricia" },
      { value: "orto", label: "Ortopedia" },
      { value: "neurocir", label: "Neurocirurgia" },
      { value: "pedopsiquiatria", label: "Pedopsiquiatria" },
      { value: "dermato", label: "Dermatologia" },
      { value: "paliativos", label: "Paliativos" },
      { value: "pneumo", label: "Pneumologia" },
      { value: "cir vascular", label: "Cirurgia Vascular" },
      { value: "cir toracica", label: "Cirurgia Toracica" },
      { value: "cir geral", label: "Cirurgia Geral" },
      { value: "cir plastica", label: "Cirurgia Plástica" },
      { value: "med interna", label: "Medicina Interna" },
      { value: "form_curta", label: "Formação Curta" },
    ],
  },
  // Caracterização do Utente
  {
    key: "family_type",
    label: "Tipologia de Família",
    type: "select",
    visibleWhen: (ctx) => ctx.location === "unidade",
    section: "patient_info",
    options: [{ value: "tipo1", label: "Tipo 1" }],
  },
  {
    key: "school_level",
    label: "Escolaridade",
    type: "select",
    visibleWhen: (ctx) => ctx.location === "unidade",
    section: "patient_info",
    options: [
      { value: "< 4 anos", label: "< 4 Anos" },
      { value: "4 anos", label: "4 Anos" },
      { value: "6 anos", label: "6 Anos" },
      { value: "9 anos", label: "9 Anos" },
      { value: "11 anos", label: "11 Anos" },
      { value: "12 anos", label: "12 Anos" },
      { value: "mestrado", label: "Mestrado" },
      { value: "bacharelato", label: "Bacharelato" },
      { value: "licenciatura", label: "Licenciatura" },
      { value: "doutoramento", label: "Doutoramento" },
      {
        value: "curso_tecnologico",
        label: "Curso Tecnológico/Profissional Nível III",
      },
      { value: "pos_graduacao", label: "Pós-graduação" },
      {
        value: "curso_esp_tecnologica",
        label: "Curso de Especialização Tecnológica",
      },
    ],
  },
  {
    key: "profession",
    label: "Profissão",
    type: "code-search",
    visibleWhen: (ctx) => ctx.location === "unidade",
    section: "patient_info",
    placeholder: "Pesquisar profissão",
    options: PROFESSIONS,
    multiple: false, // Single selection only
  },
  {
    key: "professional_situation",
    label: "Situação Profissional",
    type: "select",
    visibleWhen: (ctx) => ctx.location === "unidade",
    section: "patient_info",
    options: [
      { value: "nao_activa", label: "Não Activa" },
      { value: "activa", label: "Activa" },
      { value: "reformado", label: "Reformado" },
      { value: "estudante", label: "Estudante" },
      { value: "N/A", label: "Não Aplicável" },
      { value: "desconhecida", label: "Desconhecida" },
    ],
  },
  // História Clínica
  {
    key: "smoker",
    label: "Fumador",
    type: "select",
    options: [
      { value: "sim", label: "Sim" },
      { value: "nao", label: "Não" },
      { value: "ex fumador", label: "Ex-fumador" },
    ],
    section: "clinical_history",
  },
  {
    key: "alcohol",
    label: "Alcoól",
    type: "boolean",
    section: "clinical_history",
  },
  {
    key: "drugs",
    label: "Drogas",
    type: "boolean",
    section: "clinical_history",
  },
  {
    key: "vaccination_plan",
    label: "PNV Cumprido",
    type: "boolean",
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
    key: "problems",
    label: "Problemas",
    type: "code-search",
    placeholder: "Pesquisar códigos ICPC-2",
    section: "diagnosis",
    options: MGF_ICPC2_CODES,
    multiple: true, // Multiple selection
  },
  {
    key: "diagnosis",
    label: "Diagnóstico",
    type: "code-search",
    placeholder: "Pesquisar códigos ICPC-2",
    section: "diagnosis",
    options: MGF_ICPC2_CODES,
    multiple: true, // Multiple selection
  },
  {
    key: "new_diagnosis",
    label: "Novo Diagnóstico",
    type: "code-search",
    placeholder: "Pesquisar códigos ICPC-2",
    section: "diagnosis",
    options: MGF_ICPC2_CODES,
    multiple: true, // Multiple selection
  },
  // Referenciação
  {
    key: "referrence",
    label: "Referenciação",
    type: "combobox",
    placeholder: "Referenciação",
    section: "referral",
    visibleWhen: (ctx) => ctx.location === "unidade",
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
      { value: "cirurgia_plastica", label: "Cirurgia Plástica" },
      { value: "medicina_interna", label: "Medicina Interna" },
    ],
  },
  {
    key: "referrence_motive",
    label: "Motivo da referenciação",
    type: "code-search",
    placeholder: "Motivo da referenciação",
    section: "referral",
    visibleWhen: (ctx) => ctx.location === "unidade",
    options: MGF_ICPC2_CODES,
    multiple: true, // Multiple selection
  },
  // Planeamento Familiar
  {
    key: "contraceptive",
    label: "Contraceptivo",
    type: "combobox",
    placeholder: "Tipo de contraceptivo",
    section: "family_planning",
    visibleWhen: (ctx) => ctx.location === "unidade" && ctx.sex !== "m",
    options: [
      { value: "coc", label: "COC" },
      { value: "cop", label: "COP" },
      { value: "siu", label: "SIU" },
      { value: "preserv", label: "Preservativo" },
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
    visibleWhen: (ctx) => ctx.location === "unidade" && ctx.sex !== "m",
    options: [
      { value: "coc", label: "COC" },
      { value: "cop", label: "COP" },
      { value: "siu", label: "SIU" },
      { value: "preserv", label: "Preservativo" },
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
  dm: [
    {
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
          key: "score2",
          label: "Score2",
          type: "text",
          units: "",
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
    },
    {
      key: "history",
      label: "Diabetes - Historial",
      section: "type_specific",
      fields: [
        {
          key: "medicamentos",
          label: "Medicamentos",
          type: "multi-select",
          options: [
            { value: "metformina", label: "Metformina" },
            { value: "sulfonilureia", label: "Sulfonilureia" },
            { value: "pioglitazona", label: "Pioglitazona" },
            { value: "glipizida", label: "Glipizida" },
            { value: "gliclazida", label: "Gliclazida" },
            { value: "glimepirida", label: "Glimepirida" },
          ],
        },
        {
          key: "complicacoes",
          label: "Complicações",
          type: "multi-select",
          options: [
            { value: "microvasculares", label: "Microvasculares" },
            { value: "macrovascular", label: "Macrovasculares" },
          ],
        },
      ],
    },
  ],
  hta: [
    {
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
          key: "score2",
          label: "Score2",
          type: "text",
          units: "",
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
    },
    {
      key: "history",
      label: "Hipertensão Arterial - Historial",
      section: "type_specific",
      fields: [
        {
          key: "medicamentos",
          label: "Medicamentos",
          type: "multi-select",
          options: [
            { value: "beta-bloqueantes", label: "Beta-bloqueantes" },
            { value: "diureticos", label: "Diureticos" },
            {
              value: "inibidores-da-enzima-conversora",
              label: "Inibidores da enzima conversora",
            },
            {
              value: "antagonistas-do-receptor-angiotensina-ii",
              label: "Antagonistas do receptor angiotensina II",
            },
            { value: "outros", label: "Outros" },
          ],
        },
        {
          key: "complicacoes",
          label: "Complicações",
          type: "multi-select",
          options: [
            { value: "microvasculares", label: "Microvasculares" },
            { value: "macrovascular", label: "Macrovasculares" },
          ],
        },
      ],
    },
  ],
  sm: [
    {
      key: "history",
      label: "Saúde Materna - Historial",
      section: "type_specific",
      visibleWhen: (ctx) => ctx.location === "unidade" && ctx.sex !== "m",
      fields: [
        {
          key: "trimestre",
          label: "Trimestre",
          type: "select",
          requiredWhen: "always",
          options: [
            { value: "1t", label: "1º Trimestre" },
            { value: "2t", label: "2º Trimestre" },
            { value: "3t", label: "3º Trimestre" },
            { value: "pos", label: "Pós-parto" },
          ],
        },
        {
          key: "plano-vigilancia",
          label: "Plano de Vigilância",
          type: "multi-select",
          options: [
            { value: "analises", label: "Análises" },
            { value: "eco1", label: "Ecografia 1º Trim." },
            { value: "eco2", label: "Ecografia 2º Trim." },
            { value: "eco3", label: "Ecografia 3º Trim." },
          ],
        },
        {
          key: "complicacoes",
          label: "Complicações",
          type: "text-list",
          placeholder: "Digite uma complicação",
        },
      ],
    },
  ],
};

// Type for specialty details JSONB
export type SpecialtyDetails = Record<
  string,
  string | number | boolean | null | string[]
>;

const resolveFieldDefault = (
  field: SpecialtyField
): SpecialtyDetails[string] => {
  if (field.defaultValue !== undefined) {
    return field.defaultValue as SpecialtyDetails[string];
  }

  if (
    field.type === "text-list" ||
    field.type === "multi-select" ||
    field.type === "code-search"
  ) {
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

// Get main location for specialty (returns both value and label)
export function getSpecialtyMainLocation(specialtyCode: string): {
  value: string | undefined;
  label: string | undefined;
} {
  const fields = getSpecialtyFields(specialtyCode);
  const locationField = fields.find((field) => field.key === "location");
  const value = locationField?.mainLocation;
  const label = locationField?.options?.find(
    (option) => option.value === value
  )?.label;
  return { value, label };
}

// Get display name for Consultations metrics tab (returns main location or default)
export function getConsultationsTabDisplayName(
  specialtyCode?: string | null
): string {
  if (!specialtyCode) {
    return TAB_CONSTANTS.METRICS_SUB_TABS.CONSULTATIONS;
  }
  const { label } = getSpecialtyMainLocation(specialtyCode);
  return label || TAB_CONSTANTS.METRICS_SUB_TABS.CONSULTATIONS;
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
  "family_type",
  "school_level",
  "profession",
  "professional_situation",
  "vaccination_plan",
];

/**
 * Enabled filter fields for MetricsDashboard - GeneralTab
 */
export const METRICS_GENERAL_ENABLED_FIELDS: FilterFieldType[] = [
  "year",
  "location",
  "internship",
  "sex",
  "ageRange",
  "dateRange",
];

/**
 * Enabled filter fields for MetricsDashboard - ConsultationsTab
 */
export const METRICS_CONSULTATIONS_ENABLED_FIELDS: FilterFieldType[] = [
  "year",
  "sex",
  "autonomy",
  "ageRange",
  "dateRange",
  "type",
  "presential",
  "family_type",
  "school_level",
  "profession",
  "professional_situation",
  "vaccination_plan",
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
