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
import { toast } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";
import { getCurrentUser, checkUserExists, upsertUser } from "@/lib/api/users";
import { getSpecialty } from "@/lib/api/specialties";
import {
  getMGFConsultations,
  deleteConsultation,
  type MGFConsultationsFilters,
  type MGFConsultationsSorting,
} from "@/lib/api/consultations";
import { useEffect, useState, useCallback } from "react";
import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationMGF } from "@/lib/api/consultations";
import { PAGINATION_CONSTANTS } from "@/constants";
import {
  useCachedUserProfile,
  useCachedUserSpecialty,
  useCachedActiveTab,
} from "@/hooks/use-user-cache";
import { AboutModal } from "@/components/modals/about-modal";

const SCROLLBAR_CLASSES =
  "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-corner]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40";

function DashboardContent() {
  const { setOpenMobile, isMobile } = useSidebar();

  // Use cached user data hooks for automatic localStorage sync
  const [userProfile, updateUserProfile] = useCachedUserProfile();
  const [userSpecialty, updateUserSpecialty] = useCachedUserSpecialty();
  const [activeTab, updateActiveTab] = useCachedActiveTab();

  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [editingConsultation, setEditingConsultation] =
    useState<ConsultationMGF | null>(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [consultations, setConsultations] = useState<ConsultationMGF[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(PAGINATION_CONSTANTS.CONSULTATIONS_PAGE_SIZE); // Fixed page size
  // Only show full loading if no cached data exists
  const [isLoading, setIsLoading] = useState(!userProfile);
  const [isLoadingConsultations, setIsLoadingConsultations] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Filter and sort state
  const [filters, setFilters] = useState<MGFConsultationsFilters>({});
  const [sorting, setSorting] = useState<MGFConsultationsSorting>({
    field: "date",
    order: "desc",
  });

  // Parse activeTab to get main tab and specialty year
  const mainTab = activeTab.startsWith("Consultas.")
    ? "Consultas"
    : activeTab.startsWith("Métricas.")
    ? "Métricas"
    : activeTab;
  const activeSpecialtyYear = activeTab.startsWith("Consultas.")
    ? parseInt(activeTab.split(".")[1])
    : 1;

  // Parse Métricas sub-tab
  const metricsSubTab: "Geral" | "Consultas" | "ICPC-2" | null =
    activeTab.startsWith("Métricas.")
      ? (activeTab.split(".")[1] as "Geral" | "Consultas" | "ICPC-2")
      : activeTab === "Métricas"
      ? "Geral" // Default to Geral if just "Métricas"
      : null;

  useEffect(() => {
    let isMounted = true;
    (async () => {
      // First check if user profile exists (clean check, no error logs)
      const userExistsResult = await checkUserExists();
      if (!isMounted) return;

      if (!userExistsResult.success) {
        setIsLoading(false);
        toast.error("Erro", {
          description: userExistsResult.error.userMessage,
        });
        return;
      }

      // If user doesn't exist, create it (OAuth first-time login)
      if (!userExistsResult.data) {
        console.log("User profile not found, creating new user profile...");
        const upsertResult = await upsertUser();
        if (!isMounted) return;

        if (!upsertResult.success) {
          setIsLoading(false);
          toast.error("Erro", {
            description: upsertResult.error.userMessage,
          });
          return;
        }
        console.log("User profile created successfully");
      }

      // Now get the user data (should exist now)
      const userResult = await getCurrentUser();
      if (!isMounted) return;

      if (!userResult.success) {
        setIsLoading(false);
        toast.error("Erro", {
          description: userResult.error.userMessage,
        });
        return;
      }

      // Update state and cache user profile
      updateUserProfile(userResult.data);

      // Check if user has specialty_id
      const hasSpecialty = !!userResult.data.data.specialty_id;
      setShowSpecialtyModal(!hasSpecialty);

      // Load specialty data if user has one
      if (hasSpecialty && userResult.data.data.specialty_id) {
        const specialtyResult = await getSpecialty(
          userResult.data.data.specialty_id
        );

        if (specialtyResult.success) {
          updateUserSpecialty(specialtyResult.data);
        } else {
          toast.error("Erro ao carregar especialidade", {
            description: specialtyResult.error.userMessage,
          });
        }
      }

      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [updateUserProfile, updateUserSpecialty]);

  const handleSpecialtySelected = (specialty: Specialty) => {
    // Modal already updated the user in the database
    // Just store the specialty data and close the modal
    setShowSpecialtyModal(false);
    updateUserSpecialty(specialty);

    // Set default active tab to first year if specialty has multiple years
    if (specialty.years > 1) {
      updateActiveTab("Consultas.1");
    }
  };

  const loadConsultations = useCallback(
    async (
      userId: string,
      specialtyYear?: number,
      page: number = 1,
      currentFilters?: MGFConsultationsFilters,
      currentSorting?: MGFConsultationsSorting
    ) => {
      setIsLoadingConsultations(true);
      const result = await getMGFConsultations(
        userId,
        specialtyYear,
        page,
        pageSize,
        currentFilters,
        currentSorting
      );

      if (result.success) {
        setConsultations(result.data.consultations);
        setTotalCount(result.data.totalCount);
        setCurrentPage(page);
      } else {
        toast.error("Erro ao carregar consultas", {
          description: result.error.userMessage,
        });
      }

      setIsLoadingConsultations(false);
      setIsInitialLoad(false);
    },
    [pageSize]
  );

  const handleRowClick = (consultation: ConsultationMGF) => {
    setEditingConsultation(consultation);
    setShowConsultationModal(true);
  };

  const handleCloseConsultationModal = () => {
    setShowConsultationModal(false);
    setEditingConsultation(null);
  };

  const handleAddConsultation = () => {
    setEditingConsultation(null);
    setShowConsultationModal(true);
  };

  const handleBulkDelete = async (ids: string[]) => {
    const deletedIds: string[] = [];
    const failedIds: string[] = [];

    // Show loading state
    setIsLoadingConsultations(true);

    try {
      // Delete all consultations in parallel for better performance
      const deletePromises = ids.map((id) => deleteConsultation(id));
      const results = await Promise.allSettled(deletePromises);

      // Track successes and failures
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.success) {
          deletedIds.push(ids[index]);
        } else {
          failedIds.push(ids[index]);
          const errorMsg =
            result.status === "rejected"
              ? result.reason
              : !result.value.success
              ? result.value.error
              : "Unknown error";
          console.error(
            `Failed to delete consultation ${ids[index]}:`,
            errorMsg
          );
        }
      });

      // Show appropriate feedback
      if (deletedIds.length > 0 && failedIds.length === 0) {
        toast.success(
          `${deletedIds.length} consulta(s) eliminada(s) com sucesso`
        );
      } else if (deletedIds.length > 0 && failedIds.length > 0) {
        toast.warning("Eliminação parcial", {
          description: `${deletedIds.length} eliminada(s), ${failedIds.length} falharam.`,
        });
      } else {
        toast.error("Erro ao eliminar consultas", {
          description: "Nenhuma consulta foi eliminada.",
        });
      }

      // Always refresh consultations list to reflect changes
      if (userProfile?.data.user_id) {
        await loadConsultations(
          userProfile.data.user_id,
          activeSpecialtyYear,
          currentPage,
          filters,
          sorting
        );
      }
    } catch (error) {
      console.error("Unexpected error during bulk delete:", error);
      toast.error("Erro ao eliminar consultas", {
        description: "Ocorreu um erro inesperado.",
      });

      // Still refresh to show any partial deletions
      if (userProfile?.data.user_id) {
        await loadConsultations(
          userProfile.data.user_id,
          activeSpecialtyYear,
          currentPage,
          filters,
          sorting
        );
      }
    }
  };

  const handlePageChange = async (page: number) => {
    if (userProfile?.data.user_id) {
      await loadConsultations(
        userProfile.data.user_id,
        activeSpecialtyYear,
        page,
        filters,
        sorting
      );
    }
  };

  const handleApplyFilters = async () => {
    if (userProfile?.data.user_id) {
      setIsInitialLoad(true); // Show full spinner when applying filters
      setCurrentPage(1); // Reset to first page when applying filters
      await loadConsultations(
        userProfile.data.user_id,
        activeSpecialtyYear,
        1,
        filters,
        sorting
      );
    }
  };

  const handleSortingChange = async (newSorting: MGFConsultationsSorting) => {
    setSorting(newSorting);
    if (userProfile?.data.user_id) {
      setCurrentPage(1); // Reset to first page when changing sort
      await loadConsultations(
        userProfile.data.user_id,
        activeSpecialtyYear,
        1,
        filters,
        newSorting
      );
    }
  };

  const handleClearFilters = async () => {
    const emptyFilters: MGFConsultationsFilters = {};
    setFilters(emptyFilters);
    if (userProfile?.data.user_id) {
      setIsInitialLoad(true); // Show full spinner when clearing filters
      setCurrentPage(1); // Reset to first page
      await loadConsultations(
        userProfile.data.user_id,
        activeSpecialtyYear,
        1,
        emptyFilters, // Use the empty filters directly
        sorting
      );
    }
  };

  // Load consultations when user profile or specialty year changes
  useEffect(() => {
    if (userProfile?.data.user_id && mainTab === "Consultas") {
      setIsInitialLoad(true); // Show full spinner when changing filters
      setCurrentPage(1); // Reset to first page when changing filters
      // Reset filters when changing specialty year
      setFilters({});
      setSorting({ field: "date", order: "desc" });
      loadConsultations(
        userProfile.data.user_id,
        activeSpecialtyYear,
        1,
        {},
        {
          field: "date",
          order: "desc",
        }
      );
    }
  }, [
    userProfile?.data.user_id,
    activeSpecialtyYear,
    mainTab,
    loadConsultations,
  ]);

  // Show subtle loading state while fetching/creating user profile
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
        onTabChange={(tab) => {
          // Close sidebar on mobile when changing tabs
          if (isMobile) {
            setOpenMobile(false);
          }
          updateActiveTab(tab);
        }}
        onProfileClick={() => {
          // Close sidebar on mobile when opening profile modal
          if (isMobile) {
            setOpenMobile(false);
          }
          setShowProfileModal(true);
        }}
        onNewConsultation={() => {
          // Close sidebar on mobile when opening modal
          if (isMobile) {
            setOpenMobile(false);
          }
          setEditingConsultation(null);
          setShowConsultationModal(true);
        }}
        onAboutClick={() => {
          // Close sidebar on mobile when opening about modal
          if (isMobile) {
            setOpenMobile(false);
          }
          setShowAboutModal(true);
        }}
        className={
          showSpecialtyModal || showConsultationModal
            ? "blur-sm pointer-events-none"
            : ""
        }
      />
      <SidebarInset
        className={cn(
          "h-screen md:h-[calc(100vh-1rem)] overflow-x-hidden overflow-y-auto px-4 pb-4",
          SCROLLBAR_CLASSES,
          showSpecialtyModal || showConsultationModal
            ? "blur-sm pointer-events-none"
            : ""
        )}
      >
        <SiteHeader specialty={userSpecialty} activeTab={activeTab} />
        <div className="flex flex-1 flex-col min-h-0">
          <div className="@container/main flex flex-1 flex-col min-h-0">
            {mainTab === "Métricas" && userProfile && metricsSubTab && (
              <div
                className={cn(
                  "flex-1",
                  metricsSubTab === "Geral"
                    ? "flex flex-col min-h-0 overflow-hidden"
                    : "overflow-y-auto",
                  SCROLLBAR_CLASSES
                )}
              >
                <MetricsDashboard
                  userId={userProfile.data.user_id}
                  specialty={userSpecialty}
                  activeSubTab={metricsSubTab}
                />
              </div>
            )}
            {mainTab === "Consultas" && (
              <div className="flex-1 flex flex-col min-h-0">
                {isLoadingConsultations && isInitialLoad ? (
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
                      consultations={consultations}
                      totalCount={totalCount}
                      currentPage={currentPage}
                      pageSize={pageSize}
                      specialtyCode={userSpecialty?.code}
                      specialtyYear={
                        userSpecialty && userSpecialty.years > 1
                          ? activeSpecialtyYear
                          : undefined
                      }
                      filters={filters}
                      sorting={sorting}
                      isLoading={isLoadingConsultations}
                      onRowClick={handleRowClick}
                      onAddConsultation={handleAddConsultation}
                      onBulkDelete={handleBulkDelete}
                      onPageChange={handlePageChange}
                      onFiltersChange={setFilters}
                      onSortingChange={handleSortingChange}
                      onApplyFilters={handleApplyFilters}
                      onClearFilters={handleClearFilters}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
      {showSpecialtyModal && userProfile && (
        <SpecialtySelectionModal
          userId={userProfile.data.user_id}
          onSpecialtySelected={handleSpecialtySelected}
        />
      )}
      {showProfileModal && userSpecialty && (
        <ProfileModal
          user={userProfile}
          specialty={userSpecialty}
          onClose={() => setShowProfileModal(false)}
          onUserUpdated={updateUserProfile}
        />
      )}
      {showConsultationModal && userProfile && (
        <ConsultationModal
          userId={userProfile.data.user_id}
          specialty={userSpecialty}
          editingConsultation={editingConsultation}
          onClose={handleCloseConsultationModal}
          onConsultationSaved={() => {
            // Refresh consultations list
            if (userProfile?.data.user_id) {
              loadConsultations(
                userProfile.data.user_id,
                activeSpecialtyYear,
                currentPage,
                filters,
                sorting
              );
            }
          }}
        />
      )}
      {showAboutModal && (
        <AboutModal onClose={() => setShowAboutModal(false)} />
      )}
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
