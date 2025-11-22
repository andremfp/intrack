import type {
  MGFConsultationsFilters,
  MGFConsultationsSorting,
} from "@/lib/api/consultations";

/**
 * Safely get value from localStorage with error handling
 */
function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error(`Error reading ${key} from cache:`, error);
    return null;
  }
}

/**
 * Safely set value to localStorage with error handling
 */
function setToCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to cache:`, error);
  }
}

/**
 * Remove value from localStorage
 */
function removeFromCache(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from cache:`, error);
  }
}

/**
 * Plain JavaScript utilities for managing consultations-related localStorage cache
 * Not a hook - can be used anywhere, including outside React components
 */
export const consultationsCache = {
  /**
   * Get persisted filters for a specific specialty year
   */
  getFilters: (specialtyYear: number): MGFConsultationsFilters => {
    const key = `consultations-filters-${specialtyYear}`;
    const cached = getFromCache<MGFConsultationsFilters>(key);
    return cached || {};
  },

  /**
   * Set persisted filters for a specific specialty year
   */
  setFilters: (specialtyYear: number, filters: MGFConsultationsFilters): void => {
    const key = `consultations-filters-${specialtyYear}`;
    setToCache(key, filters);
  },

  /**
   * Get persisted sorting for a specific specialty year
   */
  getSorting: (specialtyYear: number): MGFConsultationsSorting => {
    const key = `consultations-sorting-${specialtyYear}`;
    const cached = getFromCache<MGFConsultationsSorting>(key);
    return cached || { field: "date", order: "desc" };
  },

  /**
   * Set persisted sorting for a specific specialty year
   */
  setSorting: (specialtyYear: number, sorting: MGFConsultationsSorting): void => {
    const key = `consultations-sorting-${specialtyYear}`;
    setToCache(key, sorting);
  },

  /**
   * Clear filters for a specific specialty year
   */
  clearFilters: (specialtyYear: number): void => {
    const key = `consultations-filters-${specialtyYear}`;
    removeFromCache(key);
  },

  /**
   * Clear sorting for a specific specialty year
   */
  clearSorting: (specialtyYear: number): void => {
    const key = `consultations-sorting-${specialtyYear}`;
    removeFromCache(key);
  },

  /**
   * Clear all consultations cache for a specific specialty year
   */
  clearAll: (specialtyYear: number): void => {
    consultationsCache.clearFilters(specialtyYear);
    consultationsCache.clearSorting(specialtyYear);
  },
};

