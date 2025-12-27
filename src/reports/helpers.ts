import { SPECIALTY_CODES, TAB_CONSTANTS } from "@/constants";
import {
  MGF_REPORT_DEFINITIONS,
  MGF_REPORT_CONFIGS,
  type MGFReportDefinition,
  type MGFReportKey,
} from "@/reports/mgf/mgf-reports";
import type { SpecialtyReportConfig } from "@/reports/report-types";

const REPORT_TAB_CONFIG: Record<string, MGFReportDefinition[]> = {
  [SPECIALTY_CODES.MGF]: MGF_REPORT_DEFINITIONS,
};

export const REPORT_CONFIG_REGISTRY: Record<string, SpecialtyReportConfig[]> = {
  [SPECIALTY_CODES.MGF]: MGF_REPORT_CONFIGS,
};

export function getSpecialtyReportConfig(
  specialtyCode?: string | null,
  reportKey?: string
): SpecialtyReportConfig | undefined {
  if (!specialtyCode || !reportKey) {
    return undefined;
  }
  const registry = REPORT_CONFIG_REGISTRY[specialtyCode];
  return registry?.find((config) => config.reportKey === reportKey);
}

export function getReportsForSpecialty(specialtyCode?: string | null) {
  if (!specialtyCode) {
    return [];
  }
  return REPORT_TAB_CONFIG[specialtyCode] ?? [];
}

export function getReportTabDefinition(
  specialtyCode?: string | null,
  reportKey?: string
) {
  if (!specialtyCode || !reportKey) {
    return undefined;
  }
  const definitions = REPORT_TAB_CONFIG[specialtyCode];
  return definitions?.find((definition) => definition.key === reportKey);
}

export function getReportTabDisplayName(
  specialtyCode?: string | null,
  reportKey?: string
) {
  const definition = getReportTabDefinition(specialtyCode, reportKey);
  return definition?.label ?? TAB_CONSTANTS.MAIN_TABS.REPORTS;
}

export function getReportTabKey(specialtyCode: string, reportKey: MGFReportKey | string) {
  return `${TAB_CONSTANTS.MAIN_TABS.REPORTS}.${specialtyCode}.${reportKey}`;
}
