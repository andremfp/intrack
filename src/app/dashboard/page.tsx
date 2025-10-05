import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SpecialtySelectionModal } from "@/components/specialty-selection-modal";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import data from "./data.json";
import { ThemeProvider } from "@/components/theme-provider";
import { getUser, upsertUser } from "@/lib/api/users";
import { useEffect, useState } from "react";

type TabType = "Resumo" | "Consultas";

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabType>("Resumo");
  const [sidebarUser, setSidebarUser] = useState({
    name: "Utilizador",
    email: "",
    avatar: "https://api.dicebear.com/9.x/initials/svg",
  });
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    data: {
      user_id: string;
      display_name?: string;
      email?: string;
      specialty_id?: string | null;
    };
    avatar?: string;
  } | null>(null);
  const [userSpecialty, setUserSpecialty] = useState<{
    id: string;
    name: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const profile = await getUser();
        if (!profile || !profile.data) {
          console.error("User not found - attempting to create user profile");
          try {
            // Try to create the user profile if it doesn't exist
            await upsertUser();
            // Retry getting the user
            const retryProfile = await getUser();
            if (!retryProfile || !retryProfile.data) {
              console.error("Still no user found after upsert attempt");
              return;
            }
            // Use the retry profile
            const finalProfile = retryProfile;
            if (!isMounted) return;

            setUserProfile(finalProfile);
            setSidebarUser({
              name: finalProfile?.data?.display_name ?? "Utilizador",
              email: finalProfile?.data?.email ?? "",
              avatar:
                finalProfile?.avatar ||
                "https://api.dicebear.com/9.x/initials/svg",
            });

            // Check if user has specialty_id
            const hasSpecialty = !!finalProfile.data.specialty_id;
            setShowSpecialtyModal(!hasSpecialty);
            return;
          } catch (upsertError) {
            console.error("Failed to create user profile:", upsertError);
            return;
          }
        }

        console.log(profile);
        if (!isMounted) return;

        setUserProfile(profile);
        setSidebarUser({
          name: profile?.data?.display_name ?? "Utilizador",
          email: profile?.data?.email ?? "",
          avatar:
            profile?.avatar || "https://api.dicebear.com/9.x/initials/svg",
        });

        // Check if user has specialty_id
        const hasSpecialty = !!profile.data.specialty_id;
        setShowSpecialtyModal(!hasSpecialty);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSpecialtySelected = (specialty: {
    id: string;
    name: string;
    description?: string;
  }) => {
    setShowSpecialtyModal(false);
    setUserSpecialty(specialty);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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
          user={sidebarUser}
          activeTab={activeTab}
          onTabChange={setActiveTab}
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
      </SidebarProvider>
    </ThemeProvider>
  );
}
