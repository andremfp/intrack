import type { AppError } from "@/errors";
import type { ConsultationsFilters } from "@/lib/api/consultations";

/**
 * Generic action types for reducer-like state management over key/value objects.
 * Used both for filters and for other persisted UI state such as sorting.
 */
export type KeyValueStateAction<T extends Record<string, unknown>> =
  | {
      type: "SET_FIELD";
      payload: {
        key: keyof T;
        value: T[keyof T];
      };
    }
  | {
      type: "SET_FIELDS";
      payload: Partial<T>;
    }
  | {
      type: "RESET_FIELD";
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
 * @deprecated Use KeyValueStateAction instead. Left for backwards compatibility.
 */
export type FiltersAction<T extends Record<string, unknown>> =
  KeyValueStateAction<T>;

/**
 * Options for managing consultations filters state.
 * Filters are always typed as ConsultationsFilters.
 */
export interface UseFiltersOptions {
  filtersKey: string;
  defaultFilters: ConsultationsFilters;
}

/**
 * Return type for the consultations filters hook.
 */
export interface UseFiltersReturn {
  filters: ConsultationsFilters;
  setFilter: <K extends keyof ConsultationsFilters>(
    key: K,
    value: ConsultationsFilters[K]
  ) => void;
}

/**
 * Options for data fetching hook, specialized to ConsultationsFilters.
 */
export interface UseDataFetchingOptions<TData> {
  /** Current filter state (read-only, managed by parent) */
  filters: ConsultationsFilters;
  /** Function to fetch data with filters */
  fetchFunction: (
    filters: ConsultationsFilters
  ) => Promise<{ success: boolean; data?: TData; error?: AppError }>;
  /** Dependencies that should trigger initial load */
  loadDependencies: unknown[];
  /** Optional: Custom error message for toast */
  errorMessage?: string;
}

/**
 * Return type for data fetching hook
 */
export interface UseDataFetchingReturn<TData> {
  /** Fetched data */
  data: TData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: AppError | null;
  /** Load function with optional filter override */
  loadData: (filtersOverride?: Partial<ConsultationsFilters>) => Promise<void>;
  /** Retry loading data */
  retryLoadData: () => Promise<void>;
}

