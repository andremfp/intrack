import { ErrorBoundary } from "@/components/error-boundary";
import { MetricsDashboard } from "@/components/metrics/metrics-dashboard";
import { ConsultationsDashboard } from "@/components/consultations/consultations-dashboard";
import { TAB_CONSTANTS } from "@/constants";
import { cn } from "@/utils/utils";
import type { DashboardContentRouterProps } from "./types";
import { SCROLLBAR_CLASSES } from "@/constants";

/**
 * Component responsible for routing dashboard content based on active tab
 */
export function DashboardContentRouter({
  mainTab,
  userId,
  userSpecialty,
  activeSpecialtyYear,
  metricsSubTab,
  onRowClick,
  onAddConsultation,
  onConsultationsRefreshReady,
  onMetricsRefreshReady,
}: DashboardContentRouterProps) {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="@container/main flex flex-1 flex-col min-h-0">
        <ErrorBoundary>
          {mainTab === TAB_CONSTANTS.MAIN_TABS.METRICS &&
            userId &&
            metricsSubTab && (
              <div className={cn("flex-1", SCROLLBAR_CLASSES)}>
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
        </ErrorBoundary>
      </div>
    </div>
  );
}
