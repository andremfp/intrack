import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/theme/mode-toggle";

interface Specialty {
  id: string;
  name: string;
  description?: string;
}

interface SiteHeaderProps {
  specialty?: Specialty | null;
}

export function SiteHeader({ specialty }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        {specialty && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{specialty.name}</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
