import { ErrorBoundary } from "@/components/error-boundary";
import { MetricsDashboard } from "@/components/metrics/metrics-dashboard";
import { ConsultationsDashboard } from "@/components/consultations/consultations-dashboard";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { TAB_CONSTANTS } from "@/constants";
import { cn } from "@/utils/utils";
import type { DashboardContentRouterProps } from "./types";
import type { MGFReportKey } from "@/reports/mgf/mgf-reports";

/**
 * Component responsible for routing dashboard content based on active tab
 */
export function DashboardContentRouter({
  mainTab,
  userId,
  userSpecialty,
  activeSpecialtyYear,
  metricsSubTab,
  activeReportKey,
  activeReportSpecialtyCode,
  onRowClick,
  onAddConsultation,
  onConsultationsRefreshReady,
  onMetricsRefreshReady,
  onReportsRefreshReady,
}: DashboardContentRouterProps) {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="@container/main flex flex-1 flex-col min-h-0">
        <ErrorBoundary>
          {mainTab === TAB_CONSTANTS.MAIN_TABS.METRICS &&
            userId &&
            metricsSubTab && (
              <div className={cn("flex-1")}>
                <MetricsDashboard
                  userId={userId}
                  specialty={userSpecialty}
                  activeSubTab={metricsSubTab!}
                  onRefreshReady={onMetricsRefreshReady}
                />
              </div>
            )}
        </ErrorBoundary>
        <ErrorBoundary>
          {mainTab === TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS && userId && (
            <div className="flex-1 flex flex-col min-h-0">
              <ConsultationsDashboard
                userId={userId}
                specialty={userSpecialty}
                specialtyYear={activeSpecialtyYear}
                onRowClick={onRowClick}
                onAddConsultation={onAddConsultation}
                onRefreshReady={onConsultationsRefreshReady}
              />
            </div>
          )}
          {mainTab === TAB_CONSTANTS.MAIN_TABS.REPORTS &&
            userId &&
            userSpecialty &&
            activeReportKey &&
            activeReportSpecialtyCode === userSpecialty.code && (
              <div className="flex-1 flex flex-col min-h-0">
                <ReportsDashboard
                  userId={userId}
                  specialtyCode={userSpecialty.code}
                  reportKey={activeReportKey as MGFReportKey}
                  onRefreshReady={onReportsRefreshReady}
                />
              </div>
            )}
        </ErrorBoundary>
      </div>
    </div>
  );
}
