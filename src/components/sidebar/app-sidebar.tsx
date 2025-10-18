import * as React from "react";
import {
  IconTable,
  IconDashboard,
  IconInnerShadowTop,
  IconSearch,
} from "@tabler/icons-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { UserData } from "@/lib/api/users";
import type { TabType } from "@/constants";

const data = {
  navMain: [
    {
      title: "Resumo",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Consultas",
      url: "#",
      icon: IconTable,
    },
  ],
  navSecondary: [
    {
      title: "Procurar",
      url: "#",
      icon: IconSearch,
    },
  ],
};

export function AppSidebar({
  user,
  activeTab,
  onTabChange,
  onProfileClick,
  onNewConsultation,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: UserData | null;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onProfileClick: () => void;
  onNewConsultation?: () => void;
}) {
  if (!user) return null;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">InTrack</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={data.navMain}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onNewConsultation={onNewConsultation}
        />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onProfileClick={onProfileClick} />
      </SidebarFooter>
    </Sidebar>
  );
}
