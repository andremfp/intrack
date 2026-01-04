import { ConsultationFilters } from "@/components/filters/consultation-filters";
import type { FilterUIConfig } from "@/components/filters/types";
import { ExportMenu } from "@/components/ui/export-menu";
import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";

interface MetricsToolbarProps {
  filterConfig: FilterUIConfig;
  hasActiveFilters?: boolean;
  totalConsultations: number;
  onExportExcel?: () => void;
  isExportingExcel?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
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
  onRefresh,
  isRefreshing = false,
}: MetricsToolbarProps) {
  const isLoading = !hasActiveFilters && totalConsultations === 0;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex-1 min-w-0">
        <ConsultationFilters config={filterConfig} isLoading={isLoading} />
      </div>
      {onExportExcel && (
        <ExportMenu
          onExportExcel={onExportExcel}
          isExportingExcel={isExportingExcel}
          isLoading={isLoading}
        />
      )}
      {onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing || isLoading}
          className="h-8"
          title="Atualizar métricas"
        >
          <IconRefresh
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      )}
    </div>
  );
}
