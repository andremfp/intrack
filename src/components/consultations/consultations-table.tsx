import { TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import type {
  ConsultationMGF,
  MGFConsultationsFilters,
  MGFConsultationsSorting,
} from "@/lib/api/consultations";
import {
  getSpecialtyFields,
  SPECIALTY_CODES,
  COMMON_CONSULTATION_FIELDS,
} from "@/constants";
import { useMemo } from "react";
import type { FilterConfig } from "@/components/filters/consultation-filters";
import type { SortingConfig } from "@/components/filters/consultation-sorting";
import { CommonFieldCell } from "./cells/common-field-cell";
import { SpecialtyFieldCell } from "./cells/specialty-field-cell";
import { useFavorites } from "@/hooks/use-favorites";
import { useDeleteMode } from "@/hooks/use-delete-mode";
import { createFilterSetter } from "@/components/filters/utils";
import { TablePagination } from "@/components/ui/table-pagination";
import { TableToolbar } from "./table-toolbar";
import { TableHeader } from "./table-header";
import { EmptyConsultationsState } from "./empty-consultations-state";
import { getConsultationFieldValue } from "./utils";

interface ConsultationsTableProps {
  data: {
    consultations: ConsultationMGF[];
    totalCount: number;
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    onPageChange?: (page: number) => void;
  };
  specialty?: {
    code?: string;
    year?: number;
  };
  filters: {
    filters: MGFConsultationsFilters;
    sorting: MGFConsultationsSorting;
    onFiltersChange?: (
      filters:
        | MGFConsultationsFilters
        | ((prev: MGFConsultationsFilters) => MGFConsultationsFilters)
    ) => void;
    onSortingChange?: (sorting: MGFConsultationsSorting) => void;
    onApplyFilters?: (newFilters?: Record<string, unknown>) => void;
    onClearFilters?: () => void;
  };
  actions?: {
    onRowClick?: (consultation: ConsultationMGF) => void;
    onAddConsultation?: () => void;
    onBulkDelete?: (
      ids: string[]
    ) => Promise<{ deletedIds: string[]; failedIds: string[] }>;
    onEdit?: (consultation: ConsultationMGF) => void;
    onDelete?: (id: string) => void;
    onFavoriteToggle?: () => void;
  };
  isLoading?: boolean;
}

export function ConsultationsTable({
  data: { consultations, totalCount },
  pagination: { currentPage, pageSize, onPageChange },
  specialty = { code: SPECIALTY_CODES.MGF },
  filters: {
    filters,
    sorting,
    onFiltersChange,
    onSortingChange,
    onApplyFilters,
    onClearFilters,
  },
  actions: {
    onRowClick,
    onAddConsultation,
    onBulkDelete,
    onFavoriteToggle,
  } = {},
  isLoading = false,
}: ConsultationsTableProps) {
  const specialtyCode = specialty.code ?? SPECIALTY_CODES.MGF;
  const specialtyYear = specialty.year;

  // Get specialty-specific fields
  const specialtyFields = getSpecialtyFields(specialtyCode);

  // Helper function to create filter setters
  const createFilterSetters = useMemo(():
    | Record<string, (value: unknown) => void>
    | undefined => {
    if (!onFiltersChange) return undefined;

    return {
      processNumber: createFilterSetter<string>(
        "processNumber",
        onFiltersChange
      ),
      location: createFilterSetter<string>("location", onFiltersChange),
      autonomy: createFilterSetter<string>("autonomy", onFiltersChange),
      sex: createFilterSetter<string>("sex", onFiltersChange),
      ageMin: createFilterSetter<number>("ageMin", onFiltersChange),
      ageMax: createFilterSetter<number>("ageMax", onFiltersChange),
      type: createFilterSetter<string>("type", onFiltersChange),
      presential: createFilterSetter<boolean>("presential", onFiltersChange),
      smoker: createFilterSetter<boolean>("smoker", onFiltersChange),
      dateFrom: createFilterSetter<string>("dateFrom", onFiltersChange),
      dateTo: createFilterSetter<string>("dateTo", onFiltersChange),
    };
  }, [onFiltersChange]);

  // Helper function to create filter config
  const getFilterConfig = useMemo((): FilterConfig | null => {
    if (
      !onFiltersChange ||
      !onApplyFilters ||
      !onClearFilters ||
      !createFilterSetters
    ) {
      return null;
    }

    return {
      enabledFields: [
        "processNumber",
        "location",
        "autonomy",
        "sex",
        "ageRange",
        "type",
        "presential",
        "smoker",
        "dateRange",
      ],
      badgeLocation: "inside",
      locations:
        COMMON_CONSULTATION_FIELDS.find(
          (field) => field.key === "location"
        )?.options?.map((opt) => opt.value) || [],
      filterValues: filters as Record<string, unknown>,
      filterSetters: createFilterSetters,
      onClearFilters: () => {
        onClearFilters();
      },
      onApplyFilters: (newFilters) => {
        onApplyFilters(newFilters);
      },
    };
  }, [
    filters,
    createFilterSetters,
    onApplyFilters,
    onClearFilters,
    onFiltersChange,
  ]);

  // Helper function to create sorting config
  const getSortingConfig = useMemo((): SortingConfig | null => {
    if (!onSortingChange) {
      return null;
    }

    return {
      field: sorting.field,
      order: sorting.order,
      fieldLabels: {
        date: "Data",
        age: "Idade",
        process_number: "N° Processo",
      },
      onSortingChange: (newSorting) => {
        onSortingChange({
          field: newSorting.field as MGFConsultationsSorting["field"],
          order: newSorting.order as MGFConsultationsSorting["order"],
        });
      },
    };
  }, [sorting, onSortingChange]);

  // Favorites management hook
  const { sortedConsultations, toggleStar, isFavorite } = useFavorites({
    consultations,
    onFavoriteToggle,
  });

  // Delete mode management hook
  const {
    isDeleteMode,
    selectedIds,
    filteredConsultations,
    toggleDeleteMode,
    toggleSelectAll,
    toggleSelectRow,
    handleBulkDelete,
  } = useDeleteMode({
    consultations: sortedConsultations,
    onBulkDelete,
  });

  if (consultations.length === 0) {
    return (
      <EmptyConsultationsState
        specialtyCode={specialtyCode}
        specialtyYear={specialtyYear}
        isDeleteMode={isDeleteMode}
        selectedIds={selectedIds}
        isLoading={isLoading}
        onAddConsultation={onAddConsultation}
        onBulkDelete={onBulkDelete}
        onToggleDeleteMode={toggleDeleteMode}
        onHandleBulkDelete={handleBulkDelete}
        filterConfig={getFilterConfig}
        sortingConfig={getSortingConfig}
      />
    );
  }

  return (
    <div className="flex flex-col h-full gap-2">
      <TableToolbar
        isDeleteMode={isDeleteMode}
        selectedIds={selectedIds}
        isLoading={isLoading}
        isEmpty={false}
        onAddConsultation={onAddConsultation}
        onBulkDelete={onBulkDelete}
        onToggleDeleteMode={toggleDeleteMode}
        onHandleBulkDelete={handleBulkDelete}
        filterConfig={getFilterConfig}
        sortingConfig={getSortingConfig}
      />

      <div className="rounded-lg border overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto flex-1 min-h-0 relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-corner]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
          <table className="w-full caption-bottom text-sm">
            <TableHeader
              commonFields={COMMON_CONSULTATION_FIELDS}
              specialtyFields={specialtyFields}
              isDeleteMode={isDeleteMode}
              isAllSelected={selectedIds.size === filteredConsultations.length}
              hasItems={filteredConsultations.length > 0}
              onToggleSelectAll={toggleSelectAll}
            />
            <tbody className="[&_tr:last-child]:border-0">
              {filteredConsultations.map((consultation) => (
                <tr
                  key={consultation.id}
                  className={`border-b transition-colors ${
                    onRowClick && !isDeleteMode
                      ? "cursor-pointer hover:bg-accent/50"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => !isDeleteMode && onRowClick?.(consultation)}
                >
                  {/* Star / bookmark cell */}
                  <TableCell className="w-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(consultation);
                      }}
                      className="p-1 rounded hover:bg-muted transition-colors"
                      aria-label={
                        isFavorite(consultation.id!)
                          ? "Remover destaque"
                          : "Destacar consulta"
                      }
                    >
                      {isFavorite(consultation.id!) ? (
                        <IconStarFilled className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <IconStar className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </TableCell>

                  {/* Checkbox for delete mode */}
                  {isDeleteMode && (
                    <TableCell className="w-12">
                      <Checkbox
                        checked={selectedIds.has(consultation.id!)}
                        onCheckedChange={() =>
                          toggleSelectRow(consultation.id!)
                        }
                        aria-label={`Selecionar consulta ${consultation.id}`}
                      />
                    </TableCell>
                  )}

                  {/* Common fields */}
                  {COMMON_CONSULTATION_FIELDS.filter(
                    (field) => field.key !== "age_unit"
                  ).map((field) => {
                    const cellContent = (
                      <CommonFieldCell
                        consultation={consultation}
                        fieldKey={field.key}
                      />
                    );
                    // Skip rendering if cell returns null (e.g., age_unit)
                    if (cellContent === null) return null;
                    return (
                      <TableCell
                        key={field.key}
                        className={field.key === "date" ? "font-medium" : ""}
                      >
                        {cellContent}
                      </TableCell>
                    );
                  })}

                  {/* Dynamic specialty-specific fields */}
                  {specialtyFields.map((field) => (
                    <TableCell
                      key={field.key}
                      className={
                        field.type === "icpc2-codes" ||
                        field.type === "text-list"
                          ? "max-w-[200px] overflow-hidden"
                          : ""
                      }
                    >
                      <SpecialtyFieldCell
                        value={getConsultationFieldValue(
                          consultation,
                          field.key
                        )}
                        field={field}
                      />
                    </TableCell>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fixed pagination at bottom */}
        <TablePagination
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          isLoading={isLoading}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
