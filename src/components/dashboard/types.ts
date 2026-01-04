import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationMGF } from "@/lib/api/consultations";
import type { MetricsSubTab } from "@/utils/tab-parsing";
import type { MGFReportKey } from "@/reports/mgf/mgf-reports";

export interface DashboardContentRouterProps {
  mainTab: string;
  userId: string;
  userSpecialty: Specialty | null;
  activeSpecialtyYear?: number;
  metricsSubTab: MetricsSubTab | null;
  activeReportKey?: MGFReportKey;
  activeReportSpecialtyCode?: string;
  onRowClick: (consultation: ConsultationMGF) => void;
  onAddConsultation: () => void;
  onConsultationsRefreshReady: (refresh: () => Promise<void>) => void;
  onMetricsRefreshReady?: (refresh: () => Promise<void>) => void;
  onReportsRefreshReady?: (refresh: () => Promise<void>) => void;
}

