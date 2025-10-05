import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import data from "./data.json";
import { ThemeProvider } from "@/components/theme-provider";
import { getUser } from "@/lib/api/users";
import { useEffect, useState } from "react";

export default function Page() {
  const [sidebarUser, setSidebarUser] = useState({
    name: "Utilizador",
    email: "",
    avatar: "https://api.dicebear.com/9.x/initials/svg",
  });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const profile = await getUser();
        if (!profile || !profile.data) {
          console.error("User not found");
        }

        console.log(profile);
        if (!isMounted) return;
        setSidebarUser({
          name: profile?.data?.display_name ?? "Utilizador",
          email: profile?.data?.email ?? "",
          avatar:
            profile?.avatar || "https://api.dicebear.com/9.x/initials/svg",
        });
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

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
        <AppSidebar variant="inset" user={sidebarUser} />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={data} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
