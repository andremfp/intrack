import { TableToolbar } from "./table-toolbar";
import type { FilterConfig } from "@/components/filters/consultation-filters";
import type { SortingConfig } from "@/components/filters/consultation-sorting";

interface EmptyConsultationsStateProps {
  specialtyCode: string;
  specialtyYear?: number;
  isDeleteMode: boolean;
  selectedIds: Set<string>;
  isLoading?: boolean;
  onAddConsultation?: () => void;
  onBulkDelete?: (
    ids: string[]
  ) => Promise<{ deletedIds: string[]; failedIds: string[] }>;
  onToggleDeleteMode?: () => void;
  onHandleBulkDelete?: () => void;
  filterConfig: FilterConfig | null;
  sortingConfig: SortingConfig | null;
}

export function EmptyConsultationsState({
  specialtyCode,
  specialtyYear,
  isDeleteMode,
  selectedIds,
  isLoading,
  onAddConsultation,
  onBulkDelete,
  onToggleDeleteMode,
  onHandleBulkDelete,
  filterConfig,
  sortingConfig,
}: EmptyConsultationsStateProps) {
  const yearText = specialtyYear
    ? ` em ${specialtyCode.toUpperCase()}.${specialtyYear}`
    : "";

  return (
    <div className="flex flex-col h-full gap-2">
      <TableToolbar
        isDeleteMode={isDeleteMode}
        selectedIds={selectedIds}
        isLoading={isLoading}
        isEmpty={true}
        onAddConsultation={onAddConsultation}
        onBulkDelete={onBulkDelete}
        onToggleDeleteMode={onToggleDeleteMode}
        onHandleBulkDelete={onHandleBulkDelete}
        filterConfig={filterConfig}
        sortingConfig={sortingConfig}
      />

      {/* Empty state */}
      <div className="flex flex-1 items-center justify-center py-12 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">
            Ainda não tem consultas registadas{yearText}.
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Clique em "Nova Consulta" para adicionar a sua primeira consulta.
          </p>
        </div>
      </div>
    </div>
  );
}
