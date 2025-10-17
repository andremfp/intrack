import * as React from "react";
import {
  IconTable,
  IconDashboard,
  IconInnerShadowTop,
  IconSearch,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
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

type TabType = "Resumo" | "Consultas";

export function AppSidebar({
  user,
  activeTab,
  onTabChange,
  onProfileClick,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: UserData | null;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onProfileClick: () => void;
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
        />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onProfileClick={onProfileClick} />
      </SidebarFooter>
    </Sidebar>
  );
}
