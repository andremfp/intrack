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
}: UseMetricsDataParams): UseMetricsDataReturn {
  const { data: metrics, isLoading, error, loadData: loadMetrics, retryLoadData: retryLoadMetrics } =
    useDataFetching<ConsultationMetrics>({
      filters,
      fetchFunction: async (filtersToUse) => {
        const result = await getConsultationMetrics(userId, filtersToUse);
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
      loadDependencies: [userId, specialty?.id, JSON.stringify(filters)],
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

