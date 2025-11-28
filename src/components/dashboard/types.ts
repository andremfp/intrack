import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationMGF } from "@/lib/api/consultations";
import type { MetricsSubTab } from "@/utils/tab-parsing";

export interface DashboardContentRouterProps {
  mainTab: string;
  userId: string;
  userSpecialty: Specialty | null;
  activeSpecialtyYear?: number;
  metricsSubTab: MetricsSubTab | null;
  onRowClick: (consultation: ConsultationMGF) => void;
  onAddConsultation: () => void;
  onConsultationsRefreshReady: (refresh: () => Promise<void>) => void;
  onMetricsRefreshReady?: (refresh: () => Promise<void>) => void;
}

