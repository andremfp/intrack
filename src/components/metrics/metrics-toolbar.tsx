import * as React from "react";
import { Button } from "@/components/ui/button";
import { ConsultationFilters } from "@/components/filters/consultation-filters";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Download, Loader2 } from "lucide-react";
import type { FilterUIConfig } from "@/components/filters/types";

interface MetricsToolbarProps {
  filterConfig: FilterUIConfig;
  hasActiveFilters?: boolean;
  totalConsultations: number;
  onExportExcel?: () => void;
  isExportingExcel?: boolean;
}

/**
 * Shared toolbar for metrics tabs.
 * Renders filter badges/button and places the export button after the filter button.
 */
export function MetricsToolbar({
  filterConfig,
  hasActiveFilters = false,
  totalConsultations,
  onExportExcel,
  isExportingExcel = false,
}: MetricsToolbarProps) {
  const isLoading = !hasActiveFilters && totalConsultations === 0;
  const [open, setOpen] = React.useState(false);

  const handleExportExcel = () => {
    if (onExportExcel) {
      onExportExcel();
      setOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex-1 min-w-0">
        <ConsultationFilters config={filterConfig} isLoading={isLoading} />
      </div>
      {onExportExcel && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isExportingExcel}
              className="h-8"
            >
              {isExportingExcel ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">A exportar...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="end">
            <div className="space-y-1">
              <button
                onClick={handleExportExcel}
                disabled={isExportingExcel}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExportingExcel ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />A exportar
                    Excel...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Exportar Excel
                  </>
                )}
              </button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
