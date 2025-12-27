import { Button } from "@/components/ui/button";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { ConsultationFilters } from "@/components/filters/consultation-filters";
import { ConsultationSorting } from "@/components/sorting/consultation-sorting";
import type { FilterUIConfig } from "@/components/filters/types";
import type { SortingConfig } from "@/components/filters/types";
import { ExportMenu } from "@/components/ui/export-menu";
import { ImportButton } from "@/components/ui/import-button";

interface TableToolbarProps {
  isDeleteMode: boolean;
  selectedIds: Set<string>;
  isLoading?: boolean;
  isEmpty?: boolean;
  hasActiveFilters?: boolean;
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
}

export function TableToolbar({
  isDeleteMode,
  selectedIds,
  isLoading = false,
  isEmpty = false,
  hasActiveFilters,
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
}: TableToolbarProps) {
  return (
    <div className="flex items-center justify-between flex-shrink-0 gap-2 pt-2">
      {/* Left side: Primary actions */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {onAddConsultation && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddConsultation}
            disabled={isLoading}
            className="h-8 flex-shrink-0"
          >
            <IconPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Adicionar Consulta</span>
          </Button>
        )}
        {onBulkDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleDeleteMode}
            disabled={isEmpty}
            className="h-8 flex-shrink-0"
          >
            <IconTrash className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isDeleteMode ? "Cancelar" : "Eliminar"}
            </span>
          </Button>
        )}

        {!isDeleteMode && (
          <div className="flex items-center gap-2">
            {onImport && (
              <ImportButton onClick={onImport} disabled={isLoading} />
            )}
            {onExportCsv || onExportExcel ? (
              <ExportMenu
                onExportCsv={onExportCsv}
                onExportExcel={onExportExcel}
                isExportingCsv={isExportingCsv}
                isExportingExcel={isExportingExcel}
                isLoading={isLoading}
              />
            ) : null}
          </div>
        )}

        {/* Delete mode actions */}
        {isDeleteMode && !isEmpty && (
          <>
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              {selectedIds.size} selecionada(s)
            </span>
            {selectedIds.size > 0 && onHandleBulkDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onHandleBulkDelete}
                className="h-8 flex-shrink-0"
              >
                <IconTrash className="h-4 w-4" />
                <span className="hidden sm:inline">Eliminar Selecionadas</span>
              </Button>
            )}
          </>
        )}
      </div>

      {/* Right side: Sort and Filter controls */}
      {!isDeleteMode && uiSortingConfig && uiFilterConfig && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <ConsultationSorting
            sortingConfig={uiSortingConfig}
            isLoading={isLoading || isEmpty}
          />
          <ConsultationFilters
            config={uiFilterConfig}
            isLoading={isLoading || (!hasActiveFilters && isEmpty)}
          />
        </div>
      )}
    </div>
  );
}
