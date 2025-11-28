import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { errorToast } from "@/utils/error-toast";
import type { AppError } from "@/errors";
import {
  getMGFConsultations,
  deleteConsultation,
  type ConsultationsSorting,
  type ConsultationMGF,
} from "@/lib/api/consultations";
import type { ConsultationsFilters } from "@/lib/api/consultations";
import { PAGINATION_CONSTANTS, TAB_CONSTANTS } from "@/constants";
import { mergeFilters } from "@/hooks/filters/helpers";
import { useConsultationsSorting } from "@/hooks/consultations/use-consultations-sorting";

interface UseConsultationsParams {
  userId: string | undefined;
  specialtyYear: number | undefined; // Only needed for Consultas tabs
  mainTab: string;
  filters: ConsultationsFilters; // Filters managed by parent via useFilters (read-only)
}

interface UseConsultationsResult {
  consultations: ConsultationMGF[];
  totalCount: number;
  currentPage: number;
  sorting: ConsultationsSorting;
  isLoading: boolean;
  isInitialLoad: boolean;
  error: AppError | null;
  retryLoadConsultations: () => Promise<void>;
  setSorting: (sorting: ConsultationsSorting) => void;
  loadConsultations: (
    page?: number,
    filtersOverride?: Partial<ConsultationsFilters>,
    sortingOverride?: ConsultationsSorting
  ) => Promise<void>;
  handleSortingChange: (newSorting: ConsultationsSorting) => Promise<void>;
  handlePageChange: (page: number) => Promise<void>;
  handleBulkDelete: (
    ids: string[]
  ) => Promise<{ deletedIds: string[]; failedIds: string[] }>;
  refreshConsultations: () => Promise<void>;
}

/**
 * Hook to manage consultations loading, sorting, and pagination.
 * Filters are consumed as read-only input from parent.
 * Filter state management is handled by the parent component.
 */
export function useConsultations({
  userId,
  specialtyYear,
  mainTab,
  filters, // Filters managed by parent via useFilters (read-only)
}: UseConsultationsParams): UseConsultationsResult {
  const [consultations, setConsultations] = useState<ConsultationMGF[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const hasLoadedConsultationsRef = useRef(false);
  const requestIdRef = useRef(0);

  const pageSize = PAGINATION_CONSTANTS.CONSULTATIONS_PAGE_SIZE;

  // Sorting state & persistence, kept separate from filters
  const { sorting, setSorting } = useConsultationsSorting({ specialtyYear });

  const loadConsultations = useCallback(
    async (
      page: number = 1,
      filtersOverride?: Partial<ConsultationsFilters>,
      sortingOverride?: ConsultationsSorting
    ) => {
      if (!userId) return;

      // Bump request id to track the latest in-flight request
      const requestId = ++requestIdRef.current;

      // Only show loading spinner on initial load
      const isInitialLoad = !hasLoadedConsultationsRef.current;
      if (isInitialLoad) {
        setIsLoading(true);
      }

      // Merge filters using shared utility (same pattern as MetricsDashboard)
      const filtersToUse = mergeFilters(filters, filtersOverride);
      const sortingToUse = sortingOverride ?? sorting;

      const result = await getMGFConsultations(
        userId,
        specialtyYear ?? 1,
        page,
        pageSize,
        filtersToUse,
        sortingToUse
      );

      // Ignore stale responses (if a newer request was started meanwhile)
      if (requestId === requestIdRef.current) {
        if (result.success) {
          setConsultations(result.data.consultations);
          setTotalCount(result.data.totalCount);
          setCurrentPage(page);
          setError(null);
          hasLoadedConsultationsRef.current = true;
        } else {
          // Always show toast for immediate feedback
          errorToast.fromApiError(result.error, "Erro ao carregar consultas");

          // Only set error state if we don't have cached data to show
          // If we have cached data, just show toast (non-blocking)
          if (isInitialLoad) {
            setError(result.error);
          }
        }

        if (isInitialLoad) {
          setIsLoading(false);
          setIsInitialLoad(false);
        }
      }
    },
    [userId, specialtyYear, pageSize, filters, sorting]
  );

  const handleSortingChange = useCallback(
    async (newSorting: ConsultationsSorting) => {
      if (!userId) return;

      // Update sorting (persistence is handled by useConsultationsSorting)
      setSorting(newSorting);

      setCurrentPage(1);
      // Pass undefined to use current filters (they're already in the hook's scope)
      await loadConsultations(1, undefined, newSorting);
    },
    [userId, setSorting, loadConsultations]
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
        // Pass undefined to use current filters and sorting
        await loadConsultations(currentPage, undefined, undefined);
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
    [userId, currentPage, loadConsultations]
  );

  const refreshConsultations = useCallback(async () => {
    if (!userId) return;
    // Pass undefined to use current filters and sorting
    await loadConsultations(currentPage, undefined, undefined);
  }, [userId, currentPage, loadConsultations]);

  const retryLoadConsultations = useCallback(async () => {
    await loadConsultations();
  }, [loadConsultations]);

  // Reactive loading: whenever user/config/filters/sorting change, (re)load page 1.
  // This mirrors the MetricsDashboard pattern (useDataFetching with filters in deps)
  // and avoids having multiple sources of truth for filters.
  useEffect(() => {
    if (!userId) return;
    if (mainTab !== TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS) return;
    if (specialtyYear === undefined) return;

    // Reset flags so the spinner/error state behaves correctly for new configs/filters
    setError(null);
    hasLoadedConsultationsRef.current = false;
    setIsInitialLoad(true);
    setCurrentPage(1);

    // Use current filters & sorting from hook scope
    loadConsultations(1, undefined, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userId,
    specialtyYear,
    mainTab,
    // React to filter content changes, not just reference
    JSON.stringify(filters),
    sorting.field,
    sorting.order,
  ]);


  return {
    consultations,
    totalCount,
    currentPage,
    sorting,
    isLoading,
    isInitialLoad,
    error,
    retryLoadConsultations,
    setSorting,
    loadConsultations,
    handleSortingChange,
    handlePageChange,
    handleBulkDelete,
    refreshConsultations,
  };
}


