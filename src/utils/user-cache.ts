import type { UserData } from "@/lib/api/users";
import type { Specialty } from "@/lib/api/specialties";
import type { TabType } from "@/constants";

// Cache keys as constants for consistency
const CACHE_KEYS = {
  USER_PROFILE: "userProfile",
  USER_SPECIALTY: "userSpecialty",
  ACTIVE_TAB: "activeTab",
} as const;

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
 * Plain JavaScript utilities for managing user-related localStorage cache
 * Not a hook - can be used anywhere, including outside React components
 */
export const userCache = {
  // User Profile operations
  getUserProfile: () => getFromCache<UserData>(CACHE_KEYS.USER_PROFILE),
  setUserProfile: (profile: UserData) =>
    setToCache(CACHE_KEYS.USER_PROFILE, profile),

  // User Specialty operations
  getUserSpecialty: () => getFromCache<Specialty>(CACHE_KEYS.USER_SPECIALTY),
  setUserSpecialty: (specialty: Specialty) =>
    setToCache(CACHE_KEYS.USER_SPECIALTY, specialty),

  // Active Tab operations
  getActiveTab: () => getFromCache<TabType>(CACHE_KEYS.ACTIVE_TAB),
  setActiveTab: (tab: TabType) => setToCache(CACHE_KEYS.ACTIVE_TAB, tab),

  // Clear all user-related cache (useful for logout)
  clearAllCache: () => {
    removeFromCache(CACHE_KEYS.USER_PROFILE);
    removeFromCache(CACHE_KEYS.USER_SPECIALTY);
    removeFromCache(CACHE_KEYS.ACTIVE_TAB);
  },
};
