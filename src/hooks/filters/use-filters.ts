import { useCallback, useMemo } from "react";
import { usePersistedReducer } from "./use-persisted-reducer";
import { filtersReducer } from "./helpers";
import type { FiltersAction, UseFiltersOptions, UseFiltersReturn } from "./types";

/**
 * Generic hook for managing filter state with optional dynamic data loading.
 *
 * Features:
 * - Filter state management with localStorage persistence
 * - Optional dynamic loading of locations and internships from the API
 * - Validation to ensure selected values are still valid
 * - Works for both metrics dashboard and consultations table
 *
 * @param options - Configuration options for the hook
 * @returns Filter state and setters
 */
export function useFilters<T extends Record<string, unknown>>({
  filtersKey,
  defaultFilters,
}: UseFiltersOptions<T>): UseFiltersReturn<T> {
  // Memoize reset action creator to maintain stable reference
  const resetActionCreator = useMemo(
    () => (payload: T): FiltersAction<T> => ({
      type: "RESET",
      payload,
    }),
    []
  );

  // Use persisted reducer for centralized filter state management
  const [filters, dispatch] = usePersistedReducer<
    T,
    FiltersAction<T>
  >(filtersKey, filtersReducer<T>, defaultFilters, resetActionCreator);

  // Generic function to update any filter property
  const setFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      dispatch({
        type: "SET_FILTER",
        payload: { key, value },
      });
    },
    [dispatch]
  );

  return {
    filters,
    setFilter,
  };
}

// Re-export types for external usage
export type { UseFiltersOptions, UseFiltersReturn } from "./types";
