import type { ConsultationMGF, MGFConsultationsSorting } from "@/lib/api/consultations";
import { ageToYears } from "@/constants";

/**
 * Utility functions for sorting consultations data.
 * Note: This is different from consultation-sorting.tsx which is a UI component.
 */

/**
 * Compare two consultations by favorite status
 * Returns: negative if a should come before b, positive if b should come before a
 * Favorites always come first
 */
function compareFavorites(
  a: ConsultationMGF,
  b: ConsultationMGF
): number {
  const favoriteA = a.favorite ?? false;
  const favoriteB = b.favorite ?? false;
  
  if (favoriteA !== favoriteB) {
    // Favorites come first (true comes before false)
    return favoriteB ? 1 : -1;
  }
  
  // Same favorite status, no preference
  return 0;
}

/**
 * Compare two consultations by age (converting to years)
 */
function compareAge(
  a: ConsultationMGF,
  b: ConsultationMGF,
  order: "asc" | "desc"
): number {
  const ageA =
    a.age !== null && a.age_unit
      ? ageToYears(a.age, a.age_unit)
      : 0;
  const ageB =
    b.age !== null && b.age_unit
      ? ageToYears(b.age, b.age_unit)
      : 0;
  
  return order === "asc" ? ageA - ageB : ageB - ageA;
}

/**
 * Sort consultations with favorites first, then by the specified field
 * This is used for client-side sorting when database sorting isn't sufficient
 * (e.g., when age sorting requires unit conversion)
 */
export function sortConsultationsWithFavorites(
  consultations: ConsultationMGF[],
  sorting: MGFConsultationsSorting
): ConsultationMGF[] {
  return [...consultations].sort((a, b) => {
    // First, sort by favorite (favorites first)
    const favoriteComparison = compareFavorites(a, b);
    if (favoriteComparison !== 0) {
      return favoriteComparison;
    }

    // If both have same favorite status, sort by the specified field
    if (sorting.field === "age") {
      return compareAge(a, b, sorting.order);
    }

    // For other fields, use simple comparison
    // Note: This is primarily used for age sorting, other fields use database sorting
    const fieldA = (a as Record<string, unknown>)[sorting.field] ?? "";
    const fieldB = (b as Record<string, unknown>)[sorting.field] ?? "";
    
    if (sorting.order === "asc") {
      return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
    } else {
      return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
    }
  });
}

