import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { MetricsDashboard } from "@/components/metrics/metrics-dashboard";
import { SiteHeader } from "@/components/site-header";
import { SpecialtySelectionModal } from "@/components/modals/specialty-selection-modal";
import { ProfileModal } from "@/components/modals/profile-modal";
import { ConsultationModal } from "@/components/modals/consultation-modal";
import { ConsultationsTable } from "@/components/consultations/consultations-table";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar-context";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { cn } from "@/utils/utils";
import { useEffect, useMemo } from "react";
import type { Specialty } from "@/lib/api/specialties";
import { PAGINATION_CONSTANTS, TAB_CONSTANTS } from "@/constants";
import {
  useCachedUserProfile,
  useCachedUserSpecialty,
  useCachedActiveTab,
} from "@/hooks/use-user-cache";
import { useUserInitialization } from "@/hooks/use-user-initialization";
import { useConsultations } from "@/hooks/use-consultations";
import { useModalState } from "@/hooks/use-modal-state";
import { parseTab } from "@/utils/tab-parsing";
import { AboutModal } from "@/components/modals/about-modal";
import { ErrorBoundary } from "@/components/error-boundary";

const SCROLLBAR_CLASSES =
  "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-corner]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40";

function DashboardContent() {
  const { setOpenMobile, isMobile } = useSidebar();

  const [userProfile, updateUserProfile] = useCachedUserProfile();
  const [userSpecialty, updateUserSpecialty] = useCachedUserSpecialty();
  const [activeTab, updateActiveTab] = useCachedActiveTab();

  // Memoize parsed tab values to avoid recalculation
  const { mainTab, activeSpecialtyYear, metricsSubTab } = useMemo(
    () => parseTab(activeTab),
    [activeTab]
  );

  // Extract userId to avoid repeated checks
  const userId = useMemo(
    () => userProfile?.data.user_id,
    [userProfile?.data.user_id]
  );

  const { isLoading, showSpecialtyModal: initShowSpecialtyModal } =
    useUserInitialization(updateUserProfile, updateUserSpecialty, userProfile);

  const {
    showSpecialtyModal,
    showProfileModal,
    showConsultationModal,
    showAboutModal,
    editingConsultation,
    openConsultationModal,
    openProfileModal,
    openAboutModal,
    closeModal,
    setShowSpecialtyModal,
  } = useModalState();

  const {
    consultations,
    totalCount,
    currentPage,
    filters,
    sorting,
    isLoading: isLoadingConsultations,
    isInitialLoad,
    setFilters: handleFiltersChange,
    handleApplyFilters,
    handleClearFilters,
    handleSortingChange,
    handlePageChange,
    handleBulkDelete,
    refreshConsultations,
  } = useConsultations({
    userId,
    specialtyYear: activeSpecialtyYear,
    mainTab,
  });

  // Consolidated loading states for easier access
  const loadingState = useMemo(
    () => ({
      user: isLoading,
      consultations: isLoadingConsultations,
      isInitialLoad,
    }),
    [isLoading, isLoadingConsultations, isInitialLoad]
  );

  useEffect(() => {
    if (initShowSpecialtyModal && !userSpecialty && !showSpecialtyModal) {
      setShowSpecialtyModal(true);
    } else if (userSpecialty && showSpecialtyModal) {
      setShowSpecialtyModal(false);
    }
  }, [
    initShowSpecialtyModal,
    userSpecialty,
    showSpecialtyModal,
    setShowSpecialtyModal,
  ]);

  const handleSpecialtySelected = (specialty: Specialty) => {
    updateUserSpecialty(specialty);
    setShowSpecialtyModal(false);

    if (specialty.years > 1) {
      updateActiveTab(`${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.1`);
    }
  };

  const handleRowClick = openConsultationModal;
  const handleAddConsultation = () => openConsultationModal(null);
  const handleFavoriteToggle = async () => {
    // Just refresh the current page to reflect the favorite change
    // The backend sorts favorites first, so they'll appear at the top when user navigates to page 1
    await refreshConsultations();
  };

  // Extract sidebar close pattern for mobile
  const withMobileClose = <T extends unknown[]>(
    callback: (...args: T) => void
  ) => {
    return (...args: T) => {
      if (isMobile) setOpenMobile(false);
      callback(...args);
    };
  };

  // Extract blur pattern for modals
  const shouldBlurContent = showSpecialtyModal || showConsultationModal;

  if (loadingState.user) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="flex h-screen w-full items-center justify-center px-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent"></div>
            <p className="text-xs text-muted-foreground">A carregar...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster />
      <AppSidebar
        variant="inset"
        user={userProfile}
        specialty={userSpecialty}
        activeTab={activeTab}
        onTabChange={withMobileClose((tab) => updateActiveTab(tab))}
        onProfileClick={withMobileClose(openProfileModal)}
        onNewConsultation={withMobileClose(handleAddConsultation)}
        onAboutClick={withMobileClose(openAboutModal)}
        className={shouldBlurContent ? "blur-sm pointer-events-none" : ""}
      />
      <SidebarInset
        className={cn(
          "h-screen md:h-[calc(100vh-1rem)] overflow-x-hidden overflow-y-auto px-4 pb-4",
          SCROLLBAR_CLASSES,
          shouldBlurContent ? "blur-sm pointer-events-none" : ""
        )}
      >
        <SiteHeader specialty={userSpecialty} activeTab={activeTab} />
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
                      activeSubTab={metricsSubTab}
                    />
                  </div>
                )}
            </ErrorBoundary>
            <ErrorBoundary>
              {mainTab === TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS && (
                <div className="flex-1 flex flex-col min-h-0">
                  {loadingState.consultations && loadingState.isInitialLoad ? (
                    <div className="flex flex-1 items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-sm text-muted-foreground">
                          A carregar consultas...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col relative min-h-0">
                      <ConsultationsTable
                        data={{
                          consultations,
                          totalCount,
                        }}
                        pagination={{
                          currentPage,
                          pageSize:
                            PAGINATION_CONSTANTS.CONSULTATIONS_PAGE_SIZE,
                          onPageChange: handlePageChange,
                        }}
                        specialty={{
                          code: userSpecialty?.code,
                          year:
                            userSpecialty && userSpecialty.years > 1
                              ? activeSpecialtyYear
                              : undefined,
                        }}
                        filters={{
                          filters,
                          sorting,
                          onFiltersChange: handleFiltersChange,
                          onSortingChange: handleSortingChange,
                          onApplyFilters: handleApplyFilters,
                          onClearFilters: handleClearFilters,
                        }}
                        actions={{
                          onRowClick: handleRowClick,
                          onAddConsultation: handleAddConsultation,
                          onBulkDelete: handleBulkDelete,
                          onFavoriteToggle: handleFavoriteToggle,
                        }}
                        isLoading={loadingState.consultations}
                      />
                    </div>
                  )}
                </div>
              )}
            </ErrorBoundary>
          </div>
        </div>
      </SidebarInset>
      {showSpecialtyModal && userId && (
        <SpecialtySelectionModal
          userId={userId}
          onSpecialtySelected={handleSpecialtySelected}
        />
      )}
      {showProfileModal && userSpecialty && (
        <ProfileModal
          user={userProfile}
          specialty={userSpecialty}
          onClose={closeModal}
          onUserUpdated={updateUserProfile}
        />
      )}
      {showConsultationModal && userId && (
        <ConsultationModal
          userId={userId}
          specialty={userSpecialty}
          editingConsultation={editingConsultation}
          onClose={closeModal}
          onConsultationSaved={refreshConsultations}
        />
      )}
      {showAboutModal && <AboutModal onClose={closeModal} />}
    </ThemeProvider>
  );
}

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 16)",
        } as React.CSSProperties
      }
    >
      <DashboardContent />
    </SidebarProvider>
  );
}
