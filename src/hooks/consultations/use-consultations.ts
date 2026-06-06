import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { toasts } from "@/utils/toasts";
import type { AppError } from "@/errors";
import { ErrorMessages } from "@/errors";
import {
  getMGFConsultations,
  bulkDeleteConsultations,
  type ConsultationsSorting,
  type ConsultationMGF,
} from "@/lib/api/consultations";
import type { ConsultationsFilters } from "@/lib/api/consultations";
import { PAGINATION_CONSTANTS, TAB_CONSTANTS } from "@/constants";
import { mergeFilters } from "@/hooks/filters/helpers";
import { useConsultationsSorting } from "@/hooks/consultations/use-consultations-sorting";
import { consultations as consultationKeys } from "@/lib/query/keys";

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
  isBulkDeleting: boolean;
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
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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

  const handleBulkDelete = useCallback(
    async (
      ids: string[]
    ): Promise<{
      deletedIds: string[];
      failedIds: string[];
    }> => {
      if (isBulkDeleting) {
        return { deletedIds: [], failedIds: ids };
      }

      if (!userId || !specialtyYear) {
        return { deletedIds: [], failedIds: ids };
      }

      setIsBulkDeleting(true);
      try {
        const result = await bulkDeleteConsultations(ids);

        if (!result.success) {
          const isRateLimit =
            result.error.userMessage === ErrorMessages.TOO_MANY_REQUESTS;
          if (isRateLimit) {
            toasts.error("Erro", ErrorMessages.TOO_MANY_REQUESTS);
          } else {
            toasts.error(
              "Erro ao eliminar consultas",
              "Ocorreu um erro inesperado."
            );
          }
          return { deletedIds: [], failedIds: ids };
        }

        toasts.success(`${ids.length} consulta(s) eliminada(s) com sucesso`);

        await queryClient.invalidateQueries({
          queryKey: consultationKeys.prefix({ userId, specialtyYear }),
        });

        return { deletedIds: ids, failedIds: [] };
      } catch (error) {
        console.error("Unexpected error during bulk delete:", error);
        toasts.error("Erro ao eliminar consultas", "Ocorreu um erro inesperado.");
        return { deletedIds: [], failedIds: ids };
      } finally {
        setIsBulkDeleting(false);
      }
    },
    [userId, specialtyYear, queryClient, isBulkDeleting]
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

    // Reset to page 1 when the query inputs change. React Query refetches via
    // its queryKey; this effect only resets local pagination/loading state plus
    // a ref, so it is a legitimate effect — a render-time rewrite would move the
    // ref mutation into render and violate react-hooks/refs.
    /* eslint-disable react-hooks/set-state-in-effect */
    setCurrentPage(1);
    setIsInitialLoad(true);
    /* eslint-enable react-hooks/set-state-in-effect */
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
    isBulkDeleting,
  };
}
