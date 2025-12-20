import { TAB_CONSTANTS } from "@/constants";
import type { TabType } from "@/constants";
import type { MGFReportKey } from "@/reports/mgf-reports";

export type MainTab = typeof TAB_CONSTANTS.MAIN_TABS[keyof typeof TAB_CONSTANTS.MAIN_TABS];
export type MetricsSubTab = typeof TAB_CONSTANTS.METRICS_SUB_TABS[keyof typeof TAB_CONSTANTS.METRICS_SUB_TABS];

export interface ParsedTab {
  mainTab: MainTab;
  activeSpecialtyYear: number | undefined; // Only set for Consultas tabs
  metricsSubTab: MetricsSubTab;
  activeReportKey?: MGFReportKey;
  activeReportSpecialtyCode?: string;
}

/**
 * Parses an activeTab string into structured tab information
 * activeSpecialtyYear is only set for Consultas tabs (e.g., "Consultas.1", "Consultas.2")
 * Metrics tabs don't have specialty years
 */
export function parseTab(activeTab: TabType): ParsedTab {
  const isReportTab = activeTab.startsWith(`${TAB_CONSTANTS.MAIN_TABS.REPORTS}.`);
  const mainTab: MainTab = isReportTab
    ? TAB_CONSTANTS.MAIN_TABS.REPORTS
    : activeTab.startsWith(`${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.`)
    ? TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS
    : activeTab.startsWith(`${TAB_CONSTANTS.MAIN_TABS.METRICS}.`)
    ? TAB_CONSTANTS.MAIN_TABS.METRICS
    : (activeTab as MainTab);

  const reportParts = isReportTab ? activeTab.split(".") : [];
  const activeReportSpecialtyCode = isReportTab ? reportParts[1] : undefined;
  const activeReportKey =
    isReportTab && reportParts.length >= 3
      ? (reportParts[2] as MGFReportKey)
      : undefined;

  // Only extract specialty year for Consultas tabs
  const activeSpecialtyYear =
    activeTab.startsWith(`${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.`)
      ? parseInt(activeTab.split(".")[1])
      : undefined;

  const metricsSubTab = activeTab.startsWith(`${TAB_CONSTANTS.MAIN_TABS.METRICS}.`)
    ? (activeTab.split(".")[1] as MetricsSubTab)
    : TAB_CONSTANTS.METRICS_SUB_TABS.GENERAL;

  return {
    mainTab,
    activeSpecialtyYear,
    metricsSubTab,
    activeReportKey,
    activeReportSpecialtyCode,
  };
}

