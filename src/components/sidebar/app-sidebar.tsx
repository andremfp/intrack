import * as React from "react";
import {
  IconTable,
  IconDashboard,
  IconInnerShadowTop,
  IconReport,
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
import { TAB_CONSTANTS, getConsultationsTabDisplayName } from "@/constants";
import type { TabType } from "@/constants";
import { getReportsForSpecialty, getReportTabKey } from "@/reports/helpers";

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

  const reportItems =
    specialty && specialty.code
      ? getReportsForSpecialty(specialty.code).map((report) => ({
          title: report.key,
          displayName: report.label,
          url: "#",
          tab: getReportTabKey(specialty.code, report.key),
        }))
      : [];

  // Build nav items dynamically based on specialty
  const navMain = [
    {
      title: TAB_CONSTANTS.MAIN_TABS.METRICS,
      url: "#",
      icon: IconDashboard,
      items: [
        {
          title: TAB_CONSTANTS.METRICS_SUB_TABS.GENERAL,
          displayName: TAB_CONSTANTS.METRICS_SUB_TABS.GENERAL,
          url: "#",
        },
        {
          title: TAB_CONSTANTS.METRICS_SUB_TABS.CONSULTATIONS,
          displayName: getConsultationsTabDisplayName(specialty?.code),
          url: "#",
        },
      ],
    },
    ...(reportItems.length
      ? [
          {
            title: TAB_CONSTANTS.MAIN_TABS.REPORTS,
            url: "#",
            icon: IconReport,
            items: reportItems,
          },
        ]
      : []),
    {
      title: TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS,
      url: "#",
      icon: IconTable,
      items:
        specialty && specialty.years > 1
          ? Array.from({ length: specialty.years }, (_, i) => ({
              title: `${specialty.code.toUpperCase()}.${i + 1}`,
              url: "#",
            }))
          : [
              {
                title: TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS,
                url: "#",
              },
            ],
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
