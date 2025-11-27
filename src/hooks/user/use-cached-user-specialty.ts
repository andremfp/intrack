import { useState, useCallback } from "react";
import type { Specialty } from "@/lib/api/specialties";
import { userCache } from "@/utils/user-cache";

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
