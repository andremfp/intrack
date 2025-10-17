import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SpecialtySelectionModal } from "@/components/modals/specialty-selection-modal";
import { ProfileModal } from "@/components/modals/profile-modal";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import data from "./data.json";
import { ThemeProvider } from "@/components/theme-provider";
import { getCurrentUser, checkUserExists, upsertUser } from "@/lib/api/users";
import { getSpecialty } from "@/lib/api/specialties";
import { useEffect, useState } from "react";
import type { UserData } from "@/lib/api/users";
import type { Specialty } from "@/lib/api/specialties";

type TabType = "Resumo" | "Consultas";

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabType>("Resumo");
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [userSpecialty, setUserSpecialty] = useState<Specialty | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

      setUserProfile(userResult.data);

      // Check if user has specialty_id
      const hasSpecialty = !!userResult.data.data.specialty_id;
      setShowSpecialtyModal(!hasSpecialty);

      // Load specialty data if user has one
      if (hasSpecialty && userResult.data.data.specialty_id) {
        const specialtyResult = await getSpecialty(
          userResult.data.data.specialty_id
        );

        if (specialtyResult.success) {
          setUserSpecialty(specialtyResult.data);
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
  }, []);

  const handleSpecialtySelected = (specialty: Specialty) => {
    // Modal already updated the user in the database
    // Just store the specialty data and close the modal
    setShowSpecialtyModal(false);

    setUserSpecialty(specialty);
  };

  // Show loading state while fetching/creating user profile
  if (isLoading) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">A carregar...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster />
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar
          variant="inset"
          user={userProfile}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onProfileClick={() => setShowProfileModal(true)}
        />
        <SidebarInset
          className={showSpecialtyModal ? "blur-sm pointer-events-none" : ""}
        >
          <SiteHeader specialty={userSpecialty} />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {activeTab === "Resumo" && (
                  <>
                    <SectionCards />
                    <div className="px-4 lg:px-6">
                      <ChartAreaInteractive />
                    </div>
                    <DataTable data={data} />
                  </>
                )}
                {activeTab === "Consultas" && (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">
                      Consultas content coming soon...
                    </p>
                  </div>
                )}
              </div>
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
            onUserUpdated={(updatedUser) => setUserProfile(updatedUser)}
          />
        )}
      </SidebarProvider>
    </ThemeProvider>
  );
}
