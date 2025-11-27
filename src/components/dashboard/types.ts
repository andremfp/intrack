import type { Specialty } from "@/lib/api/specialties";
import type { UserData } from "@/lib/api/users";
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
  onRefreshReady: (refresh: () => Promise<void>) => void;
}

