import { useState, useCallback, useEffect, useRef } from "react";
import type { TabType } from "@/constants";
import { TAB_CONSTANTS } from "@/constants";
import { userCache } from "@/utils/user-cache";
import type { UserData } from "@/lib/api/users";

/**
 * Hook that provides active tab state synced with localStorage
 * Returns [cachedValue, setter] similar to useState
 * @param userProfile - Optional user profile to react to when it loads
 */
export function useCachedActiveTab(userProfile?: UserData | null) {
  const [activeTab, setActiveTabState] = useState<TabType>(() => {
    const cachedUserProfile = userCache.getUserProfile();
    const userSpecialtyYear = cachedUserProfile?.data.specialty_year;
    const cached = userCache.getActiveTab();

    // If there's a cached tab, validate it for consultations tabs
    if (cached) {
      // If it's a consultations tab and we have a specialty year, check if it matches
      if (
        cached.startsWith(`${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.`) &&
        userSpecialtyYear
      ) {
        const cachedYear = parseInt(cached.split(".")[1]);
        // If the cached year doesn't match the user's specialty year, recalculate
        if (cachedYear !== userSpecialtyYear) {
          return `${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.${userSpecialtyYear}`;
        }
      }
      return cached;
    }

    // No cached tab, calculate default based on user's specialty year
    if (userSpecialtyYear && userSpecialtyYear >= 1) {
      return `${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.${userSpecialtyYear}`;
    }

    return TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS;
  });

  // Track previous specialty year to detect changes
  const prevSpecialtyYearRef = useRef<number | undefined>(
    userProfile?.data.specialty_year
  );

  // Update tab when user profile loads or specialty year changes
  // Note: This effect should NOT run when activeTab changes (user clicking tabs)
  useEffect(() => {
    // Use provided userProfile or fall back to cache
    const profile = userProfile || userCache.getUserProfile();
    const userSpecialtyYear = profile?.data.specialty_year;

    // Only update if specialty year actually changed
    if (userSpecialtyYear === prevSpecialtyYearRef.current) {
      return;
    }

    prevSpecialtyYearRef.current = userSpecialtyYear;

    // Use functional update to read current activeTab value
    setActiveTabState((currentTab) => {
      // If we're on a consultations tab (base or year-specific)
      if (currentTab.startsWith(TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS)) {
        // If it's a year-specific tab, extract the year
        if (
          currentTab.startsWith(`${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.`)
        ) {
          const currentYear = parseInt(currentTab.split(".")[1]);
          // If user's specialty year changed, update the tab
          if (
            userSpecialtyYear &&
            userSpecialtyYear >= 1 &&
            currentYear !== userSpecialtyYear
          ) {
            const expectedTab = `${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.${userSpecialtyYear}`;
            userCache.setActiveTab(expectedTab);
            return expectedTab;
          }
        } else {
          // We're on the base consultations tab
          // Update if we have a specialty year
          if (userSpecialtyYear && userSpecialtyYear >= 1) {
            const expectedTab = `${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.${userSpecialtyYear}`;
            userCache.setActiveTab(expectedTab);
            return expectedTab;
          }
        }
      }
      // No change needed
      return currentTab;
    });
  }, [userProfile]);

  const updateActiveTab = useCallback((tab: TabType) => {
    setActiveTabState(tab);
    userCache.setActiveTab(tab);
  }, []);

  return [activeTab, updateActiveTab] as const;
}
