
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/theme/mode-toggle";
import type { Specialty } from "@/lib/api/specialties";
import type { TabType } from "@/constants";

interface SiteHeaderProps {
  specialty?: Specialty | null;
  activeTab?: TabType;
}

export function SiteHeader({ specialty, activeTab }: SiteHeaderProps) {
  // Extract year from active tab if it's a Consultas sub-tab
  const getSpecialtyDisplay = () => {
    if (!specialty) return null;

    // Check if activeTab is a consultation year tab (e.g., "Consultas.1")
    if (activeTab && activeTab.startsWith("Consultas.")) {
      const yearMatch = activeTab.match(/Consultas\.(\d+)$/);
      if (yearMatch) {
        const year = yearMatch[1];
        return `${specialty.name} - ${specialty.code.toUpperCase()}.${year}`;
      }
    }

    return specialty.name;
  };

  const specialtyDisplay = getSpecialtyDisplay();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 lg:gap-2">
        <SidebarTrigger className="-ml-1" />

        {specialtyDisplay && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{specialtyDisplay}</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
