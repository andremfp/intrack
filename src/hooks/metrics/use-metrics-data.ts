import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getConsultationMetrics,
  type ConsultationMetrics,
} from "@/lib/api/consultations";
import type { AppError } from "@/errors";
import type { UseMetricsDataParams, UseMetricsDataReturn } from "./types";
import { metrics } from "@/lib/query/keys";

// Query function that receives parameters from query context
async function fetchMetricsData({
  queryKey,
}: {
  queryKey: readonly unknown[];
}): Promise<ConsultationMetrics> {
  // Extract parameters from query key
  // Note: filters and implicitFilters are stringified in the query key for stable comparison
  const [
    ,
    ,
    userId,
    specialtyCode,
    filtersStr,
    implicitFiltersStr,
    excludeType,
  ] = queryKey as [
    string,
    string,
    string,
    string,
    string, // stableStringify(filters)
    string, // stableStringify(implicitFilters)
    string // excludeType (empty string if not provided)
  ];

  // Parse the stringified filters back to objects
  const filters = JSON.parse(filtersStr) as Record<string, unknown>;
  const implicitFilters = JSON.parse(implicitFiltersStr) as Record<
    string,
    unknown
  >;

  // Merge implicit filters with regular filters
  // Implicit filters take precedence if there's a conflict
  const mergedFilters = { ...filters, ...implicitFilters };
  const result = await getConsultationMetrics(
    userId,
    mergedFilters,
    specialtyCode,
    excludeType || undefined
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
  excludeType,
}: UseMetricsDataParams): UseMetricsDataReturn {
  const queryClient = useQueryClient();
  const specialtyCode = specialty?.code;

  const query = useQuery({
    queryKey: metrics.summary({
      userId,
      specialtyCode: specialtyCode || "",
      filters,
      implicitFilters,
      excludeType,
    }),
    queryFn: fetchMetricsData,
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
        excludeType,
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
