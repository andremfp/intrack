import type { MGFConsultationsFilters } from "@/lib/api/consultations";

/**
 * Helper function to create a filter setter for a specific field.
 * This generates a setter function that updates a single filter field
 * in the filters object.
 *
 * @param fieldName - The key from MGFConsultationsFilters to update
 * @param onFiltersChange - The callback function to update filters
 * @returns A setter function that takes a value and updates the filter
 */
export function createFilterSetter<T>(
  fieldName: keyof MGFConsultationsFilters,
  onFiltersChange: (
    filters:
      | MGFConsultationsFilters
      | ((prev: MGFConsultationsFilters) => MGFConsultationsFilters)
  ) => void
) {
  return (value: unknown) => {
    onFiltersChange((prev) => ({
      ...prev,
      [fieldName]: value as T | undefined,
    }));
  };
}

