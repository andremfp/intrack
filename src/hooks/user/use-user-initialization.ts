import { useEffect, useState, useRef } from "react";
import { toasts } from "@/utils/toasts";
import { useNavigate } from "react-router-dom";
import { checkUserExists, getCurrentUser, upsertUser } from "@/lib/api/users";
import { getSpecialty } from "@/lib/api/specialties";
import type { UserData } from "@/lib/api/users";
import type { Specialty } from "@/lib/api/specialties";
import { useIsMounted } from "../ui/use-is-mounted";
import type { UseUserInitializationResult } from "./types";
import { ErrorMessages } from "@/errors";
import { userCache } from "@/utils/user-cache";

/**
 * Hook to handle user initialization logic
 * Checks if user exists, creates if needed, loads user profile and specialty
 * Updates are handled through the cache hooks, so this only manages loading state
 */
export function useUserInitialization(
  updateUserProfile: (profile: UserData) => void,
  updateUserSpecialty: (specialty: Specialty) => void,
  initialUserProfile: UserData | null,
  // Optional toast injection — defaults to imported toasts, override in tests
  _toasts: typeof toasts = toasts
): UseUserInitializationResult {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(!initialUserProfile);
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const hasInitialized = useRef(false);
  const isMounted = useIsMounted();

  useEffect(() => {
    // If we already have a user profile, skip initialization
    if (initialUserProfile) {
      setIsLoading(false);
      const hasSpecialty = !!initialUserProfile.data.specialty_id;
      setShowSpecialtyModal(!hasSpecialty);
      hasInitialized.current = true;
      return;
    }

    // Only run initialization once (unless it failed/aborted)
    if (hasInitialized.current) {
      return;
    }

    (async () => {
      try {
        // First check if user profile exists
        const userExistsResult = await checkUserExists();
        if (!isMounted()) return;

        if (!userExistsResult.success) {
          // If the auth session is missing/invalid, treat it as a logout and redirect to login
          if (userExistsResult.error.userMessage === ErrorMessages.AUTH_FAILED) {
            userCache.clearAllCache();
            setIsLoading(false);
            navigate("/", { replace: true });
            return;
          }

          setIsLoading(false);
          hasInitialized.current = true;
          _toasts.apiError(userExistsResult.error, "Erro");
          return;
        }

        let userData: UserData;

        // If user doesn't exist, create it (OAuth first-time login)
        if (!userExistsResult.data) {
          const upsertResult = await upsertUser();
          if (!isMounted()) return;

          if (!upsertResult.success) {
            setIsLoading(false);
            hasInitialized.current = true;
            _toasts.apiError(upsertResult.error, "Erro ao criar perfil");
            return;
          }

          if (!upsertResult.data) {
            setIsLoading(false);
            hasInitialized.current = true;
            _toasts.error(
              "Erro ao criar perfil",
              "Não foi possível obter os dados do utilizador após a criação."
            );
            return;
          }

          userData = upsertResult.data;
        } else {
          // User exists, fetch their data
          const userResult = await getCurrentUser();
          if (!isMounted()) return;

          if (!userResult.success) {
            setIsLoading(false);
            hasInitialized.current = true;
            _toasts.apiError(userResult.error, "Erro ao carregar perfil");
            return;
          }

          if (!userResult.data) {
            setIsLoading(false);
            hasInitialized.current = true;
            _toasts.error(
              "Erro ao carregar perfil",
              "Não foi possível carregar o perfil do utilizador."
            );
            return;
          }

          userData = userResult.data;
        }

        // Update cache (which will update the cached hooks)
        updateUserProfile(userData);

        // Check if user has specialty_id
        const hasSpecialty = !!userData.data.specialty_id;
        setShowSpecialtyModal(!hasSpecialty);

        // Load specialty data if user has one
        if (hasSpecialty && userData.data.specialty_id) {
          const specialtyResult = await getSpecialty(
            userData.data.specialty_id
          );

          if (specialtyResult.success) {
            updateUserSpecialty(specialtyResult.data);
          } else {
            _toasts.apiError(
              specialtyResult.error,
              "Erro ao carregar especialidade"
            );
          }
        }

        setIsLoading(false);
        hasInitialized.current = true;
      } catch (error) {
        console.error("Unexpected error during user initialization:", error);
        setIsLoading(false);
        hasInitialized.current = true;
        _toasts.error(
          "Erro inesperado",
          "Ocorreu um erro inesperado ao inicializar o utilizador."
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return {
    isLoading,
    showSpecialtyModal,
  };
}
