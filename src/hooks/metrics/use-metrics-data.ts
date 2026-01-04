import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getConsultationMetrics,
  type ConsultationMetrics,
} from "@/lib/api/consultations";
import type { AppError } from "@/errors";
import type { UseMetricsDataParams, UseMetricsDataReturn } from "./types";
import { metrics } from "@/lib/query/keys";

// Query function that throws errors instead of returning ApiResponse
async function fetchMetricsData({
  userId,
  specialtyCode,
  filters,
  implicitFilters,
}: {
  userId: string;
  specialtyCode?: string;
  filters: Record<string, unknown>;
  implicitFilters: Record<string, unknown>;
}): Promise<ConsultationMetrics> {
  // Merge implicit filters with regular filters
  // Implicit filters take precedence if there's a conflict
  const mergedFilters = { ...filters, ...implicitFilters };
  const result = await getConsultationMetrics(
    userId,
    mergedFilters,
    specialtyCode
  );

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

/**
 * Hook for fetching and managing metrics data.
 * Now uses React Query for caching and automatic invalidation.
 */
export function useMetricsData({
  userId,
  specialty,
  filters,
  implicitFilters = {},
}: UseMetricsDataParams): UseMetricsDataReturn {
  const queryClient = useQueryClient();
  const specialtyCode = specialty?.code;

  const query = useQuery({
    queryKey: metrics.summary({
      userId,
      specialtyCode: specialtyCode || "",
      filters,
      implicitFilters,
    }),
    queryFn: () =>
      fetchMetricsData({
        userId,
        specialtyCode,
        filters,
        implicitFilters,
      }),
    enabled: !!(userId && specialtyCode),
  });

  const loadMetrics = async (filtersOverride?: Partial<typeof filters>) => {
    // For manual refresh, invalidate the current query
    await queryClient.invalidateQueries({
      queryKey: metrics.summary({
        userId,
        specialtyCode: specialtyCode || "",
        filters: filtersOverride ? { ...filters, ...filtersOverride } : filters,
        implicitFilters,
      }),
    });
  };

  const retryLoadMetrics = async () => {
    // For retry, invalidate and refetch
    await queryClient.invalidateQueries({
      queryKey: metrics.prefix({ userId, specialtyCode: specialtyCode || "" }),
    });
  };

  return {
    metrics: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as AppError | null,
    loadMetrics,
    retryLoadMetrics,
  };
}
