import { useCallback, useEffect, useState, useRef } from "react";
import { errorToast } from "@/utils/error-toast";
import type { AppError } from "@/errors";
import { mergeFilters } from "./helpers";
import type { UseDataFetchingOptions, UseDataFetchingReturn } from "./types";

/**
 * DATA FETCHING WITH FILTERS
 * ===========================
 */

/**
 * Generic hook for fetching data with filters.
 * Handles loading state, error handling, filter merging, and retry logic.
 *
 * This hook provides a unified pattern for data fetching that:
 * - Merges filters consistently using mergeFilters utility
 * - Handles loading states (only shows spinner on initial load)
 * - Manages error states with toast notifications
 * - Supports filter overrides for temporary filtering
 *
 * Filter persistence is handled by the parent component via useFilters hook.
 */
export function useDataFetching<TFilters extends Record<string, unknown>, TData>({
  filters,
  fetchFunction,
  loadDependencies,
  errorMessage = "Erro ao carregar dados",
}: UseDataFetchingOptions<TFilters, TData>): UseDataFetchingReturn<TFilters, TData> {
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const hasLoadedRef = useRef(false);

  // Load data function - memoized to avoid unnecessary re-renders
  const loadData = useCallback(
    async (filtersOverride?: Partial<TFilters>) => {
      // Only show loading spinner on initial load
      const isInitialLoad = !hasLoadedRef.current;
      if (isInitialLoad) {
        setIsLoading(true);
      }

      // Merge filters using shared utility (consistent pattern)
      const filtersToUse = mergeFilters(filters, filtersOverride);

      const result = await fetchFunction(filtersToUse);

      if (result.success && result.data !== undefined) {
        setData(result.data);
        setError(null);
        hasLoadedRef.current = true;
      } else {
        // Only set error state if we don't have cached data to show
        // If we have cached data, just show toast (non-blocking)
        if (isInitialLoad) {
          setError(result.error || null);
        } else if (result.error) {
          errorToast.fromApiError(result.error, errorMessage);
        }
      }

      if (isInitialLoad) {
        setIsLoading(false);
      }
    },
    [filters, fetchFunction, errorMessage]
  );

  const retryLoadData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Load data on initial mount or when dependencies change
  useEffect(() => {
    hasLoadedRef.current = false;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, loadDependencies);

  return {
    data,
    isLoading,
    error,
    loadData,
    retryLoadData,
  };
}
