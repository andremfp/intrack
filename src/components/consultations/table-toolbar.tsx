import * as React from "react";
import { Button } from "@/components/ui/button";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { ConsultationFilters } from "@/components/filters/consultation-filters";
import { ConsultationSorting } from "@/components/sorting/consultation-sorting";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Download, Loader2, Upload } from "lucide-react";
import type { FilterUIConfig } from "@/components/filters/types";
import type { SortingConfig } from "@/components/filters/types";

interface ExportButtonProps {
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  isExportingCsv?: boolean;
  isExportingExcel?: boolean;
  isLoading?: boolean;
}

function ExportButton({
  onExportCsv,
  onExportExcel,
  isExportingCsv = false,
  isExportingExcel = false,
  isLoading = false,
}: ExportButtonProps) {
  const [open, setOpen] = React.useState(false);
  const isExporting = isExportingCsv || isExportingExcel;

  const handleExportCsv = () => {
    if (onExportCsv) {
      onExportCsv();
      setOpen(false);
    }
  };

  const handleExportExcel = () => {
    if (onExportExcel) {
      onExportExcel();
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || isExporting}
          className="h-8 flex-shrink-0"
        >
          {isExporting ? (
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
      <PopoverContent className="w-48" align="start">
        <div className="space-y-1">
          {onExportCsv && (
            <button
              onClick={handleExportCsv}
              disabled={isExportingCsv || isLoading}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExportingCsv ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />A exportar CSV...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </>
              )}
            </button>
          )}
          {onExportExcel && (
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel || isLoading}
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
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

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
              <Button
                variant="outline"
                size="sm"
                onClick={onImport}
                disabled={isLoading}
                className="h-8 flex-shrink-0"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Importar</span>
              </Button>
            )}
            {onExportCsv || onExportExcel ? (
              <ExportButton
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
