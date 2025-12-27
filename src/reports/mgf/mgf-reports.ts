import { SPECIALTY_CODES } from "@/constants";
import type { ConsultationMGF } from "@/lib/api/consultations";
import type { MGFReportData, SpecialtyReportConfig } from "@/reports/report-types";
import {
  getWeekInfo,
  selectBestWeeks,
  buildSummary,
  buildUrgencySelection,
  computeTopProblems,
  buildUnitSampleBreakdown,
  buildInternshipsSamples,
} from "@/reports/report-utils";
import type { ReportUtilsConfig, InternshipSampleConfig } from "@/reports/report-utils";

export type MGFReportKey = "year1" | "years2_3" | "year4";

export interface MGFReportSection {
  key: string;
  title: string;
  description: string;
  sampleDescription?: string;
}

export interface MGFReportDefinition {
  key: MGFReportKey;
  label: string;
  shortLabel: string;
  description: string;
  sections: MGFReportSection[];
}

export const MGF_REPORT_DEFINITIONS: MGFReportDefinition[] = [
  {
    key: "year1",
    label: "Ano 1",
    shortLabel: "1.º ano",
    description:
      "Foco na atividade clínica na unidade de saúde durante a segunda metade do ano e estágios de urgência de Cirurgia Geral e Ortopedia.",
    sections: [
      {
        key: "unit",
        title: "Unidade de Saúde",
        description:
          "Consultas observadas, ombro-a-ombro, em autonomia parcial e total, para tipologias SA, SIJ, PF, SM, Domicílio e DA, presenciais e não presenciais.",
        sampleDescription:
          "Amostra das quatro semanas com maior número de consultas, da segunda metade do ano, com pelo menos três dias/semana na unidade.",
      },
      {
        key: "urgency",
        title: "Urgência",
        description:
          "Atendimentos observados, ombro-a-ombro, em autonomia parcial e total nas urgências de cirurgia geral e ortopedia.",
        sampleDescription:
          "Amostra dos dois dias (2 x 12h) com maior número de atendimentos.",
      },
    ],
  },
  {
    key: "years2_3",
    label: "Anos 2 e 3",
    shortLabel: "2.º-3.º anos",
    description:
      "Aprofundamento da atividade clínica na unidade, urgências e formações complementares durante os anos intermédios.",
    sections: [
      {
        key: "unit",
        title: "Unidade de Saúde",
        description:
          "Consultas ombro-a-ombro, em autonomia parcial e total, para tipologias SA, SIJ, PF, SM, Domicílio e DA, presenciais e não presenciais.",
        sampleDescription:
          "Amostra das quinze semanas com maior número de consultas, do ano 2 e do ano 3 do internato, com pelo menos três dias/semana na unidade.",
      },
      {
        key: "urgency",
        title: "Urgência",
        description:
          "Atendimentos observados, ombro-a-ombro, parcial e total nas urgências de pediatria, ginecologia/obstetrícia, medicina interna e psiquiatria, bem como os 20 problemas mais frequentes.",
        sampleDescription:
          "Amostra dos dois dias (2 x 12h) com maior número de atendimentos nas urgências de pediatria e ginecologia/obstetrícia, dos quatro dias (4 x 12h) com mais atendimentos nas urgências de medicina interna e o dia (1x12h) com mais atendimentos nas urgências de psiquiatria.",
      },
      {
        key: "complementary",
        title: "Formações Complementares",
        description:
          "Consultas observadas, ombro-a-ombro, em autonomia parcial e total nos estágios de Pediatria, Ginecologia/Obstetrícia e Psiquiatria.",
        sampleDescription:
          "Amostras de quatro semanas com mais consultas.",
      },
    ],
  },
  {
    key: "year4",
    label: "Ano 4",
    shortLabel: "4.º ano",
    description:
      "Consolidação das consultas na unidade com autonomia total, durante todo o ano.",
    sections: [
      {
        key: "unit",
        title: "Unidade de Saúde",
        description:
          "Consultas com autonomia total nas tipologias SA, SIJ, PF, SM, Domicílio e DA, presenciais e não presenciais.",
        sampleDescription:
          "Todas as consultas com autonomia total, durante todo o ano.",
      },
    ],
  },
];

export function getMGFReportDefinition(key: MGFReportKey) {
  return MGF_REPORT_DEFINITIONS.find((definition) => definition.key === key);
}

const REPORT_SPECIALTY_YEAR_MAP: Record<MGFReportKey, number[]> = {
  year1: [1],
  years2_3: [2, 3],
  year4: [4],
};

export const MGF_CONSULTATION_TYPES_FOR_REPORTS = ["SA", "SIJ", "PF", "SM", "Domicílio", "DA"];
export const MGF_AUTONOMY_LEVELS_FOR_REPORTS = ["observada", "ombro-a-ombro", "parcial", "total"];

const REPORT_UTILS_CONFIG: ReportUtilsConfig = {
  consultationTypes: MGF_CONSULTATION_TYPES_FOR_REPORTS,
  autonomyLevels: MGF_AUTONOMY_LEVELS_FOR_REPORTS,
};

const YEAR1_URGENCY_CONFIG = [
  { label: "Cirurgia Geral", internships: ["cir geral"], dayLimit: 2 },
  { label: "Ortopedia", internships: ["orto"], dayLimit: 2 },
];

const YEAR23_URGENCY_CONFIG = [
  { label: "Pediatria", internships: ["pediatria"], dayLimit: 2 },
  {
    label: "Ginecologia e Obstetrícia",
    internships: ["gineco", "obstetricia"],
    dayLimit: 2,
  },
  {
    label: "Medicina Interna",
    internships: ["med interna"],
    dayLimit: 2,
  },
  {
    label: "Psiquiatria",
    internships: ["psiquiatria"],
    dayLimit: 1,
  },
];

const YEAR23_INTERNSHIPS_CONFIG: InternshipSampleConfig[] = [
  { label: "Pediatria", internships: ["pediatria"], location: "complementar" },
  {
    label: "Ginecologia e Obstetrícia",
    internships: ["gineco", "obstetricia"],
    location: "complementar",
  },
  { label: "Psiquiatria", internships: ["psiquiatria"], location: "complementar" },
];

function buildYear1Report(records: ConsultationMGF[]): MGFReportData {
  const unidadeRecords = records.filter(
    (record) => record.location === "unidade" && record.type && MGF_CONSULTATION_TYPES_FOR_REPORTS.includes(record.type)
  );
  // Sample weeks: 4 best weeks with at least 3 days per week between July and December
  const sampleWeeks = selectBestWeeks(unidadeRecords, {
    limit: 4,
    minDaysPerWeek: 3,
    startMonth: 7,
    endMonth: 12,
  });
  const selectedWeekKeys = new Set(sampleWeeks.map((week) => week.weekKey));
  const sampleRecords = unidadeRecords.filter((record) => {
    const weekInfo = getWeekInfo(record);
    return weekInfo && selectedWeekKeys.has(weekInfo.weekKey);
  });
  const summary = buildSummary(sampleRecords, REPORT_UTILS_CONFIG);
  const unitSampleBreakdown = buildUnitSampleBreakdown(sampleRecords, REPORT_UTILS_CONFIG);
  const urgencyRecords = records.filter((record) => record.location === "urgência");
  const urgencySelection = buildUrgencySelection(urgencyRecords, YEAR1_URGENCY_CONFIG);
  
  return {
    summary,
    unitSampleBreakdown,
    sampleWeeks,
    urgencySelection,
  };
}

function buildYears23Report(records: ConsultationMGF[]): MGFReportData {
  const unitRecords = records.filter(
    (record) => record.location === "unidade" && record.type && MGF_CONSULTATION_TYPES_FOR_REPORTS.includes(record.type)
  );
  // First half: records with specialty_year=2
  const firstHalfRecords = unitRecords.filter((record) => record.specialty_year === 2);
  const firstHalfWeeks = selectBestWeeks(firstHalfRecords, {
    limit: 15,
    minDaysPerWeek: 3,
  });
  // Second half: records with specialty_year=3
  const secondHalfRecords = unitRecords.filter((record) => record.specialty_year === 3);
  const secondHalfWeeks = selectBestWeeks(secondHalfRecords, {
    limit: 15,
    minDaysPerWeek: 3,
  });
  const selectedWeekKeys = new Set<string>([
    ...firstHalfWeeks,
    ...secondHalfWeeks,
  ].map((week) => week.weekKey));
  const sampleRecords = unitRecords.filter((record) => {
    const weekInfo = getWeekInfo(record);
    return weekInfo && selectedWeekKeys.has(weekInfo.weekKey);
  });
  const summary = buildSummary(sampleRecords, REPORT_UTILS_CONFIG);
  const urgencyRecords = records.filter((record) => record.location === "urgência");
  const urgencySelection = buildUrgencySelection(urgencyRecords, YEAR23_URGENCY_CONFIG);
  const internshipsSamples = buildInternshipsSamples(
    records,
    REPORT_UTILS_CONFIG,
    YEAR23_INTERNSHIPS_CONFIG
  );
  const topProblems = computeTopProblems(sampleRecords);
  return {
    summary,
    firstHalfWeeks,
    secondHalfWeeks,
    urgencySelection,
    internshipsSamples,
    topProblems,
  };
}

function buildYear4Report(records: ConsultationMGF[]): MGFReportData {
  const filtered = records.filter(
    (record) => record.location === "unidade" && record.autonomy === "total" && record.type && MGF_CONSULTATION_TYPES_FOR_REPORTS.includes(record.type)
  );
  const summary = buildSummary(filtered, REPORT_UTILS_CONFIG);
  return {
    summary,
  };
}

export const MGF_REPORT_CONFIGS: SpecialtyReportConfig<MGFReportKey>[] = [
  {
    specialtyCode: SPECIALTY_CODES.MGF,
    reportKey: "year1",
    specialtyYears: REPORT_SPECIALTY_YEAR_MAP["year1"],
    buildReport: buildYear1Report,
  },
  {
    specialtyCode: SPECIALTY_CODES.MGF,
    reportKey: "years2_3",
    specialtyYears: REPORT_SPECIALTY_YEAR_MAP["years2_3"],
    buildReport: buildYears23Report,
  },
  {
    specialtyCode: SPECIALTY_CODES.MGF,
    reportKey: "year4",
    specialtyYears: REPORT_SPECIALTY_YEAR_MAP["year4"],
    buildReport: buildYear4Report,
  },
];
