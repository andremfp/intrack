import type { Specialty } from "@/lib/api/specialties";

// Filter field types - generic across all filter implementations
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
  | "smoker";

// UI configuration for filter display - specifies which filters to show and how
export interface FilterUIConfig<T = Record<string, unknown>> {
  // Which fields to enable
  enabledFields: FilterFieldType[];
  // Badge display location
  badgeLocation: "inside" | "outside";
  // Specialty for year selector
  specialty?: Specialty | null;
  // Current filter values
  filterValues: T;
  // Setters for filter values
  filterSetters: Record<string, (value: unknown) => void>;
  // Loading state
  isLoading?: boolean;
}

export interface ConsultationFiltersProps<T = Record<string, unknown>> {
  config: FilterUIConfig<T>;
  isLoading?: boolean;
}

// Sorting configuration
export interface SortingConfig {
  field: string;
  order: "asc" | "desc";
  fieldLabels: Record<string, string>;
  onSortingChange: (sorting: SortingConfig) => void;
}

export interface ConsultationSortingProps {
  sorting: SortingConfig;
  isLoading?: boolean;
}
