import type { Specialty } from "@/lib/api/specialties";
import type {
  ConsultationsFilters,
  ConsultationMetrics,
} from "@/lib/api/consultations";
import type { AppError } from "@/errors";

export interface UseMetricsDataParams {
  userId: string;
  specialty: Specialty | null;
  filters: ConsultationsFilters;
  /** Filters that are applied to the data fetch but don't show as "active" in the UI */
  implicitFilters?: Partial<ConsultationsFilters>;
  /** Type to exclude from metrics (e.g., 'AM' for general tab) */
  excludeType?: string;
}

export interface UseMetricsDataReturn {
  metrics: ConsultationMetrics | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: AppError | null;
  loadMetrics: (
    filtersOverride?: Partial<ConsultationsFilters>
  ) => Promise<void>;
  retryLoadMetrics: () => Promise<void>;
}
