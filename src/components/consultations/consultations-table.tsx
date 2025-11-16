import { TableCell, TableHead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconTrash,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
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
import { useState, useEffect } from "react";
import { ConsultationsFilters } from "./consultations-filters";

interface ConsultationsTableProps {
  consultations: ConsultationMGF[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  specialtyCode?: string;
  specialtyYear?: number;
  filters: MGFConsultationsFilters;
  sorting: MGFConsultationsSorting;
  isLoading?: boolean;
  onEdit?: (consultation: ConsultationMGF) => void;
  onDelete?: (id: string) => void;
  onRowClick?: (consultation: ConsultationMGF) => void;
  onAddConsultation?: () => void;
  onBulkDelete?: (ids: string[]) => void;
  onPageChange?: (page: number) => void;
  onFiltersChange?: (filters: MGFConsultationsFilters) => void;
  onSortingChange?: (sorting: MGFConsultationsSorting) => void;
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
}

export function ConsultationsTable({
  consultations,
  totalCount,
  currentPage,
  pageSize,
  specialtyCode = SPECIALTY_CODES.MGF,
  specialtyYear,
  filters,
  sorting,
  isLoading = false,
  onRowClick,
  onAddConsultation,
  onBulkDelete,
  onPageChange,
  onFiltersChange,
  onSortingChange,
  onApplyFilters,
  onClearFilters,
}: ConsultationsTableProps) {
  // Get specialty-specific fields
  const specialtyFields = getSpecialtyFields(specialtyCode);

  // State for delete mode
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageInput, setPageInput] = useState(currentPage.toString());

  // Update page input when current page changes
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string for clearing
    if (value === "") {
      setPageInput(value);
      return;
    }

    // Only allow numbers
    if (/^\d+$/.test(value)) {
      const pageNum = parseInt(value);
      // Prevent 0 and numbers greater than totalPages
      if (pageNum >= 1 && pageNum <= totalPages) {
        setPageInput(value);
      }
      // If they try to type a number > totalPages, set it to totalPages
      else if (pageNum > totalPages) {
        setPageInput(totalPages.toString());
      }
      // Don't allow 0 or leading zeros
    }
  };

  const handlePageInputSubmit = () => {
    if (pageInput === "") {
      // If empty, reset to current page
      setPageInput(currentPage.toString());
      return;
    }

    const pageNum = parseInt(pageInput);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange?.(pageNum);
    } else {
      // Reset to current page if invalid
      setPageInput(currentPage.toString());
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePageInputSubmit();
      e.currentTarget.blur();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSexLabel = (sex: string | null) => {
    if (!sex) return "-";
    switch (sex) {
      case "m":
        return "M";
      case "f":
        return "F";
      case "other":
        return "Outro";
      default:
        return sex;
    }
  };

  const getAgeUnitLabel = (unit: string | null) => {
    if (!unit) return "";
    switch (unit) {
      case "days":
        return "D";
      case "months":
        return "M";
      case "years":
        return "Y";
      default:
        return unit;
    }
  };

  // Delete mode functions
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === consultations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(consultations.map((c) => c.id!)));
    }
  }; // TODO - fix bulk delete

  const toggleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size > 0 && onBulkDelete) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsDeleteMode(false);
    }
  };

  // Pagination helpers
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const handlePreviousPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const getFieldValue = (
    consultation: ConsultationMGF,
    fieldKey: string
  ): unknown => {
    // Try top-level column first (e.g. type, presential, smoker)
    const topLevelValue = (consultation as Record<string, unknown>)[fieldKey];
    if (topLevelValue !== undefined && topLevelValue !== null) {
      return topLevelValue;
    }

    // Fallback to details JSONB
    const details = consultation.details as
      | Record<string, unknown>
      | null
      | undefined;
    if (details && fieldKey in details) {
      return details[fieldKey];
    }

    return null;
  };

  const renderCommonField = (consultation: ConsultationMGF, key: string) => {
    switch (key) {
      case "date":
        return formatDate(consultation.date);
      case "sex":
        return (
          <Badge variant="outline" className="text-xs">
            {getSexLabel(consultation.sex)}
          </Badge>
        );
      case "age":
        return consultation.age !== null
          ? `${consultation.age} ${getAgeUnitLabel(consultation.age_unit)}`
          : "-";
      case "age_unit":
        // Don't display age_unit separately since it's included in age
        return null;
      case "health_number":
        return consultation.health_number ?? "-";
      default:
        return "-";
    }
  };

  const renderCellValue = (
    value: unknown,
    field: {
      key: string;
      type: string;
      options?: { value: string; label: string }[];
    }
  ) => {
    if (value === null || value === undefined) return "-";

    console.log("Rendering cell value:", value);
    console.log("Field:", field);

    switch (field.type) {
      case "boolean":
        return (
          <Badge variant={value ? "default" : "secondary"} className="text-xs">
            {value ? "Sim" : "Não"}
          </Badge>
        );
      case "select":
      case "combobox": {
        // Display select value with tooltip showing full label
        const stringValue = String(value);
        const option = field.options?.find((opt) => opt.value === stringValue);

        if (!option) {
          return (
            <Badge variant="outline" className="text-xs">
              {stringValue}
            </Badge>
          );
        }

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-xs cursor-help font-semibold"
                >
                  {stringValue}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-sm">{option.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      case "text-list": {
        // Display semicolon-separated values as a list
        const items = String(value)
          .split(";")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        if (items.length === 0) return "-";

        return (
          <div className="max-w-[200px] space-y-1">
            {items.map((item, idx) => (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-start gap-1 text-xs cursor-help">
                      <span className="font-semibold text-muted-foreground shrink-0 text-[10px]">
                        {idx + 1}.
                      </span>
                      <span className="line-clamp-1 text-[10px] leading-tight">
                        {item}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[300px]">
                    <p className="text-sm">
                      <span className="font-semibold">{idx + 1}.</span> {item}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        );
      }
      case "icpc2-codes": {
        // Display ICPC-2 codes with descriptions
        // Format: "CODE - Description; CODE - Description"
        const codeEntries = String(value)
          .split(";")
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0);

        if (codeEntries.length === 0) return "-";

        return (
          <div className="max-w-[200px] space-y-1">
            {codeEntries.map((entry, idx) => {
              const match = entry.match(/^([A-Z]\d{2})\s*-\s*(.+)$/);
              if (match) {
                const code = match[1];
                const description = match[2];
                return (
                  <TooltipProvider key={idx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-start gap-1 text-xs cursor-help">
                          <Badge
                            variant="outline"
                            className="font-mono font-semibold shrink-0 text-[10px] px-1 py-0"
                          >
                            {code}
                          </Badge>
                          <span className="text-muted-foreground line-clamp-1 text-[10px] leading-tight">
                            {description}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[300px]">
                        <p className="text-sm">
                          <span className="font-mono font-semibold">
                            {code}
                          </span>
                          <span className="text-muted-foreground"> - </span>
                          <span>{description}</span>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              }
              // Fallback for old format (just code)
              return (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs font-mono"
                >
                  {entry}
                </Badge>
              );
            })}
          </div>
        );
      }
      case "text":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="max-w-[200px] truncate block">
                  {String(value) || "-"}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px]">
                <p className="text-sm whitespace-normal break-words leading-relaxed">
                  {String(value) || "-"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return String(value);
    }
  };

  if (consultations.length === 0) {
    const yearText = specialtyYear
      ? ` em ${specialtyCode.toUpperCase()}.${specialtyYear}`
      : "";
    return (
      <div className="flex flex-col h-full gap-2">
        {/* Action buttons and filters */}
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
                onClick={toggleDeleteMode}
                disabled={isLoading}
                className="h-8 flex-shrink-0"
              >
                <IconTrash className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isDeleteMode ? "Cancelar" : "Eliminar"}
                </span>
              </Button>
            )}
          </div>

          {/* Right side: Sort and Filter controls */}
          {onFiltersChange &&
            onSortingChange &&
            onApplyFilters &&
            onClearFilters && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <ConsultationsFilters
                  filters={filters}
                  sorting={sorting}
                  isLoading={isLoading}
                  onFiltersChange={onFiltersChange}
                  onSortingChange={onSortingChange}
                  onApplyFilters={onApplyFilters}
                  onClearFilters={onClearFilters}
                />
              </div>
            )}
        </div>

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

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Action buttons and filters */}
      <div className="flex items-center justify-between flex-shrink-0 gap-2 pt-2">
        {/* Left side: Primary actions */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {onAddConsultation && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddConsultation}
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
              onClick={toggleDeleteMode}
              className="h-8 flex-shrink-0"
            >
              <IconTrash className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isDeleteMode ? "Cancelar" : "Eliminar"}
              </span>
            </Button>
          )}

          {/* Delete mode actions */}
          {isDeleteMode && (
            <>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                {selectedIds.size} selecionada(s)
              </span>
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="h-8 flex-shrink-0"
                >
                  <IconTrash className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    Eliminar Selecionadas
                  </span>
                </Button>
              )}
            </>
          )}
        </div>

        {/* Right side: Sort and Filter controls */}
        {!isDeleteMode &&
          onFiltersChange &&
          onSortingChange &&
          onApplyFilters &&
          onClearFilters && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <ConsultationsFilters
                filters={filters}
                sorting={sorting}
                onFiltersChange={onFiltersChange}
                onSortingChange={onSortingChange}
                onApplyFilters={onApplyFilters}
                onClearFilters={onClearFilters}
              />
            </div>
          )}
      </div>

      <div className="rounded-lg border overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto flex-1 min-h-0 relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-corner]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
          <table className="w-full caption-bottom text-sm">
            <thead className="sticky top-0 bg-background z-10 border-b">
              <tr className="border-b hover:bg-transparent">
                {/* Checkbox column for delete mode */}
                {isDeleteMode && (
                  <TableHead className="w-12 bg-background">
                    <Checkbox
                      checked={
                        selectedIds.size === consultations.length &&
                        consultations.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Selecionar todas"
                    />
                  </TableHead>
                )}

                {/* Common fields */}
                {COMMON_CONSULTATION_FIELDS.filter(
                  (field) => field.key !== "age_unit"
                ).map((field) => (
                  <TableHead key={field.key} className="bg-background">
                    {field.label}
                  </TableHead>
                ))}

                {/* Dynamic specialty-specific fields */}
                {specialtyFields.map((field) => (
                  <TableHead key={field.key} className="bg-background">
                    {field.label}
                  </TableHead>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {consultations.map((consultation) => (
                <tr
                  key={consultation.id}
                  className={`border-b transition-colors ${
                    onRowClick && !isDeleteMode
                      ? "cursor-pointer hover:bg-accent/50"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => !isDeleteMode && onRowClick?.(consultation)}
                >
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
                  ).map((field) => (
                    <TableCell
                      key={field.key}
                      className={field.key === "date" ? "font-medium" : ""}
                    >
                      {renderCommonField(consultation, field.key)}
                    </TableCell>
                  ))}

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
                      {renderCellValue(
                        getFieldValue(consultation, field.key),
                        field
                      )}
                    </TableCell>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fixed pagination at bottom */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-t flex-shrink-0">
          <div className="text-xs text-muted-foreground">
            <span className="hidden sm:inline">
              Mostrando {startItem} a {endItem} de {totalCount} consultas
            </span>
            <span className="inline sm:hidden">
              {startItem}-{endItem} de {totalCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1 || isLoading}
              className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Página
              </span>
              <input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                onBlur={handlePageInputSubmit}
                onKeyDown={handlePageInputKeyDown}
                disabled={isLoading}
                className="w-10 h-7 px-2 text-center text-sm border rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-xs text-muted-foreground">
                de {totalPages}
              </span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
