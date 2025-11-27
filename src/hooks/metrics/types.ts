import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationsFilters, ConsultationMetrics } from "@/lib/api/consultations";
import type { AppError } from "@/errors";

export interface UseMetricsDataParams {
  userId: string;
  specialty: Specialty | null;
  filters: ConsultationsFilters;
}

export interface UseMetricsDataReturn {
  metrics: ConsultationMetrics | null;
  isLoading: boolean;
  error: AppError | null;
  loadMetrics: (filtersOverride?: Partial<ConsultationsFilters>) => Promise<void>;
  retryLoadMetrics: () => Promise<void>;
}
