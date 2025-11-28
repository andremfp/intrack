import { TAB_CONSTANTS } from "@/constants";
import type { ConsultationsFilters } from "@/lib/api/consultations";
import type { KeyValueStateAction } from "./types";

/**
 * FILTER / SORTING STATE MANAGEMENT
 * =================================
 */

/**
 * Generic reducer for key/value UI state management.
 * Centralizes all state updates (filters, sorting, etc.) in one place.
 * Works with any state type that extends Record<string, unknown>.
 */
export function keyValueStateReducer<T extends Record<string, unknown>>(
  state: T,
  action: KeyValueStateAction<T>
): T {
  switch (action.type) {
    case "SET_FIELD": {
      const { key, value } = action.payload;
      return {
        ...state,
        [key]: value,
      };
    }

    case "SET_FIELDS": {
      return {
        ...state,
        ...action.payload,
      };
    }

    case "RESET_FIELD": {
      return {
        ...state,
        [action.payload]: undefined,
      };
    }

    case "RESET_ALL": {
      return action.payload ?? state;
    }

    case "RESET": {
      return action.payload;
    }

    default: {
      // Exhaustiveness check - ensures all action types are handled
      void action;
      return state;
    }
  }
}

/**
 * Helper function to load persisted state from localStorage
 * Returns the loaded value merged with defaults, or just defaults if nothing is cached
 */
export function loadPersistedState<T extends Record<string, unknown>>(
  key: string,
  defaultValue: T
): T {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Merge with default to ensure all properties exist
      return { ...defaultValue, ...parsed };
    }
  } catch {
    // Ignore errors, fall back to default
  }
  return defaultValue;
}

/**
 * FILTER UTILITIES
 * ================
 */

/**
 * Merges base filters with optional overrides.
 * If override is provided, it merges with base filters (override takes precedence).
 * If override is not provided or is empty, returns base filters.
 *
 * This is the standard pattern for handling filter overrides in data loading hooks.
 *
 * @param base - Base filter state
 * @param override - Optional partial filters to override base filters
 * @returns Merged filters
 */
export function mergeFilters(
  base: ConsultationsFilters,
  override?: Partial<ConsultationsFilters> | ConsultationsFilters
): ConsultationsFilters {
  if (!override) {
    return base;
  }

  // If override is a full object (not partial), use it directly
  // Otherwise merge with base
  return {
    ...base,
    ...override,
  };
}

/**
 * FILTER CONFIGURATION
 * ====================
 */

/**
 * Default filters object for both metrics and consultations.
 * All properties are explicitly set to undefined to ensure consistent behavior
 * when merging with localStorage and iterating over filter keys.
 *
 * This ensures uniform filter initialization across both components.
 */
export const defaultConsultationsFilters: ConsultationsFilters = {
  year: undefined,
  location: undefined,
  internship: undefined,
  processNumber: undefined,
  sex: undefined,
  autonomy: undefined,
  ageMin: undefined,
  ageMax: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  type: undefined,
  presential: undefined,
  smoker: undefined,
};

/**
 * Unified function to generate filter keys based on the active tab.
 * Returns the appropriate localStorage key for persisting filters.
 *
 * @param mainTab - The main tab ("Consultas" or "Métricas")
 * @param specialtyYear - Specialty year for Consultas tab (e.g., 1, 2, 3)
 * @param metricsSubTab - Sub-tab for Metrics tab ("Geral", "Consultas", "ICPC-2")
 * @returns localStorage key for filters
 */
export function getFiltersKey(
  mainTab: "Consultas" | "Métricas",
  specialtyYear?: number,
  metricsSubTab?: "Geral" | "Consultas" | "ICPC-2"
): string {
  if (mainTab === TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS) {
    // For Consultas tab, use specialty year (or 1 as fallback)
    const year = specialtyYear ?? 1;
    return `consultations-filters-${year}`;
  }

  else {
    // For Metrics tab, use sub-tab name
    const subTab = metricsSubTab || "Geral";
    return `metrics-filters-${subTab}`;
  }
}
