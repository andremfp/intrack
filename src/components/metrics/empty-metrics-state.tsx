import { ConsultationFilters } from "@/components/filters/consultation-filters";
import type { FilterUIConfig } from "@/components/filters/types";

interface EmptyMetricsStateProps {
  filterConfig: FilterUIConfig;
  disableFilters: boolean;
}

export function EmptyMetricsState({
  filterConfig,
  disableFilters,
}: EmptyMetricsStateProps) {
  return (
    <div className="flex flex-col h-full min-h-0 gap-3 pt-4 px-1">
      {/* Shared filters toolbar */}
      <ConsultationFilters
        config={filterConfig}
        // Disable filters only when there is no data in the database
        // and there are no active filters. If filters are active but metrics
        // are empty due to them, keep the filters enabled so the user can
        // clear or adjust filters.
        isLoading={disableFilters}
      />

      {/* Empty state content */}
      <div className="flex flex-1 items-center justify-center py-12 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Sem dados disponíveis.</p>
          <p className="text-muted-foreground text-sm mt-2">
            Ajuste os filtros ou adicione novas consultas para ver as métricas.
          </p>
        </div>
      </div>
    </div>
  );
}
