import { Button } from "@/components/ui/button";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { ConsultationFilters } from "@/components/filters/consultation-filters";
import { ConsultationSorting } from "@/components/filters/consultation-sorting";
import type { FilterUIConfig } from "@/components/filters/types";
import type { SortingConfig } from "@/components/filters/types";

interface TableToolbarProps {
  isDeleteMode: boolean;
  selectedIds: Set<string>;
  isLoading?: boolean;
  isEmpty?: boolean;
  onAddConsultation?: () => void;
  onBulkDelete?: (
    ids: string[]
  ) => Promise<{ deletedIds: string[]; failedIds: string[] }>;
  onToggleDeleteMode?: () => void;
  onHandleBulkDelete?: () => void;
  uiFilterConfig: FilterUIConfig | null;
  uiSortingConfig: SortingConfig | null;
}

export function TableToolbar({
  isDeleteMode,
  selectedIds,
  isLoading = false,
  isEmpty = false,
  onAddConsultation,
  onBulkDelete,
  onToggleDeleteMode,
  onHandleBulkDelete,
  uiFilterConfig,
  uiSortingConfig,
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
            disabled={isLoading || isEmpty}
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
            isLoading={isLoading || isEmpty}
          />
        </div>
      )}
    </div>
  );
}
