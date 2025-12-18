import {
  getConsultationMetrics,
  type ConsultationMetrics,
} from "@/lib/api/consultations";
import { useDataFetching } from "@/hooks/filters/use-data-fetching";
import type { UseMetricsDataParams, UseMetricsDataReturn } from "./types";

/**
 * Hook for fetching and managing metrics data.
 * Uses unified data fetching pattern for consistency.
 */
export function useMetricsData({
  userId,
  specialty,
  filters,
  implicitFilters = {},
}: UseMetricsDataParams): UseMetricsDataReturn {
  const { data: metrics, isLoading, error, loadData: loadMetrics, retryLoadData: retryLoadMetrics } =
    useDataFetching<ConsultationMetrics>({
      filters,
      fetchFunction: async (filtersToUse) => {
        // Merge implicit filters with regular filters
        // Implicit filters take precedence if there's a conflict
        const mergedFilters = { ...filtersToUse, ...implicitFilters };
        const result = await getConsultationMetrics(userId, mergedFilters, specialty?.code);
        return {
          success: result.success,
          data: result.success ? result.data : undefined,
          error: result.success ? undefined : result.error,
        };
      },
      // Tie automatic loading to user/specialty AND the current filters snapshot.
      // This ensures that when filters are restored from localStorage for a metrics tab,
      // metrics are (re)loaded with the correct filters instead of any stale state
      // from a previous tab.
      // Also include implicitFilters in dependencies to reload when they change.
      loadDependencies: [userId, specialty?.id, JSON.stringify(filters), JSON.stringify(implicitFilters)],
      errorMessage: "Erro ao carregar métricas",
    });

  return {
    metrics,
    isLoading,
    error,
    loadMetrics,
    retryLoadMetrics,
  };
}

