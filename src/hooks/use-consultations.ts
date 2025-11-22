import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { errorToast } from "@/utils/error-toast";
import {
  getMGFConsultations,
  deleteConsultation,
  type MGFConsultationsFilters,
  type MGFConsultationsSorting,
  type ConsultationMGF,
} from "@/lib/api/consultations";
import { consultationsCache } from "@/utils/consultations-cache";
import { PAGINATION_CONSTANTS, TAB_CONSTANTS } from "@/constants";

interface UseConsultationsParams {
  userId: string | undefined;
  specialtyYear: number | undefined; // Only needed for Consultas tabs
  mainTab: string;
}

interface UseConsultationsResult {
  consultations: ConsultationMGF[];
  totalCount: number;
  currentPage: number;
  filters: MGFConsultationsFilters;
  sorting: MGFConsultationsSorting;
  isLoading: boolean;
  isInitialLoad: boolean;
  setFilters: (
    updater:
      | MGFConsultationsFilters
      | ((prev: MGFConsultationsFilters) => MGFConsultationsFilters)
  ) => void;
  setSorting: (sorting: MGFConsultationsSorting) => void;
  loadConsultations: (
    page?: number,
    filtersOverride?: MGFConsultationsFilters,
    sortingOverride?: MGFConsultationsSorting
  ) => Promise<void>;
  handleApplyFilters: (newFilters?: Record<string, unknown>) => Promise<void>;
  handleClearFilters: () => Promise<void>;
  handleSortingChange: (newSorting: MGFConsultationsSorting) => Promise<void>;
  handlePageChange: (page: number) => Promise<void>;
  handleBulkDelete: (
    ids: string[]
  ) => Promise<{ deletedIds: string[]; failedIds: string[] }>;
  refreshConsultations: () => Promise<void>;
}

/**
 * Hook to manage consultations loading, filtering, sorting, and pagination
 */
export function useConsultations({
  userId,
  specialtyYear,
  mainTab,
}: UseConsultationsParams): UseConsultationsResult {
  const [consultations, setConsultations] = useState<ConsultationMGF[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const pageSize = PAGINATION_CONSTANTS.CONSULTATIONS_PAGE_SIZE;

  // Use default year of 1 if specialtyYear is undefined (should only happen for Metrics tabs)
  // This hook is primarily used for Consultas tabs where specialtyYear is always defined
  const effectiveSpecialtyYear = specialtyYear ?? 1;

  // Initialize filters and sorting from cache
  const [filters, setFiltersState] = useState<MGFConsultationsFilters>(() =>
    consultationsCache.getFilters(effectiveSpecialtyYear)
  );
  const [sorting, setSortingState] = useState<MGFConsultationsSorting>(() =>
    consultationsCache.getSorting(effectiveSpecialtyYear)
  );

  // Load filters when specialty year changes
  useEffect(() => {
    if (mainTab === TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS && specialtyYear !== undefined) {
      const persistedFilters = consultationsCache.getFilters(specialtyYear);
      const persistedSorting = consultationsCache.getSorting(specialtyYear);
      setFiltersState(persistedFilters);
      setSortingState(persistedSorting);
    }
  }, [specialtyYear, mainTab]);

  const loadConsultations = useCallback(
    async (
      page: number = 1,
      filtersOverride?: MGFConsultationsFilters,
      sortingOverride?: MGFConsultationsSorting
    ) => {
      if (!userId) return;

      setIsLoading(true);
      const filtersToUse = filtersOverride ?? filters;
      const sortingToUse = sortingOverride ?? sorting;

      const result = await getMGFConsultations(
        userId,
        specialtyYear ?? 1,
        page,
        pageSize,
        filtersToUse,
        sortingToUse
      );

      if (result.success) {
        setConsultations(result.data.consultations);
        setTotalCount(result.data.totalCount);
        setCurrentPage(page);
      } else {
        errorToast.fromApiError(result.error, "Erro ao carregar consultas");
      }

      setIsLoading(false);
      setIsInitialLoad(false);
    },
    [userId, specialtyYear, pageSize, filters, sorting]
  );

  const setFilters = useCallback(
    (
      updater:
        | MGFConsultationsFilters
        | ((prev: MGFConsultationsFilters) => MGFConsultationsFilters)
    ) => {
      setFiltersState((prevFilters) => {
        const newFilters =
          typeof updater === "function" ? updater(prevFilters) : updater;
        return newFilters;
      });
    },
    []
  );

  const setSorting = useCallback((newSorting: MGFConsultationsSorting) => {
    setSortingState(newSorting);
  }, []);

  const handleApplyFilters = useCallback(
    async (newFilters?: Record<string, unknown>) => {
      if (!userId) return;

      setIsInitialLoad(true);
      setCurrentPage(1);
      const filtersToUse =
        (newFilters as MGFConsultationsFilters) || filters;

      // Save to localStorage (only for Consultas tabs where specialtyYear is defined)
      if (specialtyYear !== undefined) {
        consultationsCache.setFilters(specialtyYear, filtersToUse);
      }
      setFiltersState(filtersToUse);

      await loadConsultations(1, filtersToUse, sorting);
    },
    [userId, specialtyYear, filters, sorting, loadConsultations]
  );

  const handleClearFilters = useCallback(async () => {
    if (!userId) return;

    const emptyFilters: MGFConsultationsFilters = {};
    if (specialtyYear !== undefined) {
      consultationsCache.setFilters(specialtyYear, emptyFilters);
    }
    setFiltersState(emptyFilters);

    setIsInitialLoad(true);
    setCurrentPage(1);
    await loadConsultations(1, emptyFilters, sorting);
  }, [userId, specialtyYear, sorting, loadConsultations]);

  const handleSortingChange = useCallback(
    async (newSorting: MGFConsultationsSorting) => {
      if (!userId) return;

      // Save to localStorage (only for Consultas tabs where specialtyYear is defined)
      if (specialtyYear !== undefined) {
        consultationsCache.setSorting(specialtyYear, newSorting);
      }
      setSortingState(newSorting);

      setCurrentPage(1);
      await loadConsultations(1, filters, newSorting);
    },
    [userId, specialtyYear, filters, loadConsultations]
  );

  const handlePageChange = useCallback(
    async (page: number) => {
      if (!userId) return;
      await loadConsultations(page);
    },
    [userId, loadConsultations]
  );

  const handleBulkDelete = useCallback(
    async (ids: string[]): Promise<{
      deletedIds: string[];
      failedIds: string[];
    }> => {
      if (!userId) {
        return { deletedIds: [], failedIds: ids };
      }

      const deletedIds: string[] = [];
      const failedIds: string[] = [];

      setIsLoading(true);

      // Helper to refresh consultations list after delete operations
      const refreshAfterDelete = async () => {
        await loadConsultations(currentPage, filters, sorting);
      };

      try {
        const deletePromises = ids.map((id) => deleteConsultation(id));
        const results = await Promise.allSettled(deletePromises);

        results.forEach((result, index) => {
          if (result.status === "fulfilled" && result.value.success) {
            deletedIds.push(ids[index]);
          } else {
            failedIds.push(ids[index]);
            const errorMsg =
              result.status === "rejected"
                ? result.reason
                : !result.value.success
                ? result.value.error
                : "Unknown error";
            console.error(
              `Failed to delete consultation ${ids[index]}:`,
              errorMsg
            );
          }
        });

        if (deletedIds.length > 0 && failedIds.length === 0) {
          toast.success(
            `${deletedIds.length} consulta(s) eliminada(s) com sucesso`
          );
        } else if (deletedIds.length > 0 && failedIds.length > 0) {
          toast.warning("Eliminação parcial", {
            description: `${deletedIds.length} eliminada(s), ${failedIds.length} falharam.`,
          });
        } else {
          toast.error("Erro ao eliminar consultas", {
            description: "Nenhuma consulta foi eliminada.",
          });
        }

        // Return results for optimistic update handling
        return { deletedIds, failedIds };
      } catch (error) {
        console.error("Unexpected error during bulk delete:", error);
        toast.error("Erro ao eliminar consultas", {
          description: "Ocorreu um erro inesperado.",
        });
        // On unexpected error, mark all as failed
        return { deletedIds: [], failedIds: ids };
      } finally {
        // Always refresh to show any partial deletions or current state
        await refreshAfterDelete();
      }
    },
    [userId, currentPage, filters, sorting, loadConsultations]
  );

  const refreshConsultations = useCallback(async () => {
    if (!userId) return;
    await loadConsultations(currentPage, filters, sorting);
  }, [userId, currentPage, filters, sorting, loadConsultations]);

  // Load consultations when user or specialty year changes
  useEffect(() => {
    if (userId && mainTab === TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS && specialtyYear !== undefined) {
      setIsInitialLoad(true);
      setCurrentPage(1);
      const persistedFilters = consultationsCache.getFilters(specialtyYear);
      const persistedSorting = consultationsCache.getSorting(specialtyYear);
      loadConsultations(1, persistedFilters, persistedSorting);
    }
  }, [userId, specialtyYear, mainTab, loadConsultations]);

  return {
    consultations,
    totalCount,
    currentPage,
    filters,
    sorting,
    isLoading,
    isInitialLoad,
    setFilters,
    setSorting,
    loadConsultations,
    handleApplyFilters,
    handleClearFilters,
    handleSortingChange,
    handlePageChange,
    handleBulkDelete,
    refreshConsultations,
  };
}

