import {
  IconCirclePlusFilled,
  IconChevronRight,
  type Icon,
} from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { TabType } from "@/constants";

export function NavMain({
  items,
  activeTab,
  onTabChange,
  onNewConsultation,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    items?: {
      title: string;
      displayName?: string;
      url: string;
    }[];
  }[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onNewConsultation?: () => void;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Nova Consulta"
              onClick={() => onNewConsultation?.()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Nova Consulta</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            // Check if any sub-item is active
            const isSubItemActive =
              item.items &&
              item.items.some((subItem) => {
                // For specialty year sub-items (like "MGF.1"), match the pattern
                const yearMatch = subItem.title.match(/\.(\d+)$/);
                if (yearMatch) {
                  const yearNumber = yearMatch[1];
                  return activeTab === `${item.title}.${yearNumber}`;
                }
                // For other sub-items (like Métricas sub-items), match directly
                return activeTab === `${item.title}.${subItem.title}`;
              });
            const isActive = activeTab === item.title || isSubItemActive;

            if (item.items && item.items.length > 0) {
              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => {
                          // Extract year number from title like "MGF.1" -> "1"
                          const yearMatch = subItem.title.match(/\.(\d+)$/);
                          // Determine the sub-item tab format
                          const subItemTab = yearMatch
                            ? `${item.title}.${yearMatch[1]}`
                            : `${item.title}.${subItem.title}`;
                          const isSubActive = activeTab === subItemTab;
                          const displayLabel =
                            subItem.displayName || subItem.title;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                isActive={isSubActive}
                                onClick={() => onTabChange(subItemTab)}
                              >
                                <span>{displayLabel}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  onClick={() => onTabChange(item.title as TabType)}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
