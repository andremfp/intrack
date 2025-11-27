"use client";

import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationsFilters } from "@/lib/api/consultations";
import { useMetricsData } from "@/hooks/metrics/use-metrics-data";
import { useFilters } from "@/hooks/filters/use-filters";
import { defaultConsultationsFilters } from "@/hooks/filters/helpers";
import { getSexLabel } from "./helpers";
import { GeneralTab } from "./tabs/general/general-tab";
import { ConsultationsTab } from "./tabs/consultations/consultations-tab";
import { ICPC2Tab } from "./tabs/icpc-2-codes/icpc-2-tab";
import { MetricsErrorDisplay } from "./metrics-error-display";

interface MetricsDashboardProps {
  userId: string;
  specialty: Specialty | null;
  activeSubTab: "Geral" | "Consultas" | "ICPC-2";
}

export function MetricsDashboard({
  userId,
  specialty,
  activeSubTab,
}: MetricsDashboardProps) {
  // Metrics have their own filter state, independent from consultations.
  // Filters are shared across all metrics sub-tabs (better UX for graphs).
  const { filters, setFilter } = useFilters<ConsultationsFilters>({
    filtersKey: "metrics-filters",
    defaultFilters: defaultConsultationsFilters,
  });

  // Use custom hook for metrics data fetching
  const { metrics, isLoading, error, retryLoadMetrics } = useMetricsData({
    userId,
    specialty,
    filters,
  });

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
        getSexLabel={getSexLabel}
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
      />
    );
  }

  return null;
}
