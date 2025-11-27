import { useState, useCallback } from "react";
import type { UserData } from "@/lib/api/users";
import { userCache } from "@/utils/user-cache";

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
