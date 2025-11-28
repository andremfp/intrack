import { TableToolbar } from "./table-toolbar";
import type { FilterUIConfig } from "@/components/filters/types";
import type { SortingConfig } from "@/components/filters/types";

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
  uiFilterConfig: FilterUIConfig | null;
  uiSortingConfig: SortingConfig | null;
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
  uiFilterConfig,
  uiSortingConfig,
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
        uiFilterConfig={uiFilterConfig}
        uiSortingConfig={uiSortingConfig}
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
