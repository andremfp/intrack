import { useQuery } from "@tanstack/react-query";
import {
  getConsultationTimeSeries,
  type TimeSeriesDataPoint,
} from "@/lib/api/consultations";
import type { AppError } from "@/errors";
import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationsFilters } from "@/lib/api/consultations";
import { metrics } from "@/lib/query/keys";

interface UseTimeSeriesDataParams {
  userId: string;
  specialty: Specialty | null;
  filters: ConsultationsFilters;
  /** Filters that are applied to the data fetch but don't show as "active" in the UI */
  implicitFilters?: Partial<ConsultationsFilters>;
  /** Type to exclude from metrics (e.g., 'AM' for general tab) */
  excludeType?: string;
  /** Whether the query should be enabled */
  enabled?: boolean;
}

interface UseTimeSeriesDataReturn {
  data: TimeSeriesDataPoint[] | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: AppError | null;
}

// Query function that receives parameters from query context
async function fetchTimeSeriesData({
  queryKey,
}: {
  queryKey: readonly unknown[];
}): Promise<TimeSeriesDataPoint[]> {
  // Extract parameters from query key
  // Query key structure: ["metrics", "timeseries", userId, specialtyCode, stableStringify(filters), stableStringify(implicitFilters), excludeType]
  const [
    ,
    ,
    userId,
    specialtyCode,
    filtersStr,
    implicitFiltersStr,
    excludeType,
  ] = queryKey as [
    string, // "metrics"
    string, // "timeseries"
    string, // userId
    string, // specialtyCode
    string, // stableStringify(filters)
    string, // stableStringify(implicitFilters)
    string, // excludeType (empty string if not provided)
  ];

  // Parse the stringified filters back to objects
  const filters = JSON.parse(filtersStr) as Record<string, unknown>;
  const implicitFilters = JSON.parse(implicitFiltersStr) as Record<
    string,
    unknown
  >;

  // Merge implicit filters with regular filters
  const mergedFilters = { ...filters, ...implicitFilters };

  const result = await getConsultationTimeSeries(
    userId,
    mergedFilters as ConsultationsFilters,
    specialtyCode || undefined,
    excludeType || undefined
  );

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

/**
 * Hook for fetching timeseries data aggregated by day.
 * Uses React Query for caching and automatic invalidation.
 */
export function useTimeSeriesData({
  userId,
  specialty,
  filters,
  implicitFilters = {},
  excludeType,
  enabled = true,
}: UseTimeSeriesDataParams): UseTimeSeriesDataReturn {
  const specialtyCode = specialty?.code;

  const queryKey = metrics.timeseries({
    userId,
    specialtyCode: specialtyCode || "",
    filters,
    implicitFilters,
    excludeType,
  });

  const query = useQuery({
    queryKey,
    queryFn: fetchTimeSeriesData,
    enabled: enabled && !!(userId && specialtyCode),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    error: query.error as AppError | null,
  };
}
