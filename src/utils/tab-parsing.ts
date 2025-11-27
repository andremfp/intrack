import type { TabType } from "@/constants";
import { TAB_CONSTANTS } from "@/constants";

export type MainTab = "Consultas" | "Métricas";
export type MetricsSubTab = "Geral" | "Consultas" | "ICPC-2";

export interface ParsedTab {
  mainTab: MainTab;
  activeSpecialtyYear: number | undefined; // Only set for Consultas tabs
  metricsSubTab: MetricsSubTab;
}

/**
 * Parses an activeTab string into structured tab information
 * activeSpecialtyYear is only set for Consultas tabs (e.g., "Consultas.1", "Consultas.2")
 * Metrics tabs don't have specialty years
 */
export function parseTab(activeTab: TabType): ParsedTab {
  const mainTab: MainTab = activeTab.startsWith(`${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.`)
    ? TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS
    : activeTab.startsWith(`${TAB_CONSTANTS.MAIN_TABS.METRICS}.`)
    ? TAB_CONSTANTS.MAIN_TABS.METRICS
    : (activeTab as MainTab);

  // Only extract specialty year for Consultas tabs
  const activeSpecialtyYear = activeTab.startsWith(`${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.`)
    ? parseInt(activeTab.split(".")[1])
    : undefined;

  const metricsSubTab = activeTab.startsWith(`${TAB_CONSTANTS.MAIN_TABS.METRICS}.`)
    ? (activeTab.split(".")[1] as MetricsSubTab)
    : TAB_CONSTANTS.METRICS_SUB_TABS.GENERAL;

  return {
    mainTab,
    activeSpecialtyYear,
    metricsSubTab,
  };
}

