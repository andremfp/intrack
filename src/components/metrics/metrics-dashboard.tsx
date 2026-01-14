"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Specialty } from "@/lib/api/specialties";
import { useMetricsData } from "@/hooks/metrics/use-metrics-data";
import { useFilters } from "@/hooks/filters/use-filters";
import { defaultConsultationsFilters } from "@/hooks/filters/helpers";
import { getSexLabel } from "./helpers";
import { GeneralTab } from "./tabs/general-tab";
import { ConsultationsTab } from "./tabs/consultations-tab";
import { MetricsErrorDisplay } from "./metrics-error-display";
import { buildConsultationsExportMetadataRows } from "@/components/consultations/helpers";
import { buildMetricsExportSheets, downloadXlsx } from "@/exports/helpers";
import { toasts } from "@/utils/toasts";
import { TAB_CONSTANTS, getSpecialtyMainLocation } from "@/constants";
import type { MetricsSubTab } from "@/utils/tab-parsing";

interface MetricsDashboardProps {
  userId: string;
  specialty: Specialty | null;
  activeSubTab: MetricsSubTab;
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

  // For the consultations tab, automatically filter by the main location
  // without showing it as an active filter
  const implicitFilters = useMemo(() => {
    if (
      activeSubTab === TAB_CONSTANTS.METRICS_SUB_TABS.CONSULTATIONS &&
      specialty?.code
    ) {
      const { value: mainLocationValue } = getSpecialtyMainLocation(
        specialty.code
      );
      if (mainLocationValue) {
        return { location: mainLocationValue };
      }
    }
    return {};
  }, [activeSubTab, specialty?.code]);

  // Use custom hook for metrics data fetching
  // For general tab, exclude consultations with type 'AM'
  const excludeType =
    activeSubTab === TAB_CONSTANTS.METRICS_SUB_TABS.GENERAL ? "AM" : undefined;

  const { metrics, isLoading, isRefreshing, error, retryLoadMetrics, loadMetrics } =
    useMetricsData({
      userId,
      specialty,
      filters,
      implicitFilters,
      excludeType,
    });

  // Track whether any filters are currently active
  const hasActiveFilters = useMemo(
    () =>
      Object.values(filters).some(
        (value) => value !== undefined && value !== null && value !== ""
      ),
    [filters]
  );

  // Store the latest loadMetrics function in a ref to avoid stale closures
  const loadMetricsRef = useRef(loadMetrics);
  loadMetricsRef.current = loadMetrics;

  // Expose a refresh function to the parent so metrics can be reloaded
  // after side-effects like creating or editing consultations.
  // Use a ref to store the callback and track the last onRefreshReady function
  // to prevent calling it multiple times with the same parent callback
  const refreshCallbackRef = useRef<(() => Promise<void>) | null>(null);
  const lastOnRefreshReadyRef = useRef<typeof onRefreshReady>(undefined);
  
  // Create a stable refresh callback that uses the ref
  if (!refreshCallbackRef.current) {
    refreshCallbackRef.current = async () => {
      return loadMetricsRef.current();
    };
  }

  useEffect(() => {
    // Only call onRefreshReady if:
    // 1. It's provided
    // 2. It's a different function reference than the last time we called it
    // This prevents calling it multiple times when the component remounts with the same callback
    if (!onRefreshReady || lastOnRefreshReadyRef.current === onRefreshReady) {
      return;
    }
    lastOnRefreshReadyRef.current = onRefreshReady;
    onRefreshReady(refreshCallbackRef.current);
  }, [onRefreshReady]);

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

      if (!sheets || sheets.length === 0) {
        toasts.error(
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

  // Check if metrics are empty (empty state condition)
  const isMetricsEmpty = !metrics || metrics.totalConsultations === 0;

  // Render content based on activeSubTab
  if (activeSubTab === TAB_CONSTANTS.METRICS_SUB_TABS.GENERAL) {
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
        isExportDisabled={isMetricsEmpty}
        onRefresh={loadMetrics}
        isRefreshing={isRefreshing}
      />
    );
  }

  if (activeSubTab === TAB_CONSTANTS.METRICS_SUB_TABS.CONSULTATIONS) {
    return (
      <ConsultationsTab
        specialty={specialty}
        filters={filters}
        setFilter={setFilter}
        metrics={metrics}
        hasActiveFilters={hasActiveFilters}
        onExportExcel={handleExportExcel}
        isExportingExcel={isExportingExcel}
        isExportDisabled={isMetricsEmpty}
        onRefresh={loadMetrics}
        isRefreshing={isRefreshing}
      />
    );
  }

  return null;
}
