"use client";

import { useEffect, useMemo, useState } from "react";
import type { Specialty } from "@/lib/api/specialties";
import { useMetricsData } from "@/hooks/metrics/use-metrics-data";
import { useFilters } from "@/hooks/filters/use-filters";
import { defaultConsultationsFilters } from "@/hooks/filters/helpers";
import { getSexLabel } from "./helpers";
import { GeneralTab } from "./tabs/general/general-tab";
import { ConsultationsTab } from "./tabs/consultations/consultations-tab";
import { ICPC2Tab } from "./tabs/icpc-2-codes/icpc-2-tab";
import { MetricsErrorDisplay } from "./metrics-error-display";
import { buildConsultationsExportMetadataRows } from "@/components/consultations/helpers";
import { buildMetricsExportSheets, downloadXlsx } from "@/exports/helpers";
import { errorToast } from "@/utils/error-toast";

interface MetricsDashboardProps {
  userId: string;
  specialty: Specialty | null;
  activeSubTab: "Geral" | "Consultas" | "ICPC-2";
  onRefreshReady?: (refresh: () => Promise<void>) => void;
}

export function MetricsDashboard({
  userId,
  specialty,
  activeSubTab,
  onRefreshReady,
}: MetricsDashboardProps) {
  // Metrics have their own filter state, independent from consultations.
  // Filters are shared across all metrics sub-tabs (better UX for graphs).
  const { filters, setFilter } = useFilters({
    filtersKey: "metrics-filters",
    defaultFilters: defaultConsultationsFilters,
  });

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Use custom hook for metrics data fetching
  const { metrics, isLoading, error, retryLoadMetrics, loadMetrics } =
    useMetricsData({
      userId,
      specialty,
      filters,
    });

  // Track whether any filters are currently active
  const hasActiveFilters = useMemo(
    () =>
      Object.values(filters).some(
        (value) => value !== undefined && value !== null && value !== ""
      ),
    [filters]
  );

  // Expose a refresh function to the parent so metrics can be reloaded
  // after side-effects like creating or editing consultations.
  useEffect(() => {
    if (!onRefreshReady) return;
    onRefreshReady(() => loadMetrics());
  }, [onRefreshReady, loadMetrics]);

  const handleExportExcel = async () => {
    if (!metrics) return;

    setIsExportingExcel(true);
    try {
      const metadataRows = buildConsultationsExportMetadataRows({
        filters,
        specialty,
        specialtyYear: filters.year,
        activeTab: activeSubTab,
      });

      const sheets = buildMetricsExportSheets({
        metrics,
        metadataRows,
        activeTab: activeSubTab,
      });

      console.log("sheets", sheets);

      if (!sheets || sheets.length === 0) {
        errorToast.show(
          "Sem dados para exportar",
          "Não existem métricas para exportar neste separador com os filtros atuais."
        );
        return;
      }

      const today = new Date();
      const datePart = today.toISOString().split("T")[0];
      const filename = `metricas_${datePart}.xlsx`;

      await downloadXlsx(sheets, filename);
    } finally {
      setIsExportingExcel(false);
    }
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex flex-1 min-h-full items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">
            A carregar métricas...
          </p>
        </div>
      </div>
    );
  }

  // Show error state for metrics if it failed and we don't have cached data
  if (error && !metrics) {
    return <MetricsErrorDisplay error={error} onRetry={retryLoadMetrics} />;
  }

  if (!metrics) {
    return (
      <div className="flex flex-1 min-h-full items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Sem dados disponíveis</p>
      </div>
    );
  }

  // Render content based on activeSubTab
  if (activeSubTab === "Geral") {
    return (
      <GeneralTab
        specialty={specialty}
        filters={filters}
        setFilter={setFilter}
        metrics={metrics}
        hasActiveFilters={hasActiveFilters}
        getSexLabel={getSexLabel}
        onExportExcel={handleExportExcel}
        isExportingExcel={isExportingExcel}
      />
    );
  }

  if (activeSubTab === "Consultas") {
    return (
      <ConsultationsTab
        specialty={specialty}
        filters={filters}
        setFilter={setFilter}
        metrics={metrics}
        hasActiveFilters={hasActiveFilters}
        onExportExcel={handleExportExcel}
        isExportingExcel={isExportingExcel}
      />
    );
  }

  if (activeSubTab === "ICPC-2") {
    return (
      <ICPC2Tab
        specialty={specialty}
        filters={filters}
        setFilter={setFilter}
        metrics={metrics}
        hasActiveFilters={hasActiveFilters}
        onExportExcel={handleExportExcel}
        isExportingExcel={isExportingExcel}
      />
    );
  }

  return null;
}
