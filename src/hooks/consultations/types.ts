import type { ConsultationsSorting, ConsultationMGF, ConsultationsFilters } from "@/lib/api/consultations";
import type { AppError } from "@/errors";

export interface UseConsultationsParams {
  userId: string | undefined;
  specialtyYear: number | undefined; // Only needed for Consultas tabs
  mainTab: string;
  filters: ConsultationsFilters; // Filters managed by parent via useFilters (read-only)
}

export interface UseConsultationsResult {
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

export interface FormValues {
  [key: string]: string | string[];
}

export interface FieldError {
  key: string;
  message: string;
}

export interface UseFavoritesProps {
  consultations: ConsultationMGF[];
  onFavoriteToggle?: () => void;
}

export interface UseDeleteModeProps {
  consultations: ConsultationMGF[];
  onBulkDelete?: (ids: string[]) => Promise<{
    deletedIds: string[];
    failedIds: string[];
  }>;
}
