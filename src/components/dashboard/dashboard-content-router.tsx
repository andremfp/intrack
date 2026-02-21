import { lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { TAB_CONSTANTS } from "@/constants";
import { cn } from "@/utils/utils";
import type { DashboardContentRouterProps } from "./types";
import type { MGFReportKey } from "@/reports/mgf/mgf-reports";

// Dashboard tab components are lazy-loaded so each is emitted as its own chunk
// and only fetched when the user navigates to that tab.
const MetricsDashboard = lazy(() =>
  import("@/components/metrics/metrics-dashboard").then((m) => ({
    default: m.MetricsDashboard,
  })),
);
const ConsultationsDashboard = lazy(() =>
  import("@/components/consultations/consultations-dashboard").then((m) => ({
    default: m.ConsultationsDashboard,
  })),
);
const ReportsDashboard = lazy(() =>
  import("@/components/reports/reports-dashboard").then((m) => ({
    default: m.ReportsDashboard,
  })),
);

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
                <Suspense fallback={<div>A carregar...</div>}>
                  <MetricsDashboard
                    userId={userId}
                    specialty={userSpecialty}
                    activeSubTab={metricsSubTab!}
                    onRefreshReady={onMetricsRefreshReady}
                  />
                </Suspense>
              </div>
            )}
        </ErrorBoundary>
        <ErrorBoundary>
          {mainTab === TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS && userId && (
            <div className="flex-1 flex flex-col min-h-0">
              <Suspense fallback={<div>A carregar...</div>}>
                <ConsultationsDashboard
                  userId={userId}
                  specialty={userSpecialty}
                  specialtyYear={activeSpecialtyYear}
                  onRowClick={onRowClick}
                  onAddConsultation={onAddConsultation}
                  onRefreshReady={onConsultationsRefreshReady}
                />
              </Suspense>
            </div>
          )}
          {mainTab === TAB_CONSTANTS.MAIN_TABS.REPORTS &&
            userId &&
            userSpecialty &&
            activeReportKey &&
            activeReportSpecialtyCode === userSpecialty.code && (
              <div className="flex-1 flex flex-col min-h-0">
                <Suspense fallback={<div>A carregar...</div>}>
                  <ReportsDashboard
                    userId={userId}
                    specialtyCode={userSpecialty.code}
                    reportKey={activeReportKey as MGFReportKey}
                    onRefreshReady={onReportsRefreshReady}
                  />
                </Suspense>
              </div>
            )}
        </ErrorBoundary>
      </div>
    </div>
  );
}
