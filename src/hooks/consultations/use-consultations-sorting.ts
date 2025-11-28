import { useCallback, useMemo } from "react";
import type { ConsultationsSorting } from "@/lib/api/consultations";
import { keyValueStateReducer } from "@/hooks/filters/helpers";
import { usePersistedReducer } from "@/hooks/filters/use-persisted-reducer";
import type { KeyValueStateAction } from "@/hooks/filters/types";

interface UseConsultationsSortingParams {
  specialtyYear?: number;
}

interface UseConsultationsSortingResult {
  sorting: ConsultationsSorting;
  setSorting: (sorting: ConsultationsSorting) => void;
}

/**
 * Hook to manage consultations sorting state and persistence.
 * Keeps sorting concerns separate from filters/pagination while
 * reusing the shared key-value persistence logic.
 */
export function useConsultationsSorting({
  specialtyYear,
}: UseConsultationsSortingParams): UseConsultationsSortingResult {
  // Generate localStorage key for sorting (per specialty year)
  const sortingKey = useMemo(() => {
    const year = specialtyYear ?? "default";
    return `consultations-sorting-${year}`;
  }, [specialtyYear]);

  // Stable default sorting configuration
  const defaultSorting: ConsultationsSorting = useMemo(
    () => ({ field: "date", order: "desc" }),
    []
  );

  // Reset action creator with stable identity
  const resetActionCreator = useMemo(
    () =>
      (
        payload: ConsultationsSorting
      ): KeyValueStateAction<ConsultationsSorting> => ({
        type: "RESET",
        payload,
      }),
    []
  );

  const [sorting, dispatch] = usePersistedReducer<
    ConsultationsSorting,
    KeyValueStateAction<ConsultationsSorting>
  >(sortingKey, keyValueStateReducer<ConsultationsSorting>, defaultSorting, resetActionCreator);

  const setSorting = useCallback(
    (newSorting: ConsultationsSorting) => {
      dispatch(resetActionCreator(newSorting));
    },
    [dispatch, resetActionCreator]
  );

  return {
    sorting,
    setSorting,
  };
}


