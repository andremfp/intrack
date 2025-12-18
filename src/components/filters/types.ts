import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationsFilters } from "@/lib/api/consultations";

// Filter field types - fixed to consultations filters
export type FilterFieldType =
  | "year"
  | "location"
  | "internship"
  | "sex"
  | "autonomy"
  | "ageRange"
  | "dateRange"
  | "processNumber"
  | "type"
  | "presential"
  | "smoker"
  | "contraceptive"
  | "new_contraceptive"
  | "family_type"
  | "school_level"
  | "professional_area"
  | "profession"
  | "vaccination_plan";

// UI configuration for filter display - specifies which filters to show and how
export interface FilterUIConfig {
  // Which fields to enable
  enabledFields: FilterFieldType[];
  // Badge display location
  badgeLocation: "inside" | "outside";
  // Specialty for year selector
  specialty?: Specialty | null;
  // Current filter values (always ConsultationsFilters)
  filterValues: ConsultationsFilters;
  // Setters for filter values (keyed by filter field name)
  // Value is intentionally unknown here to keep the UI layer simple.
  filterSetters: Record<string, (value: unknown) => void>;
  // Loading state
  isLoading?: boolean;
}

export interface ConsultationFiltersProps {
  config: FilterUIConfig;
  isLoading?: boolean;
}

// Sorting types (re-exported from sorting module for convenience)
export type {
  SortingConfig,
  ConsultationSortingProps,
} from "../sorting/types";
