import { ErrorBoundary } from "@/components/error-boundary";
import { MetricsDashboard } from "@/components/metrics/metrics-dashboard";
import { ConsultationsDashboard } from "@/components/consultations/consultations-dashboard";
import { TAB_CONSTANTS } from "@/constants";
import { cn } from "@/utils/utils";
import type { DashboardContentRouterProps } from "./types";

const SCROLLBAR_CLASSES =
  "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-corner]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40";

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
  onRefreshReady,
}: DashboardContentRouterProps) {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="@container/main flex flex-1 flex-col min-h-0">
        <ErrorBoundary>
          {mainTab === TAB_CONSTANTS.MAIN_TABS.METRICS &&
            userId &&
            metricsSubTab && (
              <div
                className={cn(
                  "flex-1",
                  metricsSubTab === TAB_CONSTANTS.METRICS_SUB_TABS.GENERAL
                    ? "flex flex-col min-h-0 overflow-hidden"
                    : "overflow-y-auto",
                  SCROLLBAR_CLASSES
                )}
              >
                <MetricsDashboard
                  userId={userId}
                  specialty={userSpecialty}
                  activeSubTab={metricsSubTab!}
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
                onRefreshReady={onRefreshReady}
              />
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}
