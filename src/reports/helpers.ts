import type { MGFReportData } from "./report-types";
import type { SpecialtyReportConfig } from "./report-types";
import { getMGFReportDefinition } from "./mgf/mgf-reports";
import { MGF_REPORT_CONFIGS } from "./mgf/mgf-reports";
import type { MGFReportKey } from "./mgf/mgf-reports";

/**
 * Checks if a report has actual data to display/export.
 * Returns true if the report contains any meaningful data.
 */
export function hasReportData(data?: MGFReportData): boolean {
  if (!data) return false;

  const summary = data.summary;
  const unitSampleBreakdown = data.unitSampleBreakdown;
  const sampleWeeks = data.sampleWeeks;
  const firstHalfWeeks = data.firstHalfWeeks;
  const secondHalfWeeks = data.secondHalfWeeks;

  const weekGroups = [sampleWeeks, firstHalfWeeks, secondHalfWeeks];
  const hasWeekGroups = weekGroups.some((weeks) => weeks && weeks.length > 0);

  const hasUnitSampleData =
    hasWeekGroups ||
    (summary?.totalConsultations ?? 0) > 0 ||
    (unitSampleBreakdown?.totalConsultations ?? 0) > 0;

  const urgencySelections = data.urgencySelection ?? [];
  const topProblems = data.topProblems ?? [];
  const allInternshipSamples = data.internshipsSamples ?? [];

  const hasUrgencyData = Boolean(
    urgencySelections.length || topProblems.length
  );

  // Check if any internship sample has actual data (weeks or autonomy counts)
  const hasFormacaoData = allInternshipSamples.some(
    (sample) =>
      (sample.weeks?.length ?? 0) > 0 ||
      Object.values(sample.autonomyCounts ?? {}).some((count) => count > 0)
  );

  return hasUnitSampleData || hasUrgencyData || hasFormacaoData;
}

/**
 * Gets the report configuration for a given specialty and report key.
 */
export function getSpecialtyReportConfig(
  specialtyCode: string,
  reportKey: string
): SpecialtyReportConfig | null {
  // For now, only MGF is supported
  if (specialtyCode === "mgf") {
    return (
      MGF_REPORT_CONFIGS.find(
        (config) => config.reportKey === reportKey
      ) ?? null
    );
  }
  return null;
}

/**
 * Gets the report definition (metadata) for a given specialty and report key.
 */
export function getReportTabDefinition(
  specialtyCode: string,
  reportKey: string
) {
  // For now, only MGF is supported
  if (specialtyCode === "mgf") {
    return getMGFReportDefinition(reportKey as MGFReportKey);
  }
  return null;
}

/**
 * Gets all reports available for a given specialty.
 */
export function getReportsForSpecialty(specialtyCode: string) {
  // For now, only MGF is supported
  if (specialtyCode === "mgf") {
    return MGF_REPORT_CONFIGS.map((config) => ({
      key: config.reportKey,
      label: getMGFReportDefinition(config.reportKey)?.label || config.reportKey,
    }));
  }
  return [];
}

/**
 * Gets the tab key for a report.
 */
export function getReportTabKey(specialtyCode: string, reportKey: string): string {
  return `Relatórios.${specialtyCode}.${reportKey}`;
}

/**
 * Gets the display name for a report tab.
 */
export function getReportTabDisplayName(specialtyCode: string, reportKey: string): string {
  // For now, only MGF is supported
  if (specialtyCode === "mgf") {
    const definition = getMGFReportDefinition(reportKey as MGFReportKey);
    return definition?.label || reportKey;
  }
  return reportKey;
}
