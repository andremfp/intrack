import * as React from "react";
import {
  IconTable,
  IconDashboard,
  IconInnerShadowTop,
} from "@tabler/icons-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { UserData } from "@/lib/api/users";
import type { Specialty } from "@/lib/api/specialties";
import type { TabType } from "@/constants";

export function AppSidebar({
  user,
  specialty,
  activeTab,
  onTabChange,
  onProfileClick,
  onNewConsultation,
  onAboutClick,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: UserData | null;
  specialty: Specialty | null;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onProfileClick: () => void;
  onNewConsultation?: () => void;
  onAboutClick: () => void;
}) {
  if (!user) return null;

  // Build nav items dynamically based on specialty
  const navMain = [
    {
      title: "Métricas",
      url: "#",
      icon: IconDashboard,
      items: [
        {
          title: "Geral",
          url: "#",
        },
        {
          title: "Consultas",
          url: "#",
        },
        {
          title: "ICPC-2",
          url: "#",
        },
      ],
    },
    {
      title: "Consultas",
      url: "#",
      icon: IconTable,
      items:
        specialty && specialty.years > 1
          ? Array.from({ length: specialty.years }, (_, i) => ({
              title: `${specialty.code.toUpperCase()}.${i + 1}`,
              url: "#",
            }))
          : undefined,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarContent>
              <div className="flex items-center gap-2">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">InTrack</span>
              </div>
            </SidebarContent>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navMain}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onNewConsultation={onNewConsultation}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={user}
          onProfileClick={onProfileClick}
          onAboutClick={onAboutClick}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
