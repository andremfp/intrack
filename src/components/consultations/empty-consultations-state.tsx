import { TableToolbar } from "./table-toolbar";
import type { FilterUIConfig } from "@/components/filters/types";
import type { SortingConfig } from "@/components/filters/types";

interface EmptyConsultationsStateProps {
  specialtyCode: string;
  specialtyYear?: number;
  hasActiveFilters: boolean;
  isDeleteMode: boolean;
  selectedIds: Set<string>;
  isLoading?: boolean;
  onAddConsultation?: () => void;
  onBulkDelete?: (
    ids: string[]
  ) => Promise<{ deletedIds: string[]; failedIds: string[] }>;
  onToggleDeleteMode?: () => void;
  onHandleBulkDelete?: () => void;
  uiFilterConfig: FilterUIConfig | null;
  uiSortingConfig: SortingConfig | null;
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  isExportingCsv?: boolean;
  isExportingExcel?: boolean;
  onImport?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function EmptyConsultationsState({
  specialtyCode,
  specialtyYear,
  hasActiveFilters,
  isDeleteMode,
  selectedIds,
  isLoading,
  onAddConsultation,
  onBulkDelete,
  onToggleDeleteMode,
  onHandleBulkDelete,
  uiFilterConfig,
  uiSortingConfig,
  onExportCsv,
  onExportExcel,
  isExportingCsv,
  isExportingExcel,
  onImport,
  onRefresh,
  isRefreshing,
}: EmptyConsultationsStateProps) {
  const yearText = specialtyYear
    ? ` ${specialtyCode.toUpperCase()}.${specialtyYear}`
    : "";

  return (
    <div className="flex flex-col h-full gap-2">
      <TableToolbar
        isDeleteMode={isDeleteMode}
        selectedIds={selectedIds}
        isLoading={isLoading}
        isEmpty={true}
        hasActiveFilters={hasActiveFilters}
        onAddConsultation={onAddConsultation}
        onBulkDelete={onBulkDelete}
        onToggleDeleteMode={onToggleDeleteMode}
        onHandleBulkDelete={onHandleBulkDelete}
        uiFilterConfig={uiFilterConfig}
        uiSortingConfig={uiSortingConfig}
        onExportCsv={onExportCsv}
        onExportExcel={onExportExcel}
        isExportingCsv={isExportingCsv}
        isExportingExcel={isExportingExcel}
        onImport={onImport}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Empty state */}
      <div className="flex flex-1 items-center justify-center py-12 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">
            Sem dados disponíveis para{yearText}.
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Ajuste os filtros ou adicione novas consultas para ver as métricas.
          </p>
        </div>
      </div>
    </div>
  );
}
