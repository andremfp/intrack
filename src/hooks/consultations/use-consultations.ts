import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { toasts } from "@/utils/toasts";
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
import { consultations as consultationKeys } from "@/lib/query/keys";
import { clearRateLimitCache } from "@/lib/api/rate-limit";
import { ensureBulkDeleteAllowed as ensureBulkDeleteAllowedRateLimit } from "@/lib/api/bulk-delete-rate-limit";

// Query function that receives parameters from query context
async function fetchConsultations({
  queryKey,
}: {
  queryKey: readonly unknown[];
}): Promise<{ consultations: ConsultationMGF[]; totalCount: number }> {
  // Extract parameters from query key
  // Note: filters and sorting are stringified in the query key for stable comparison
  const [, , userId, specialtyYear, page, pageSize, filtersStr, sortingStr] =
    queryKey as [
      string,
      string,
      string,
      number,
      number,
      number,
      string, // stableStringify(filters)
      string // stableStringify(sorting)
    ];

  // Parse the stringified filters and sorting back to objects
  const filters = JSON.parse(filtersStr) as ConsultationsFilters;
  const sorting = JSON.parse(sortingStr) as ConsultationsSorting;

  const result = await getMGFConsultations(
    userId,
    specialtyYear,
    page,
    pageSize,
    filters,
    sorting
  );

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

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
  isCheckingDeleteRateLimit: boolean;
}

/**
 * Hook to manage consultations loading, sorting, and pagination.
 * Now uses React Query for caching with pagination/sorting/filter-aware query keys.
 * Filters are consumed as read-only input from parent.
 * Filter state management is handled by the parent component.
 */
export function useConsultations({
  userId,
  specialtyYear,
  mainTab,
  filters, // Filters managed by parent via useFilters (read-only)
}: UseConsultationsParams): UseConsultationsResult {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedConsultationsRef = useRef(false); // Only depend on specialtyYear
  const [isCheckingDeleteRateLimit, setIsCheckingDeleteRateLimit] =
    useState(false);

  const pageSize = PAGINATION_CONSTANTS.CONSULTATIONS_PAGE_SIZE;

  // Sorting state & persistence, kept separate from filters
  const { sorting, setSorting } = useConsultationsSorting({ specialtyYear });

  // Memoize filter hash to avoid unnecessary re-renders
  const filtersHash = useMemo(() => JSON.stringify(filters), [filters]);

  // React Query for consultations data
  const queryKey = consultationKeys.list({
    userId: userId || "",
    specialtyYear: specialtyYear || 1,
    page: currentPage,
    pageSize,
    filters,
    sorting,
  });

  const query: UseQueryResult<
    { consultations: ConsultationMGF[]; totalCount: number },
    AppError
  > = useQuery({
    queryKey,
    queryFn: fetchConsultations,
    enabled: !!(
      userId &&
      specialtyYear &&
      mainTab === TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS
    ),
  });

  // Extract data from query
  const consultationData = query.data?.consultations ?? [];
  const totalCount = query.data?.totalCount ?? 0;
  const isLoading = query.isLoading;
  const error = query.error as AppError | null;

  const loadConsultations = useCallback(
    async (
      page: number = 1,
      filtersOverride?: Partial<ConsultationsFilters>,
      sortingOverride?: ConsultationsSorting
    ) => {
      if (!userId || !specialtyYear) return;

      // For React Query, we change the current page and let the query refetch
      // with the new parameters
      if (page !== currentPage) {
        setCurrentPage(page);
        return;
      }

      // For filter/sorting overrides, we need to invalidate and refetch the specific query
      if (filtersOverride || sortingOverride) {
        const filtersToUse = filtersOverride
          ? mergeFilters(filters, filtersOverride)
          : filters;
        const sortingToUse = sortingOverride ?? sorting;

        await queryClient.invalidateQueries({
          queryKey: consultationKeys.list({
            userId,
            specialtyYear,
            page,
            pageSize,
            filters: filtersToUse,
            sorting: sortingToUse,
          }),
        });
      } else {
        // Simple refetch of current query
        await query.refetch();
      }
    },
    [
      userId,
      specialtyYear,
      currentPage,
      pageSize,
      filters,
      sorting,
      queryClient,
      query,
    ]
  );

  const handleSortingChange = useCallback(
    async (newSorting: ConsultationsSorting) => {
      if (!userId || !specialtyYear) return;

      // Update sorting (persistence is handled by useConsultationsSorting)
      setSorting(newSorting);

      // Reset to page 1 when sorting changes
      setCurrentPage(1);
      // The query will automatically refetch due to the queryKey dependency
    },
    [userId, specialtyYear, setSorting]
  );

  const handlePageChange = useCallback(
    async (page: number) => {
      if (!userId || !specialtyYear) return;
      setCurrentPage(page);
      // The query will automatically refetch due to the queryKey dependency
    },
    [userId, specialtyYear]
  );

  const ensureBulkDeleteAllowed = useCallback(async () => {
    if (isCheckingDeleteRateLimit) {
      return false;
    }

    setIsCheckingDeleteRateLimit(true);
    try {
      return await ensureBulkDeleteAllowedRateLimit();
    } finally {
      setIsCheckingDeleteRateLimit(false);
    }
  }, [ensureBulkDeleteAllowedRateLimit, isCheckingDeleteRateLimit]);

  const handleBulkDelete = useCallback(
    async (
      ids: string[]
    ): Promise<{
      deletedIds: string[];
      failedIds: string[];
    }> => {
      const canDelete = await ensureBulkDeleteAllowed();
      if (!canDelete) {
        return { deletedIds: [], failedIds: ids };
      }

      clearRateLimitCache("bulk_delete");

      if (!userId || !specialtyYear) {
        return { deletedIds: [], failedIds: ids };
      }

      const deletedIds: string[] = [];
      const failedIds: string[] = [];

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
          toasts.success(
            `${deletedIds.length} consulta(s) eliminada(s) com sucesso`
          );
        } else if (deletedIds.length > 0 && failedIds.length > 0) {
          toasts.warning(
            "Eliminação parcial",
            `${deletedIds.length} eliminada(s), ${failedIds.length} falharam.`
          );
        } else {
          toasts.error(
            "Erro ao eliminar consultas",
            "Nenhuma consulta foi eliminada."
          );
        }

        // Invalidate consultations queries to refresh data
        if (deletedIds.length > 0) {
          await queryClient.invalidateQueries({
            queryKey: consultationKeys.prefix({ userId, specialtyYear }),
          });
        }

        // Return results for optimistic update handling
        return { deletedIds, failedIds };
      } catch (error) {
        console.error("Unexpected error during bulk delete:", error);
        toasts.error(
          "Erro ao eliminar consultas",
          "Ocorreu um erro inesperado."
        );
        // On unexpected error, mark all as failed
        return { deletedIds: [], failedIds: ids };
      }
    },
    [userId, specialtyYear, queryClient, ensureBulkDeleteAllowed]
  );

  const refreshConsultations = useCallback(async () => {
    if (!userId || !specialtyYear) return;

    // Invalidate the current consultations query to force a refetch
    await queryClient.invalidateQueries({
      queryKey: consultationKeys.list({
        userId,
        specialtyYear,
        page: currentPage,
        pageSize,
        filters,
        sorting,
      }),
    });
  }, [
    userId,
    specialtyYear,
    currentPage,
    pageSize,
    filters,
    sorting,
    queryClient,
  ]);

  const retryLoadConsultations = useCallback(async () => {
    await query.refetch();
  }, [query]);

  // Reactive loading: whenever user/config/filters/sorting change, reset to page 1.
  // With React Query, the query will automatically refetch when queryKey changes.
  useEffect(() => {
    if (!userId) return;
    if (mainTab !== TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS) return;
    if (specialtyYear === undefined) return;

    // Reset to page 1 when dependencies change
    setCurrentPage(1);
    setIsInitialLoad(true);
    hasLoadedConsultationsRef.current = false;
  }, [
    userId,
    specialtyYear,
    mainTab,
    // React to filter content changes, not just reference
    filtersHash,
    sorting.field,
    sorting.order,
  ]);

  return {
    consultations: consultationData,
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
    isCheckingDeleteRateLimit,
  };
}
