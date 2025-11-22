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
import React, { useState, useCallback, useEffect } from "react";
import type { Specialty } from "@/lib/api/specialties";
import { COMMON_CONSULTATION_FIELDS, MGF_FIELDS } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";

// Filter field types
export type FilterFieldType =
  | "year"
  | "location"
  | "internship"
  | "sex"
  | "autonomy"
  | "ageRange"
  | "dateRange"
  | "processNumber"
  | "type"
  | "presential"
  | "smoker";

// Filter configuration
export interface FilterConfig {
  // Filter fields to show
  enabledFields: FilterFieldType[];
  // Badge display location
  badgeLocation: "outside" | "inside";
  // Specialty for year selector
  specialty?: Specialty | null;
  // Available options
  locations?: string[];
  internships?: string[];
  // Callbacks for filter changes
  onApplyFilters?: (newFilters: Record<string, unknown>) => void;
  onClearFilters?: () => void;
  // Individual filter values and setters
  filterValues?: Record<string, unknown>;
  filterSetters?: Record<string, (value: unknown) => void>;
}

// Helper function to get internship label from value
function getInternshipLabel(value: string): string {
  const internshipField = MGF_FIELDS.find(
    (field) => field.key === "internship"
  );
  if (!internshipField?.options) return value;
  const option = internshipField.options.find((opt) => opt.value === value);
  return option?.label || value;
}

// Helper function to get location label from value
function getLocationLabel(value: string): string {
  const locationField = COMMON_CONSULTATION_FIELDS.find(
    (field) => field.key === "location"
  );
  if (!locationField?.options) return value;
  const option = locationField.options.find((opt) => opt.value === value);
  return option?.label || value;
}

// Helper function to format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface ConsultationFiltersProps {
  config: FilterConfig;
  isLoading?: boolean;
}

export function ConsultationFilters({
  config,
  isLoading = false,
}: ConsultationFiltersProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Local state for filter values (only used in onApply mode)
  const [localFilters, setLocalFilters] = useState<Record<string, unknown>>(
    config.filterValues || {}
  );

  // Reset local state when popover opens or when props change
  useEffect(() => {
    if (isOpen && config.filterValues) {
      setLocalFilters({ ...config.filterValues });
    }
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
      ...Object.keys(config.filterSetters || {}),
      ...Object.keys(config.filterValues || {}),
    ]);

    // Build the new filters object from localFilters
    const newFilters: Record<string, unknown> = {};
    allFilterKeys.forEach((key) => {
      const value = localFilters[key];
      // Only include defined values (exclude undefined, null, empty string)
      // Note: boolean false is a valid value, so we check explicitly for undefined/null/empty string
      if (value !== undefined && value !== null && value !== "") {
        newFilters[key] = value;
      }
    });

    // Apply all filters: set to local value if exists, otherwise clear (undefined)
    allFilterKeys.forEach((key) => {
      const value = localFilters[key];
      // If key exists in localFilters, use its value (even if undefined)
      // If key doesn't exist in localFilters, clear it (set to undefined)
      config.filterSetters?.[key]?.(value);
    });

    // Pass the new filters to the callback so parent can use them immediately
    config.onApplyFilters?.(newFilters);
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
    // Clear local filters (input fields only)
    setLocalFilters({});
  };

  // Check if there are any active filters
  const hasActiveFilters = Object.values(config.filterValues || {}).some(
    (v) => v !== undefined && v !== "" && v !== null
  );

  // Check if there are any local filters active (for clear button in popover)
  const hasLocalActiveFilters = Object.values(localFilters).some(
    (v) => v !== undefined && v !== "" && v !== null
  );

  // Count active filters
  const activeFilterCount = Object.values(config.filterValues || {}).filter(
    (v) => v !== undefined && v !== "" && v !== null
  ).length;

  // Get filter label for display (from applied filters)
  const getFilterLabel = useCallback(
    (key: string): string => {
      const value = config.filterValues?.[key];
      if (value === undefined || value === "" || value === null) return "";

      switch (key) {
        case "year": {
          const year = value as number;
          return `Ano: ${config.specialty?.code.toUpperCase()}.${year}`;
        }
        case "location":
          return `Local: ${getLocationLabel(value as string)}`;
        case "internship":
          return `Estágio: ${getInternshipLabel(value as string)}`;
        case "sex": {
          const sexField = COMMON_CONSULTATION_FIELDS.find(
            (field) => field.key === "sex"
          );
          const sexOption = sexField?.options?.find(
            (opt) => opt.value === value
          );
          return `Sexo: ${sexOption?.label || value}`;
        }
        case "autonomy": {
          const autonomyField = COMMON_CONSULTATION_FIELDS.find(
            (field) => field.key === "autonomy"
          );
          const autonomyOption = autonomyField?.options?.find(
            (opt) => opt.value === value
          );
          return `Autonomia: ${autonomyOption?.label || value}`;
        }
        case "ageMin": {
          const ageMax = config.filterValues?.ageMax as number | undefined;
          return ageMax
            ? `Idade: ${value}-${ageMax} anos`
            : `Idade: ≥${value} anos`;
        }
        case "ageMax": {
          const ageMin = config.filterValues?.ageMin as number | undefined;
          return ageMin ? "" : `Idade: ≤${value} anos`;
        }
        case "dateFrom": {
          const dateTo = config.filterValues?.dateTo as string | undefined;
          return dateTo
            ? `Data: ${formatDate(value as string)} - ${formatDate(dateTo)}`
            : `Data: ≥${formatDate(value as string)}`;
        }
        case "dateTo": {
          const dateFrom = config.filterValues?.dateFrom as string | undefined;
          return dateFrom ? "" : `Data: ≤${formatDate(value as string)}`;
        }
        case "processNumber":
          return `N° Processo: ${value}`;
        case "type":
          return `Tipo: ${value}`;
        case "presential":
          return `Presencial: ${value ? "Sim" : "Não"}`;
        case "smoker":
          return `Fumador: ${value ? "Sim" : "Não"}`;
        default:
          return "";
      }
    },
    [config.filterValues, config.specialty]
  );

  // Get filter label for display (from local filters in popover)
  const getLocalFilterLabel = useCallback(
    (key: string): string => {
      const value = localFilters[key];
      if (value === undefined || value === "" || value === null) return "";

      switch (key) {
        case "year": {
          const year = value as number;
          return `Ano: ${config.specialty?.code.toUpperCase()}.${year}`;
        }
        case "location":
          return `Local: ${getLocationLabel(value as string)}`;
        case "internship":
          return `Estágio: ${getInternshipLabel(value as string)}`;
        case "sex": {
          const sexField = COMMON_CONSULTATION_FIELDS.find(
            (field) => field.key === "sex"
          );
          const sexOption = sexField?.options?.find(
            (opt) => opt.value === value
          );
          return `Sexo: ${sexOption?.label || value}`;
        }
        case "autonomy": {
          const autonomyField = COMMON_CONSULTATION_FIELDS.find(
            (field) => field.key === "autonomy"
          );
          const autonomyOption = autonomyField?.options?.find(
            (opt) => opt.value === value
          );
          return `Autonomia: ${autonomyOption?.label || value}`;
        }
        case "ageMin": {
          const ageMax = localFilters.ageMax as number | undefined;
          return ageMax
            ? `Idade: ${value}-${ageMax} anos`
            : `Idade: ≥${value} anos`;
        }
        case "ageMax": {
          const ageMin = localFilters.ageMin as number | undefined;
          return ageMin ? "" : `Idade: ≤${value} anos`;
        }
        case "dateFrom": {
          const dateTo = localFilters.dateTo as string | undefined;
          return dateTo
            ? `Data: ${formatDate(value as string)} - ${formatDate(dateTo)}`
            : `Data: ≥${formatDate(value as string)}`;
        }
        case "dateTo": {
          const dateFrom = localFilters.dateFrom as string | undefined;
          return dateFrom ? "" : `Data: ≤${formatDate(value as string)}`;
        }
        case "processNumber":
          return `N° Processo: ${value}`;
        case "type":
          return `Tipo: ${value}`;
        case "presential":
          return `Presencial: ${value ? "Sim" : "Não"}`;
        case "smoker":
          return `Fumador: ${value ? "Sim" : "Não"}`;
        default:
          return "";
      }
    },
    [localFilters, config.specialty]
  );

  // Helper function to remove individual filter (applied filters)
  const removeFilter = useCallback(
    (filterKey: string) => {
      // Use setters to remove filter
      config.filterSetters?.[filterKey]?.(undefined);
      // Handle special cases for age and date ranges
      if (filterKey === "ageMin" || filterKey === "ageMax") {
        config.filterSetters?.ageMin?.(undefined);
        config.filterSetters?.ageMax?.(undefined);
      } else if (filterKey === "dateFrom" || filterKey === "dateTo") {
        config.filterSetters?.dateFrom?.(undefined);
        config.filterSetters?.dateTo?.(undefined);
      }
    },
    [config]
  );

  // Helper function to remove individual local filter (in popover)
  const removeLocalFilter = useCallback((filterKey: string) => {
    // Clear the local filter value
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

  // Only show internship selector when location is not 'health_unit'
  const shouldShowInternship =
    config.enabledFields.includes("internship") &&
    config.internships &&
    config.internships.length > 0 &&
    getFilterValue("location") !== "health_unit";

  // Get field options
  const sexField = COMMON_CONSULTATION_FIELDS.find(
    (field) => field.key === "sex"
  );
  const autonomyField = COMMON_CONSULTATION_FIELDS.find(
    (field) => field.key === "autonomy"
  );
  const typeField = MGF_FIELDS.find((field) => field.key === "type");

  // Render filter badges
  const renderFilterBadges = () => {
    if (!hasActiveFilters) return null;

    const badges: React.ReactElement[] = [];
    const processedKeys = new Set<string>();

    Object.keys(config.filterValues || {}).forEach((key) => {
      if (processedKeys.has(key)) return;

      const value = config.filterValues?.[key];
      if (value === undefined || value === "" || value === null) return;

      // Handle age range
      if (key === "ageMin" || key === "ageMax") {
        if (processedKeys.has("ageMin") || processedKeys.has("ageMax")) return;
        processedKeys.add("ageMin");
        processedKeys.add("ageMax");
        const label = getFilterLabel("ageMin") || getFilterLabel("ageMax");
        if (!label) return;
        badges.push(
          <Badge
            key="age"
            variant="secondary"
            className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
          >
            <span>{label}</span>
            <button
              onClick={() => removeFilter("ageMin")}
              className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        );
        return;
      }

      // Handle date range
      if (key === "dateFrom" || key === "dateTo") {
        if (processedKeys.has("dateFrom") || processedKeys.has("dateTo"))
          return;
        processedKeys.add("dateFrom");
        processedKeys.add("dateTo");
        const label = getFilterLabel("dateFrom") || getFilterLabel("dateTo");
        if (!label) return;
        badges.push(
          <Badge
            key="date"
            variant="secondary"
            className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
          >
            <span>{label}</span>
            <button
              onClick={() => removeFilter("dateFrom")}
              className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        );
        return;
      }

      // Skip ageMax and dateTo if their counterparts exist
      if (key === "ageMax" && config.filterValues?.ageMin) return;
      if (key === "dateTo" && config.filterValues?.dateFrom) return;

      const label = getFilterLabel(key);
      if (!label) return;

      processedKeys.add(key);
      badges.push(
        <Badge
          key={key}
          variant="secondary"
          className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
        >
          <span>{label}</span>
          <button
            onClick={() => removeFilter(key)}
            className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      );
    });

    return badges;
  };

  // Render filter badges from local filters (for inside popover)
  const renderLocalFilterBadges = () => {
    if (!hasLocalActiveFilters) return null;

    const badges: React.ReactElement[] = [];
    const processedKeys = new Set<string>();

    Object.keys(localFilters).forEach((key) => {
      if (processedKeys.has(key)) return;

      const value = localFilters[key];
      if (value === undefined || value === "" || value === null) return;

      // Handle age range
      if (key === "ageMin" || key === "ageMax") {
        if (processedKeys.has("ageMin") || processedKeys.has("ageMax")) return;
        processedKeys.add("ageMin");
        processedKeys.add("ageMax");
        const label =
          getLocalFilterLabel("ageMin") || getLocalFilterLabel("ageMax");
        if (!label) return;
        badges.push(
          <Badge
            key="age"
            variant="secondary"
            className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
          >
            <span>{label}</span>
            <button
              onClick={() => removeLocalFilter("ageMin")}
              className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        );
        return;
      }

      // Handle date range
      if (key === "dateFrom" || key === "dateTo") {
        if (processedKeys.has("dateFrom") || processedKeys.has("dateTo"))
          return;
        processedKeys.add("dateFrom");
        processedKeys.add("dateTo");
        const label =
          getLocalFilterLabel("dateFrom") || getLocalFilterLabel("dateTo");
        if (!label) return;
        badges.push(
          <Badge
            key="date"
            variant="secondary"
            className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
          >
            <span>{label}</span>
            <button
              onClick={() => removeLocalFilter("dateFrom")}
              className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        );
        return;
      }

      // Skip ageMax and dateTo if their counterparts exist
      if (key === "ageMax" && localFilters.ageMin) return;
      if (key === "dateTo" && localFilters.dateFrom) return;

      const label = getLocalFilterLabel(key);
      if (!label) return;

      processedKeys.add(key);
      badges.push(
        <Badge
          key={key}
          variant="secondary"
          className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
        >
          <span>{label}</span>
          <button
            onClick={() => removeLocalFilter(key)}
            className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      );
    });

    return badges;
  };

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
            <div className="flex flex-wrap gap-1.5">
              {renderLocalFilterBadges()}
            </div>
          </div>
        )}

        <div className="space-y-3">
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
                    {Array.from({ length: config.specialty.years }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {config.specialty?.code.toUpperCase()}.{i + 1}
                      </SelectItem>
                    ))}
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

          {/* Location selector */}
          {config.enabledFields.includes("location") &&
            config.locations &&
            config.locations.length > 0 && (
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
                    {config.locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {getLocationLabel(location)}
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
                  {config.internships?.map((internship) => (
                    <SelectItem key={internship} value={internship}>
                      {getInternshipLabel(internship)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Sex selector */}
          {config.enabledFields.includes("sex") && sexField?.options && (
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
                  {sexField.options.map((option) => (
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
            autonomyField?.options && (
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
                    {autonomyField.options.map((option) => (
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
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Idade (anos)
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={(getFilterValue("ageMin") as number | undefined) ?? ""}
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
                  placeholder="Max"
                  value={(getFilterValue("ageMax") as number | undefined) ?? ""}
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
          {config.enabledFields.includes("type") && typeField?.options && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Tipo de Consulta
              </label>
              <Select
                value={(getFilterValue("type") as string) || "all"}
                onValueChange={(value) =>
                  setFilterValue("type", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {typeField.options.map((option) => (
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
                    value === "all" ? undefined : value === "yes" ? true : false
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
                    value === "all" ? undefined : value === "yes" ? true : false
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

          {/* Date range */}
          {config.enabledFields.includes("dateRange") && (
            <div className="space-y-1.5">
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
                    placeholder="dd/mm/aaaa"
                    id="date-from"
                  />
                </div>
                <div className="flex-1">
                  <DatePicker
                    value={(getFilterValue("dateTo") as string) || ""}
                    onChange={(value) =>
                      setFilterValue("dateTo", value || undefined)
                    }
                    placeholder="dd/mm/aaaa"
                    id="date-to"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Active filters displayed on the left (only if badgeLocation is outside) */}
      {config.badgeLocation === "outside" && hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5">{renderFilterBadges()}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              Object.keys(config.filterValues || {}).forEach((key) => {
                config.filterSetters?.[key]?.(undefined);
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
      <div className={config.badgeLocation === "outside" ? "ml-auto" : ""}>
        {/* Filter trigger button */}
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="relative gap-2"
                disabled={isLoading}
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
                disabled={isLoading}
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
