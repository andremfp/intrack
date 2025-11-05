import { useState, useCallback } from "react";
import type { UserData } from "@/lib/api/users";
import type { Specialty } from "@/lib/api/specialties";
import type { TabType } from "@/constants";
import { userCache } from "@/lib/user-cache";

/**
 * React hooks for stateful cache management
 * These hooks combine React state with localStorage persistence
 */

/**
 * Hook that provides user profile state synced with localStorage
 * Returns [cachedValue, setter] similar to useState
 */
export function useCachedUserProfile() {
  const [userProfile, setUserProfileState] = useState<UserData | null>(() =>
    userCache.getUserProfile()
  );

  const updateUserProfile = useCallback((profile: UserData) => {
    setUserProfileState(profile);
    userCache.setUserProfile(profile);
  }, []);

  return [userProfile, updateUserProfile] as const;
}

/**
 * Hook that provides user specialty state synced with localStorage
 * Returns [cachedValue, setter] similar to useState
 */
export function useCachedUserSpecialty() {
  const [userSpecialty, setUserSpecialtyState] = useState<Specialty | null>(
    () => userCache.getUserSpecialty()
  );

  const updateUserSpecialty = useCallback((specialty: Specialty) => {
    setUserSpecialtyState(specialty);
    userCache.setUserSpecialty(specialty);
  }, []);

  return [userSpecialty, updateUserSpecialty] as const;
}

/**
 * Hook that provides active tab state synced with localStorage
 * Returns [cachedValue, setter] similar to useState
 */
export function useCachedActiveTab() {
  const [activeTab, setActiveTabState] = useState<TabType>(() => {
    const cached = userCache.getActiveTab();
    // Migrate old "Resumo" to "Métricas.Geral"
    if (cached === "Resumo") {
      const migrated = "Métricas.Geral";
      userCache.setActiveTab(migrated);
      return migrated;
    }
    return cached || "Métricas.Geral";
  });

  const updateActiveTab = useCallback((tab: TabType) => {
    setActiveTabState(tab);
    userCache.setActiveTab(tab);
  }, []);

  return [activeTab, updateActiveTab] as const;
}
