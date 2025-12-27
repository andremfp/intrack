import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { ModalManager } from "@/components/modals/modal-manager";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar-context";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { cn } from "@/utils/utils";
import { useMemo, useEffect } from "react";
import type { Specialty } from "@/lib/api/specialties";
import { SCROLLBAR_CLASSES, TAB_CONSTANTS } from "@/constants";
import { useCachedUserProfile } from "@/hooks/user/use-cached-user-profile";
import { useCachedUserSpecialty } from "@/hooks/user/use-cached-user-specialty";
import { useCachedActiveTab } from "@/hooks/user/use-cached-active-tab";
import { parseTab } from "@/utils/tab-parsing";
import { DashboardContentRouter } from "@/components/dashboard/dashboard-content-router";
import { useDashboardModals } from "@/hooks/modals/use-dashboard-modals";
import { useUserInitialization } from "@/hooks/user/use-user-initialization";
import { getSpecialty } from "@/lib/api/specialties";
import { toasts } from "@/utils/toasts";

function DashboardContent() {
  const { setOpenMobile } = useSidebar();

  const [userProfile, updateUserProfile] = useCachedUserProfile();
  const [userSpecialty, updateUserSpecialty] = useCachedUserSpecialty();
  const [activeTab, updateActiveTab] = useCachedActiveTab();

  // Memoize parsed tab values to avoid recalculation
  const {
    mainTab,
    activeSpecialtyYear,
    metricsSubTab,
    activeReportKey,
    activeReportSpecialtyCode,
  } = useMemo(() => parseTab(activeTab), [activeTab]);

  // Extract userId to avoid repeated checks
  const userId = useMemo(
    () => userProfile?.data.user_id,
    [userProfile?.data.user_id]
  );

  // Handle user initialization directly here
  const { isLoading, showSpecialtyModal: initShowSpecialtyModal } =
    useUserInitialization(updateUserProfile, updateUserSpecialty, userProfile);

  const {
    showSpecialtyModal,
    showProfileModal,
    showConsultationModal,
    showAboutModal,
    editingConsultation,
    specialtyYear,
    handleSpecialtySelected: baseHandleSpecialtySelected,
    handleRowClick,
    handleAddConsultation,
    handleConsultationSaved,
    openProfileModal,
    openAboutModal,
    closeModal,
    withMobileClose: baseWithMobileClose,
    refreshConsultationsRef,
    refreshMetricsRef,
    updateInitShowSpecialtyModal,
  } = useDashboardModals(userSpecialty, setOpenMobile);

  // Sync initialization state with modals hook
  useEffect(() => {
    updateInitShowSpecialtyModal(initShowSpecialtyModal);
  }, [initShowSpecialtyModal, updateInitShowSpecialtyModal]);

  // Recover specialty details if the ID exists in the user profile but the cached specialty is missing
  useEffect(() => {
    const specialtyId = userProfile?.data.specialty_id;

    if (!specialtyId || userSpecialty) {
      return;
    }

    (async () => {
      const result = await getSpecialty(specialtyId);
      if (result.success) {
        updateUserSpecialty(result.data);
      } else {
        toasts.apiError(result.error, "Erro ao carregar especialidade");
      }
    })();
  }, [userProfile?.data.specialty_id, userSpecialty, updateUserSpecialty]);

  // Enhanced handlers that include parent component logic
  const handleSpecialtySelected = (specialty: Specialty) => {
    updateUserSpecialty(specialty);
    baseHandleSpecialtySelected();

    if (specialty.years > 1) {
      updateActiveTab(`${TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS}.1`);
    }
  };

  if (isLoading) {
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
        onTabChange={baseWithMobileClose((tab) => updateActiveTab(tab))}
        onProfileClick={baseWithMobileClose(openProfileModal)}
        onNewConsultation={baseWithMobileClose(handleAddConsultation)}
        onAboutClick={baseWithMobileClose(openAboutModal)}
        className={isLoading ? "blur-sm pointer-events-none" : ""}
      />
      <SidebarInset
        className={cn(
          "h-screen md:h-[calc(100vh-1rem)] overflow-x-hidden overflow-y-auto px-4 pb-4",
          SCROLLBAR_CLASSES,
          isLoading && "blur-sm pointer-events-none"
        )}
      >
        <SiteHeader specialty={userSpecialty} activeTab={activeTab} />
        <DashboardContentRouter
          mainTab={mainTab}
          userId={userId!}
          userSpecialty={userSpecialty}
          activeSpecialtyYear={activeSpecialtyYear}
          metricsSubTab={metricsSubTab}
          activeReportKey={activeReportKey}
          activeReportSpecialtyCode={activeReportSpecialtyCode}
          onRowClick={handleRowClick}
          onAddConsultation={() => handleAddConsultation(activeSpecialtyYear)}
          onConsultationsRefreshReady={(refresh) => {
            refreshConsultationsRef.current = refresh;
          }}
          onMetricsRefreshReady={(refresh) => {
            refreshMetricsRef.current = refresh;
          }}
        />
      </SidebarInset>
      <ModalManager
        userProfile={userProfile}
        userSpecialty={userSpecialty}
        showSpecialtyModal={showSpecialtyModal}
        showProfileModal={showProfileModal}
        showConsultationModal={showConsultationModal}
        showAboutModal={showAboutModal}
        editingConsultation={editingConsultation}
        specialtyYear={specialtyYear}
        userId={userId!}
        onSpecialtySelected={handleSpecialtySelected}
        onProfileClose={closeModal}
        onProfileUserUpdated={updateUserProfile}
        onConsultationClose={closeModal}
        onConsultationSaved={handleConsultationSaved}
        onAboutClose={closeModal}
      />
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
