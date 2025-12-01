import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import { IconFilter, IconX } from "@tabler/icons-react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import type { ConsultationFiltersProps } from "./types";
import {
  getSexOptions,
  getAutonomyOptions,
  getLocationOptions,
  getInternshipOptions,
  getTypeOptions,
  getContraceptiveOptions,
  getNewContraceptiveOptions,
  generatePrettyFilterLabel,
  buildFilterBadgeConfigs,
  hasValue,
  type FiltersRecord,
} from "./helpers";

/**
 * Filter component specialized to consultations filters.
 * Supports both metrics dashboard and consultations table.
 */
export function ConsultationFilters({
  config,
  isLoading = false,
}: ConsultationFiltersProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Local state for filter values (only used in onApply mode)
  const [localFilters, setLocalFilters] = useState<Record<string, unknown>>(
    config.filterValues
  );

  // Track previous isOpen state to detect when popover opens
  const prevIsOpenRef = useRef(isOpen);

  // Reset local state only when popover opens (not on every filterValues change)
  useEffect(() => {
    // Only reset when popover transitions from closed to open
    if (isOpen && !prevIsOpenRef.current && config.filterValues) {
      setLocalFilters({ ...config.filterValues });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, config.filterValues]);

  // Get current filter values from local state
  const getFilterValue = (key: string): unknown => {
    return localFilters[key];
  };

  // Set filter value in local state
  const setFilterValue = (key: string, value: unknown) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Apply filters when "Aplicar" is clicked
  const handleApplyFilters = () => {
    // Get all filter keys that have setters (to ensure we clear filters that were removed)
    const allFilterKeys = new Set([
      ...Object.keys(config.filterSetters),
      ...Object.keys(config.filterValues),
    ]);

    // Build the new filters object from localFilters
    const newFilters: Record<string, unknown> = {};
    allFilterKeys.forEach((key) => {
      const value = localFilters[key];
      // Only include defined values (exclude undefined, null, empty string)
      if (value !== undefined && value !== null && value !== "") {
        newFilters[key] = value;
      }
    });

    // Apply all filters: set to local value if exists, otherwise clear (undefined)
    allFilterKeys.forEach((key) => {
      const value = localFilters[key];
      // If key exists in localFilters, use its value (even if undefined)
      // If key doesn't exist in localFilters, clear it (set to undefined)
      config.filterSetters[key]?.(value);
    });

    setIsOpen(false);
  };

  // Cancel and reset local state
  const handleCancel = () => {
    if (config.filterValues) {
      setLocalFilters({ ...config.filterValues });
    }
    setIsOpen(false);
  };

  // Clear all local filter values (in the popover) - only clears input fields, not applied filters
  const handleClearLocalFilters = () => {
    setLocalFilters({});
  };

  // Check if there are any active filters
  const hasActiveFilters = Object.values(config.filterValues).some((v) =>
    hasValue(v)
  );

  // Check if there are any local filters active (for clear button in popover)
  const hasLocalActiveFilters = Object.values(localFilters).some((v) =>
    hasValue(v)
  );

  // Count active filters
  const activeFilterCount = Object.values(config.filterValues).filter(
    (v) => v !== undefined && v !== "" && v !== null
  ).length;

  // Get filter label for display (from applied filters)
  const getFilterLabel = useCallback(
    (key: string): string => {
      return generatePrettyFilterLabel(
        key,
        // Indexing by string is safe here because keys come from enabledFields
        // which are aligned with ConsultationsFilters keys.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (config.filterValues as any)[key],
        config.specialty,
        config.filterValues
      );
    },
    [config.filterValues, config.specialty]
  );

  // Get filter label for display (from local filters in popover)
  const getLocalFilterLabel = useCallback(
    (key: string): string => {
      return generatePrettyFilterLabel(
        key,
        localFilters[key],
        config.specialty,
        localFilters
      );
    },
    [localFilters, config.specialty]
  );

  // Helper function to remove individual filter (applied filters)
  const removeFilter = useCallback(
    (filterKey: string) => {
      config.filterSetters[filterKey]?.(undefined);
      // Handle special cases for age and date ranges
      if (filterKey === "ageMin" || filterKey === "ageMax") {
        config.filterSetters.ageMin?.(undefined);
        config.filterSetters.ageMax?.(undefined);
      } else if (filterKey === "dateFrom" || filterKey === "dateTo") {
        config.filterSetters.dateFrom?.(undefined);
        config.filterSetters.dateTo?.(undefined);
      }
    },
    [config]
  );

  // Helper function to remove individual local filter (in popover)
  const removeLocalFilter = useCallback((filterKey: string) => {
    setFilterValue(filterKey, undefined);
    // Handle special cases for age and date ranges
    if (filterKey === "ageMin" || filterKey === "ageMax") {
      setFilterValue("ageMin", undefined);
      setFilterValue("ageMax", undefined);
    } else if (filterKey === "dateFrom" || filterKey === "dateTo") {
      setFilterValue("dateFrom", undefined);
      setFilterValue("dateTo", undefined);
    }
  }, []);

  // Get field options
  const sexOptions = getSexOptions();
  const autonomyOptions = getAutonomyOptions();
  const locationOptions = getLocationOptions();
  const internshipOptions = getInternshipOptions();
  const typeOptions = getTypeOptions();
  const contraceptiveOptions = getContraceptiveOptions();
  const newContraceptiveOptions = getNewContraceptiveOptions();

  // Show internship selector when enabled and options exist
  const shouldShowInternship =
    config.enabledFields.includes("internship") &&
    internshipOptions &&
    internshipOptions.length > 0;

  const appliedFilterBadges = useMemo(
    () =>
      hasActiveFilters
        ? buildFilterBadgeConfigs({
            values: config.filterValues as FiltersRecord,
            getLabel: getFilterLabel,
          }).map(({ id, label, removeKey }) => (
            <Badge
              key={id}
              variant="secondary"
              className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
            >
              <span>{label}</span>
              <button
                onClick={() => removeFilter(removeKey)}
                className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))
        : [],
    [config.filterValues, getFilterLabel, hasActiveFilters, removeFilter]
  );

  const localFilterBadges = useMemo(
    () =>
      hasLocalActiveFilters
        ? buildFilterBadgeConfigs({
            values: localFilters,
            getLabel: getLocalFilterLabel,
          }).map(({ id, label, removeKey }) => (
            <Badge
              key={id}
              variant="secondary"
              className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
            >
              <span>{label}</span>
              <button
                onClick={() => removeLocalFilter(removeKey)}
                className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))
        : [],
    [
      getLocalFilterLabel,
      hasLocalActiveFilters,
      localFilters,
      removeLocalFilter,
    ]
  );

  // Render filter content (reusable for both Sheet and Popover)
  const renderFilterContent = () => {
    return (
      <>
        {/* Show local filter badges whenever inputs are set */}
        {hasLocalActiveFilters && (
          <div className="space-y-2 pb-3 border-b mb-4">
            <div className="flex items-center justify-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearLocalFilters}
                className="h-6 text-xs"
              >
                <IconX className="h-3 w-3" />
                Limpar
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">{localFilterBadges}</div>
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Year selector for multi-year specialties */}
            {config.enabledFields.includes("year") &&
              config.specialty &&
              config.specialty.years > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Ano
                  </label>
                  <Select
                    value={
                      (
                        getFilterValue("year") as number | undefined
                      )?.toString() || "all"
                    }
                    onValueChange={(value) =>
                      setFilterValue(
                        "year",
                        value === "all" ? undefined : parseInt(value)
                      )
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Todos os anos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os anos</SelectItem>
                      {Array.from(
                        { length: config.specialty.years },
                        (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {config.specialty?.code.toUpperCase()}.{i + 1}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

            {/* Process number filter */}
            {config.enabledFields.includes("processNumber") && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Número de Processo
                </label>
                <Input
                  type="number"
                  min={0}
                  max={999999999}
                  value={(getFilterValue("processNumber") as string) || ""}
                  onChange={(e) =>
                    setFilterValue("processNumber", e.target.value || undefined)
                  }
                  className="h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&input-placeholder]:text-muted-foreground"
                />
              </div>
            )}

            {/* Date range */}
            {config.enabledFields.includes("dateRange") && (
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Data
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <DatePicker
                      value={(getFilterValue("dateFrom") as string) || ""}
                      onChange={(value) =>
                        setFilterValue("dateFrom", value || undefined)
                      }
                      placeholder="De"
                      id="date-from"
                    />
                  </div>
                  <div className="flex-1">
                    <DatePicker
                      value={(getFilterValue("dateTo") as string) || ""}
                      onChange={(value) =>
                        setFilterValue("dateTo", value || undefined)
                      }
                      placeholder="Até"
                      id="date-to"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Location selector */}
            {config.enabledFields.includes("location") && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Local
                </label>
                <Select
                  value={(getFilterValue("location") as string) || "all"}
                  onValueChange={(value) =>
                    setFilterValue(
                      "location",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os locais</SelectItem>
                    {locationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Internship selector - only shown when location is not 'health_unit' */}
            {shouldShowInternship && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Estágio
                </label>
                <Select
                  value={(getFilterValue("internship") as string) || "all"}
                  onValueChange={(value) =>
                    setFilterValue(
                      "internship",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estágios</SelectItem>
                    {internshipOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Sex selector */}
            {config.enabledFields.includes("sex") && sexOptions.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Sexo
                </label>
                <Select
                  value={(getFilterValue("sex") as string) || "all"}
                  onValueChange={(value) =>
                    setFilterValue("sex", value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {sexOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Autonomy selector */}
            {config.enabledFields.includes("autonomy") &&
              autonomyOptions.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Autonomia
                  </label>
                  <Select
                    value={(getFilterValue("autonomy") as string) || "all"}
                    onValueChange={(value) =>
                      setFilterValue(
                        "autonomy",
                        value === "all" ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {autonomyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

            {/* Age range */}
            {config.enabledFields.includes("ageRange") && (
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Idade (anos)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={
                      (getFilterValue("ageMin") as number | undefined) ?? ""
                    }
                    min={0}
                    max={150}
                    onChange={(e) =>
                      setFilterValue(
                        "ageMin",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={
                      (getFilterValue("ageMax") as number | undefined) ?? ""
                    }
                    min={0}
                    max={150}
                    onChange={(e) =>
                      setFilterValue(
                        "ageMax",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            )}

            {/* Type filter */}
            {config.enabledFields.includes("type") &&
              typeOptions.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Tipo de Consulta
                  </label>
                  <Select
                    value={(getFilterValue("type") as string) || "all"}
                    onValueChange={(value) =>
                      setFilterValue(
                        "type",
                        value === "all" ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

            {/* Presential filter */}
            {config.enabledFields.includes("presential") && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Presencial
                </label>
                <Select
                  value={
                    getFilterValue("presential") === undefined
                      ? "all"
                      : getFilterValue("presential")
                      ? "yes"
                      : "no"
                  }
                  onValueChange={(value) =>
                    setFilterValue(
                      "presential",
                      value === "all"
                        ? undefined
                        : value === "yes"
                        ? true
                        : false
                    )
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="yes">Sim</SelectItem>
                    <SelectItem value="no">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Smoker filter */}
            {config.enabledFields.includes("smoker") && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Fumador
                </label>
                <Select
                  value={
                    getFilterValue("smoker") === undefined
                      ? "all"
                      : getFilterValue("smoker")
                      ? "yes"
                      : "no"
                  }
                  onValueChange={(value) =>
                    setFilterValue(
                      "smoker",
                      value === "all"
                        ? undefined
                        : value === "yes"
                        ? true
                        : false
                    )
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="yes">Sim</SelectItem>
                    <SelectItem value="no">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Contraceptive filter */}
            {config.enabledFields.includes("contraceptive") &&
              contraceptiveOptions.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Contraceptivo
                  </label>
                  <Select
                    value={(getFilterValue("contraceptive") as string) || "all"}
                    onValueChange={(value) =>
                      setFilterValue(
                        "contraceptive",
                        value === "all" ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {contraceptiveOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            {/* New contraceptive filter */}
            {config.enabledFields.includes("new_contraceptive") &&
              newContraceptiveOptions.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Novo Contraceptivo
                  </label>
                  <Select
                    value={
                      (getFilterValue("new_contraceptive") as string) || "all"
                    }
                    onValueChange={(value) =>
                      setFilterValue(
                        "new_contraceptive",
                        value === "all" ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {newContraceptiveOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Active filters displayed on the left (only if badgeLocation is outside) */}
      {config.badgeLocation === "outside" && hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5">{appliedFilterBadges}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              Object.keys(config.filterValues).forEach((key) => {
                config.filterSetters[key]?.(undefined);
              });
            }}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-3 w-3" />
            Limpar
          </Button>
        </div>
      )}

      {/* Filter button and popover/sheet on the right */}
      <div
        className={`flex items-center gap-2 ${
          config.badgeLocation === "outside" ? "ml-auto" : ""
        }`}
      >
        {/* Filter trigger button */}
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="relative gap-2"
                disabled={config.isLoading || isLoading}
              >
                <IconFilter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="sm:ml-1 px-1 py-0 text-[10px] absolute sm:relative -top-1 -right-1 sm:top-0 sm:right-0 min-w-[16px] h-4 flex items-center justify-center"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0">
              <SheetHeader className="px-4 pt-4 pb-2 border-b">
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/40 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 [&::-webkit-scrollbar-thumb]:rounded-full">
                {renderFilterContent()}
              </div>
              <div className="flex gap-2 p-4 border-t mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyFilters}
                  className="flex-1"
                >
                  Aplicar
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="relative gap-2"
                disabled={config.isLoading || isLoading}
              >
                <IconFilter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="sm:ml-1 px-1 py-0 text-[10px] absolute sm:relative -top-1 -right-1 sm:top-0 sm:right-0 min-w-[16px] h-4 flex items-center justify-center"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[calc(100vw-2rem)] max-w-md max-h-[85vh] p-0"
              align="end"
            >
              <div className="flex flex-col max-h-[85vh]">
                <div className="px-4 pt-4 pb-2 border-b">
                  <h4 className="font-semibold text-sm">Filtros</h4>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/40 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {renderFilterContent()}
                </div>
                <div className="flex gap-2 p-4 border-t mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApplyFilters}
                    className="flex-1"
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
