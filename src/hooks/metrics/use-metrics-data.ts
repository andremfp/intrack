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

  const initialQueryKey = metrics.summary({
    userId,
    specialtyCode: specialtyCode || "",
    filters,
    implicitFilters,
    excludeType,
  });

  const query = useQuery({
    queryKey: initialQueryKey,
    queryFn: fetchMetricsData,
    enabled: !!(userId && specialtyCode),
  });

  const loadMetrics = async (filtersOverride?: Partial<typeof filters>) => {
    // If filters are being overridden, we need to invalidate with the new key
    // Otherwise, just refetch the current query directly
    if (filtersOverride) {
      const mergedFilters = { ...filters, ...filtersOverride };
      const summaryQueryKey = metrics.summary({
        userId,
        specialtyCode: specialtyCode || "",
        filters: mergedFilters,
        implicitFilters,
        excludeType,
      });
      const timeseriesQueryKey = metrics.timeseries({
        userId,
        specialtyCode: specialtyCode || "",
        filters: mergedFilters,
        implicitFilters,
        excludeType,
      });

      await queryClient.invalidateQueries({ queryKey: summaryQueryKey });
      await queryClient.refetchQueries({ queryKey: summaryQueryKey });
      await queryClient.invalidateQueries({ queryKey: timeseriesQueryKey });
      await queryClient.refetchQueries({ queryKey: timeseriesQueryKey });
    } else {
      // Just refetch directly - this will force a network request even if data is fresh
      // No need to invalidate first, as refetch() bypasses cache
      await query.refetch({ cancelRefetch: false });

      // Also refetch timeseries data with current filters
      const timeseriesQueryKey = metrics.timeseries({
        userId,
        specialtyCode: specialtyCode || "",
        filters,
        implicitFilters,
        excludeType,
      });
      await queryClient.refetchQueries({ queryKey: timeseriesQueryKey });
    }
  };

  const retryLoadMetrics = async () => {
    // For retry, refetch the current query directly
    await query.refetch();

    // Also refetch timeseries data
    const timeseriesQueryKey = metrics.timeseries({
      userId,
      specialtyCode: specialtyCode || "",
      filters,
      implicitFilters,
      excludeType,
    });
    await queryClient.refetchQueries({ queryKey: timeseriesQueryKey });
  };

  return {
    metrics: query.data ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    error: query.error as AppError | null,
    loadMetrics,
    retryLoadMetrics,
  };
}
