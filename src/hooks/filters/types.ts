import type { AppError } from "@/errors";

/**
 * Generic action types for filters reducer
 * Works with any filter state type T
 */
export type FiltersAction<T extends Record<string, unknown>> =
  | {
      type: "SET_FILTER";
      payload: {
        key: keyof T;
        value: T[keyof T];
      };
    }
  | {
      type: "SET_FILTERS";
      payload: Partial<T>;
    }
  | {
      type: "RESET_FILTER";
      payload: keyof T;
    }
  | {
      type: "RESET_ALL";
      payload?: T;
    }
  | {
      type: "RESET";
      payload: T;
    };

/**
 * Generic hook for managing filter state with optional dynamic data loading.
 * Supports both metrics dashboard and consultations table use cases.
 */
export interface UseFiltersOptions<T> {
  filtersKey: string;
  defaultFilters: T;
}

/**
 * Return type for the generic use-filters hook
 */
export interface UseFiltersReturn<T> {
  filters: T;
  setFilter: <K extends keyof T>(key: K, value: T[K]) => void;
}

/**
 * Generic options for data fetching hook
 */
export interface UseDataFetchingOptions<TFilters extends Record<string, unknown>, TData> {
  /** Current filter state (read-only, managed by parent) */
  filters: TFilters;
  /** Function to fetch data with filters */
  fetchFunction: (filters: TFilters) => Promise<{ success: boolean; data?: TData; error?: AppError }>;
  /** Dependencies that should trigger initial load */
  loadDependencies: unknown[];
  /** Optional: Custom error message for toast */
  errorMessage?: string;
}

/**
 * Return type for data fetching hook
 */
export interface UseDataFetchingReturn<TFilters extends Record<string, unknown>, TData> {
  /** Fetched data */
  data: TData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: AppError | null;
  /** Load function with optional filter override */
  loadData: (filtersOverride?: Partial<TFilters>) => Promise<void>;
  /** Retry loading data */
  retryLoadData: () => Promise<void>;
}

