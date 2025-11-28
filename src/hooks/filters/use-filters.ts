import { useCallback, useMemo } from "react";
import { usePersistedReducer } from "./use-persisted-reducer";
import { keyValueStateReducer } from "./helpers";
import type {
  KeyValueStateAction,
  UseFiltersOptions,
  UseFiltersReturn,
} from "./types";
import type { ConsultationsFilters } from "@/lib/api/consultations";

/**
 * Generic hook for managing filter state with optional dynamic data loading.
 *
 * Features:
 * - Filter state management with localStorage persistence
 * - Optional dynamic loading of locations and internships from the API
 * - Validation to ensure selected values are still valid
 * - Works for both metrics dashboard and consultations table
 *
 * @param options - Configuration options for the consultations filters hook
 * @returns Filter state and setters
 */
export function useFilters({
  filtersKey,
  defaultFilters,
}: UseFiltersOptions): UseFiltersReturn {
  // Memoize reset action creator to maintain stable reference
  const resetActionCreator = useMemo(
    () =>
      (
        payload: ConsultationsFilters
      ): KeyValueStateAction<ConsultationsFilters> => ({
      type: "RESET",
      payload,
    }),
    []
  );

  // Use persisted reducer for centralized filter state management
  const [filters, dispatch] = usePersistedReducer<
    ConsultationsFilters,
    KeyValueStateAction<ConsultationsFilters>
  >(
    filtersKey,
    keyValueStateReducer<ConsultationsFilters>,
    defaultFilters,
    resetActionCreator
  );

  // Generic function to update any filter property
  const setFilter = useCallback(
    <K extends keyof ConsultationsFilters>(
      key: K,
      value: ConsultationsFilters[K]
    ) => {
      dispatch({
        type: "SET_FIELD",
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
