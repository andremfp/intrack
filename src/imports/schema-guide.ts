import type { SpecialtyField } from "@/constants";
import { COMMON_CONSULTATION_FIELDS, MGF_FIELDS } from "@/constants";

export interface SchemaFieldGuide extends SpecialtyField {
  description: string;
  acceptedFormats?: string[];
  examples?: string[];
  validationRules?: string[];
  notes?: string;
}

export interface SchemaSection {
  title: string;
  description: string;
  fields: SchemaFieldGuide[];
}


// Extended field definitions with documentation
const FIELD_DOCUMENTATION: Record<string, Omit<SchemaFieldGuide, keyof SpecialtyField>> = {
  // Common fields documentation
  date: {
    description: "Data da consulta realizada",
    acceptedFormats: [
      "YYYY-MM-DD (formato ISO)",
      "DD/MM/YYYY",
      "DD-MM-YYYY",
      "DD.MM.YYYY",
      "Números seriais do Excel (1-1000000)"
    ],
    validationRules: ["Data deve ser válida"],
    notes: "Suporta múltiplos formatos de data automaticamente"
  },
  process_number: {
    description: "Número de processo único do paciente",
    acceptedFormats: ["Número até 9 dígitos"],
    validationRules: ["Máximo 9 dígitos", "Deve ser único por data"],
    notes: "Identificador único usado para detectar duplicados"
  },
  location: {
    description: "Local onde a consulta foi realizada",
    validationRules: ["Deve corresponder a uma opção válida"],
    notes: "Determina se outros campos são obrigatórios (tipo vs estágio)"
  },
  autonomy: {
    description: "Nível de autonomia do estudante",
    validationRules: ["Deve corresponder a uma opção válida"],
    notes: "Indica o nível de supervisão na consulta"
  },
  sex: {
    description: "Sexo do paciente",
    validationRules: ["Deve corresponder a uma opção válida"],
    notes: "Também aceita abreviações: M/F"
  },
  age: {
    description: "Idade do paciente",
    acceptedFormats: ["Número"],
    validationRules: ["Entre 0 e 150 anos"],
    notes: "Pode ser decimal para idades em meses/anos"
  },
  age_unit: {
    description: "Unidade da idade (dias, semanas, meses, anos)",
    validationRules: ["Deve corresponder a uma opção válida"],
    notes: "Também aceita: A/M/S/D"
  },

  // MGF specialty fields documentation
  type: {
    description: "Tipo de consulta realizada",
    validationRules: [
      "Obrigatório quando Local = 'Unidade de Saúde'",
      "Não pode ser preenchido para outros locais"
    ],
    notes: "Campo condicional baseado no local da consulta"
  },
  presential: {
    description: "Se a consulta foi presencial ou não",
    acceptedFormats: [
      "Sim/Não",
      "S/N",
      "Yes/No",
      "Y/N",
      "true/false",
      "1/0"
    ],
    validationRules: ["Valor padrão: verdadeiro"],
    notes: "Aceita múltiplas variações de verdadeiro/falso"
  },
  internship: {
    description: "Especialidade onde está a estagiar",
    validationRules: [
      "Obrigatório para Local ≠ 'Unidade de Saúde'",
      "Não pode ser preenchido quando Local = 'Unidade de Saúde'"
    ],
    notes: "Campo condicional - obrigatório baseado no local"
  },
  family_type: {
    description: "Tipologia de família do utente",
    validationRules: [
      "Deve corresponder a uma opção válida",
      "Apenas aplicável quando Local = 'Unidade de Saúde'"
    ],
    notes: "Campo condicional (visível apenas para consultas na Unidade de Saúde)"
  },
  school_level: {
    description: "Escolaridade do utente",
    validationRules: [
      "Deve corresponder a uma opção válida",
      "Apenas aplicável quando Local = 'Unidade de Saúde'"
    ],
    notes: "Campo condicional (visível apenas para consultas na Unidade de Saúde)"
  },
  professional_area: {
    description: "Sector/área de actividade profissional do utente",
    validationRules: [
      "Deve corresponder a uma opção válida",
      "Apenas aplicável quando Local = 'Unidade de Saúde'"
    ],
    notes: "Campo condicional (visível apenas para consultas na Unidade de Saúde)"
  },
  profession: {
    description: "Profissão do utente",
    validationRules: [
      "Deve corresponder a uma opção válida",
      "Apenas aplicável quando Local = 'Unidade de Saúde'"
    ],
    notes: "Campo condicional (visível apenas para consultas na Unidade de Saúde)"
  },
  smoker: {
    description: "Estado tabágico do paciente",
    validationRules: ["Deve corresponder a uma opção válida se preenchido"],
    notes: "Campo opcional para histórico clínico"
  },
  vaccination_plan: {
    description: "PNV Cumprido",
    validationRules: ["Deve corresponder a uma opção válida se preenchido"],
    notes: "Campo opcional para histórico clínico"
  },
  chronic_diseases: {
    description: "Lista de doenças crónicas do paciente",
    acceptedFormats: ["Texto separado por ponto e vírgula"],
    validationRules: ["Cada doença separada por ';'"],
    notes: "Múltiplas doenças separadas por ponto e vírgula"
  },
  diagnosis: {
    description: "Códigos ICPC-2 do diagnóstico principal",
    acceptedFormats: ["Código ICPC-2 com ou sem descrição"],
    examples: ["A01", "A01 - Dor de garganta"],
    validationRules: ["Códigos devem existir na lista ICPC-2", "Formato: letra + 2 dígitos"],
    notes: "Códigos separados por ponto e vírgula"
  },
  problems: {
    description: "Códigos ICPC-2 dos problemas identificados",
    acceptedFormats: ["Código ICPC-2 com ou sem descrição"],
    examples: ["A01", "A01 - Dor de garganta"],
    validationRules: ["Códigos devem existir na lista ICPC-2"],
    notes: "Mesmo formato que diagnóstico"
  },
  new_diagnosis: {
    description: "Códigos ICPC-2 de novos diagnósticos",
    acceptedFormats: ["Código ICPC-2 com ou sem descrição"],
    examples: ["A01", "A01 - Dor de garganta"],
    validationRules: ["Códigos devem existir na lista ICPC-2"],
    notes: "Para diagnósticos identificados nesta consulta"
  },
  referrence: {
    description: "Especialidade para onde o paciente foi referido",
    validationRules: ["Deve corresponder a uma especialidade válida se preenchido"],
    notes: "Lista de especialidades médicas"
  },
  referrence_motive: {
    description: "Códigos ICPC-2 do motivo da referenciação",
    acceptedFormats: ["Código ICPC-2 com ou sem descrição"],
    examples: ["A01", "A01 - Dor de garganta"],
    validationRules: ["Códigos devem existir na lista ICPC-2"],
    notes: "Explica por que o paciente foi referido"
  },
  contraceptive: {
    description: "Método contraceptivo atual do paciente",
    validationRules: ["Deve corresponder a uma opção válida se preenchido"],
    notes: "Para consultas de planeamento familiar"
  },
  new_contraceptive: {
    description: "Novo método contraceptivo prescrito",
    validationRules: ["Deve corresponder a uma opção válida se preenchido"],
    notes: "Para mudanças de método contraceptivo"
  },
  procedure: {
    description: "Procedimentos realizados na consulta",
    acceptedFormats: ["Texto separado por ponto e vírgula"],
    validationRules: ["Cada procedimento separado por ';'"],
    notes: "Múltiplos procedimentos separados por ponto e vírgula"
  },
  notes: {
    description: "Observações adicionais sobre a consulta",
    acceptedFormats: ["Texto separado por ponto e vírgula"],
    validationRules: ["Cada nota separada por ';'"],
    notes: "Observações clínicas ou administrativas"
  }
};

// Helper function to merge field definition with documentation
function createSchemaFieldGuide(field: SpecialtyField): SchemaFieldGuide {
  const docs = FIELD_DOCUMENTATION[field.key];
  if (!docs) {
    // Provide default documentation for fields without explicit docs
    console.warn(`Missing documentation for field: ${field.key}, using defaults`);
    return {
      ...field,
      description: field.label || field.key,
    };
  }
  return { ...field, ...docs };
}

// Common consultation fields (present in all specialties)
export const COMMON_FIELDS_GUIDE: SchemaSection = {
  title: "Campos Comuns",
  description: "Estes campos são obrigatórios para todas as consultas e especialidades.",
  fields: COMMON_CONSULTATION_FIELDS.map(createSchemaFieldGuide)
};

// MGF (Medicina Geral e Familiar) specialty fields
export const MGF_FIELDS_GUIDE: SchemaSection = {
  title: "Campos Específicos - MGF",
  description: "Campos específicos da especialidade de Medicina Geral e Familiar.",
  fields: MGF_FIELDS.map(createSchemaFieldGuide)
};

// Special validation rules
export const VALIDATION_RULES_GUIDE = {
  locationLogic: {
    title: "Lógica de Localização",
    rules: [
      {
        condition: "Local = 'Unidade de Saúde'",
        requirements: [
          "✓ Campo 'Tipologia' é obrigatório",
          "✗ Campo 'Estágio' deve estar vazio"
        ]
      },
      {
        condition: "Local = 'Serviço de Urgência', 'Formação Complementar', etc.",
        requirements: [
          "✗ Campo 'Tipologia' deve estar vazio",
          "✓ Campo 'Estágio' é obrigatório"
        ]
      },
    ]
  },
  dataIntegrity: {
    title: "Integridade de Dados",
    rules: [
      "Números de processo devem ser únicos por data",
      "Códigos ICPC-2 devem existir na lista oficial",
      "Idades devem estar entre 0 e 150 anos",
      "Campos obrigatórios não podem estar vazios"
    ]
  }
};

// File format specifications
export const FILE_FORMAT_GUIDE = {
  supportedFormats: ["CSV (.csv)", "Excel (.xlsx, .xls)", "Numbers (.numbers)"],
  encoding: "UTF-8 recomendado",
  delimiters: {
    csv: "Vírgula ou ponto e vírgula",
    lists: "Ponto e vírgula (;) para campos de lista"
  },
  headers: {
    flexible: "Headers são mapeados automaticamente (case-insensitive)",
    variations: "Suporta variações como 'Data', 'NOC', 'Número de Processo'"
  }
};

// Helper function to get all fields for a specialty
export function getSchemaGuideForSpecialty(specialtyCode: string): SchemaSection[] {
  const sections = [COMMON_FIELDS_GUIDE];

  switch (specialtyCode) {
    case "mgf":
      sections.push(MGF_FIELDS_GUIDE);
      break;
    default:
      // Add other specialty guides here as they are implemented
      break;
  }

  return sections;
}

// Helper to get field guide by key
export function getFieldGuide(key: string, specialtyCode: string): SchemaFieldGuide | undefined {
  const sections = getSchemaGuideForSpecialty(specialtyCode);
  for (const section of sections) {
    const field = section.fields.find(f => f.key === key);
    if (field) return field;
  }
  return undefined;
}
