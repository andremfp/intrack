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
import { Filter, X } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import type { Specialty } from "@/lib/api/specialties";
import { MGF_FIELDS, COMMON_CONSULTATION_FIELDS } from "@/constants";

interface MetricsFiltersProps {
  specialty: Specialty | null;
  selectedYear: number | undefined;
  selectedLocation: string | undefined;
  selectedInternship: string | undefined;
  selectedSex: string | undefined;
  selectedAutonomy: string | undefined;
  selectedAgeMin: number | undefined;
  selectedAgeMax: number | undefined;
  selectedDateFrom: string | undefined;
  selectedDateTo: string | undefined;
  locations: string[];
  internships: string[];
  onSelectedYearChange: (year: number | undefined) => void;
  onSelectedLocationChange: (location: string | undefined) => void;
  onSelectedInternshipChange: (internship: string | undefined) => void;
  onSelectedSexChange: (sex: string | undefined) => void;
  onSelectedAutonomyChange: (autonomy: string | undefined) => void;
  onSelectedAgeMinChange: (ageMin: number | undefined) => void;
  onSelectedAgeMaxChange: (ageMax: number | undefined) => void;
  onSelectedDateFromChange: (dateFrom: string | undefined) => void;
  onSelectedDateToChange: (dateTo: string | undefined) => void;
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

export function MetricsFilters({
  specialty,
  selectedYear,
  selectedLocation,
  selectedInternship,
  selectedSex,
  selectedAutonomy,
  selectedAgeMin,
  selectedAgeMax,
  selectedDateFrom,
  selectedDateTo,
  locations,
  internships,
  onSelectedYearChange,
  onSelectedLocationChange,
  onSelectedInternshipChange,
  onSelectedSexChange,
  onSelectedAutonomyChange,
  onSelectedAgeMinChange,
  onSelectedAgeMaxChange,
  onSelectedDateFromChange,
  onSelectedDateToChange,
}: MetricsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Local state for filter values while editing (only applied on "Aplicar")
  const [localYear, setLocalYear] = useState<number | undefined>(selectedYear);
  const [localLocation, setLocalLocation] = useState<string | undefined>(
    selectedLocation
  );
  const [localInternship, setLocalInternship] = useState<string | undefined>(
    selectedInternship
  );
  const [localSex, setLocalSex] = useState<string | undefined>(selectedSex);
  const [localAutonomy, setLocalAutonomy] = useState<string | undefined>(
    selectedAutonomy
  );
  const [localAgeMin, setLocalAgeMin] = useState<number | undefined>(
    selectedAgeMin
  );
  const [localAgeMax, setLocalAgeMax] = useState<number | undefined>(
    selectedAgeMax
  );
  const [localDateFrom, setLocalDateFrom] = useState<string | undefined>(
    selectedDateFrom
  );
  const [localDateTo, setLocalDateTo] = useState<string | undefined>(
    selectedDateTo
  );

  // Reset local state when popover opens or when props change
  useEffect(() => {
    if (isOpen) {
      setLocalYear(selectedYear);
      setLocalLocation(selectedLocation);
      setLocalInternship(selectedInternship);
      setLocalSex(selectedSex);
      setLocalAutonomy(selectedAutonomy);
      setLocalAgeMin(selectedAgeMin);
      setLocalAgeMax(selectedAgeMax);
      setLocalDateFrom(selectedDateFrom);
      setLocalDateTo(selectedDateTo);
    }
  }, [
    isOpen,
    selectedYear,
    selectedLocation,
    selectedInternship,
    selectedSex,
    selectedAutonomy,
    selectedAgeMin,
    selectedAgeMax,
    selectedDateFrom,
    selectedDateTo,
  ]);

  // Apply filters when "Aplicar" is clicked
  const handleApplyFilters = () => {
    onSelectedYearChange(localYear);
    onSelectedLocationChange(localLocation);
    onSelectedInternshipChange(localInternship);
    onSelectedSexChange(localSex);
    onSelectedAutonomyChange(localAutonomy);
    onSelectedAgeMinChange(localAgeMin);
    onSelectedAgeMaxChange(localAgeMax);
    onSelectedDateFromChange(localDateFrom);
    onSelectedDateToChange(localDateTo);
    setIsOpen(false);
  };

  // Cancel and reset local state
  const handleCancel = () => {
    setLocalYear(selectedYear);
    setLocalLocation(selectedLocation);
    setLocalInternship(selectedInternship);
    setLocalSex(selectedSex);
    setLocalAutonomy(selectedAutonomy);
    setLocalAgeMin(selectedAgeMin);
    setLocalAgeMax(selectedAgeMax);
    setLocalDateFrom(selectedDateFrom);
    setLocalDateTo(selectedDateTo);
    setIsOpen(false);
  };

  // Clear all local filter values (in the popover)
  const handleClearLocalFilters = () => {
    setLocalYear(undefined);
    setLocalLocation(undefined);
    setLocalInternship(undefined);
    setLocalSex(undefined);
    setLocalAutonomy(undefined);
    setLocalAgeMin(undefined);
    setLocalAgeMax(undefined);
    setLocalDateFrom(undefined);
    setLocalDateTo(undefined);
  };

  // Only show internship selector when location is not 'health_unit'
  const shouldShowInternship =
    internships.length > 0 && localLocation !== "health_unit";

  // Get field options
  const sexField = COMMON_CONSULTATION_FIELDS.find(
    (field) => field.key === "sex"
  );
  const autonomyField = COMMON_CONSULTATION_FIELDS.find(
    (field) => field.key === "autonomy"
  );

  // Check if there are any active filters (use actual selected values, not local)
  const hasActiveFilters =
    selectedYear !== undefined ||
    selectedLocation !== undefined ||
    selectedInternship !== undefined ||
    selectedSex !== undefined ||
    selectedAutonomy !== undefined ||
    selectedAgeMin !== undefined ||
    selectedAgeMax !== undefined ||
    selectedDateFrom !== undefined ||
    selectedDateTo !== undefined;

  // Check if there are any local filters active (for clear button in popover)
  const hasLocalActiveFilters =
    localYear !== undefined ||
    localLocation !== undefined ||
    localInternship !== undefined ||
    localSex !== undefined ||
    localAutonomy !== undefined ||
    localAgeMin !== undefined ||
    localAgeMax !== undefined ||
    localDateFrom !== undefined ||
    localDateTo !== undefined;

  // Count active filters (use actual selected values, not local)
  const activeFilterCount = [
    selectedYear !== undefined,
    selectedLocation !== undefined,
    selectedInternship !== undefined,
    selectedSex !== undefined,
    selectedAutonomy !== undefined,
    selectedAgeMin !== undefined,
    selectedAgeMax !== undefined,
    selectedDateFrom !== undefined,
    selectedDateTo !== undefined,
  ].filter(Boolean).length;

  // Helper function to get filter label for display
  const getFilterLabel = useCallback(
    (key: string): string => {
      switch (key) {
        case "year":
          return `Ano: ${specialty?.code.toUpperCase()}.${selectedYear}`;
        case "location":
          return `Local: ${getLocationLabel(selectedLocation!)}`;
        case "internship":
          return `Estágio: ${getInternshipLabel(selectedInternship!)}`;
        case "sex": {
          const sexOption = sexField?.options?.find(
            (opt) => opt.value === selectedSex
          );
          return `Sexo: ${sexOption?.label || selectedSex}`;
        }
        case "autonomy": {
          const autonomyOption = autonomyField?.options?.find(
            (opt) => opt.value === selectedAutonomy
          );
          return `Autonomia: ${autonomyOption?.label || selectedAutonomy}`;
        }
        case "ageMin":
          return selectedAgeMax
            ? `Idade: ${selectedAgeMin}-${selectedAgeMax} anos`
            : `Idade: ≥${selectedAgeMin} anos`;
        case "ageMax":
          return selectedAgeMin ? "" : `Idade: ≤${selectedAgeMax} anos`;
        case "dateFrom":
          return selectedDateTo
            ? `Data: ${formatDate(selectedDateFrom!)} - ${formatDate(
                selectedDateTo!
              )}`
            : `Data: ≥${formatDate(selectedDateFrom!)}`;
        case "dateTo":
          return selectedDateFrom
            ? ""
            : `Data: ≤${formatDate(selectedDateTo!)}`;
        default:
          return "";
      }
    },
    [
      specialty,
      selectedYear,
      selectedLocation,
      selectedInternship,
      selectedSex,
      selectedAutonomy,
      selectedAgeMin,
      selectedAgeMax,
      selectedDateFrom,
      selectedDateTo,
      sexField,
      autonomyField,
    ]
  );

  // Helper function to format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Helper function to clear all filters
  const handleClearFilters = () => {
    onSelectedYearChange(undefined);
    onSelectedLocationChange(undefined);
    onSelectedInternshipChange(undefined);
    onSelectedSexChange(undefined);
    onSelectedAutonomyChange(undefined);
    onSelectedAgeMinChange(undefined);
    onSelectedAgeMaxChange(undefined);
    onSelectedDateFromChange(undefined);
    onSelectedDateToChange(undefined);
  };

  // Helper function to remove individual filter
  const removeFilter = useCallback(
    (filterKey: string) => {
      switch (filterKey) {
        case "year":
          onSelectedYearChange(undefined);
          break;
        case "location":
          onSelectedLocationChange(undefined);
          break;
        case "internship":
          onSelectedInternshipChange(undefined);
          break;
        case "sex":
          onSelectedSexChange(undefined);
          break;
        case "autonomy":
          onSelectedAutonomyChange(undefined);
          break;
        case "ageMin":
        case "ageMax":
          onSelectedAgeMinChange(undefined);
          onSelectedAgeMaxChange(undefined);
          break;
        case "dateFrom":
        case "dateTo":
          onSelectedDateFromChange(undefined);
          onSelectedDateToChange(undefined);
          break;
      }
    },
    [
      onSelectedYearChange,
      onSelectedLocationChange,
      onSelectedInternshipChange,
      onSelectedSexChange,
      onSelectedAutonomyChange,
      onSelectedAgeMinChange,
      onSelectedAgeMaxChange,
      onSelectedDateFromChange,
      onSelectedDateToChange,
    ]
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Active filters displayed on the left */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5">
            {selectedYear !== undefined && (
              <Badge
                variant="secondary"
                className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
              >
                <span>{getFilterLabel("year")}</span>
                <button
                  onClick={() => removeFilter("year")}
                  className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {selectedLocation !== undefined && (
              <Badge
                variant="secondary"
                className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
              >
                <span>{getFilterLabel("location")}</span>
                <button
                  onClick={() => removeFilter("location")}
                  className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {selectedInternship !== undefined && (
              <Badge
                variant="secondary"
                className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
              >
                <span>{getFilterLabel("internship")}</span>
                <button
                  onClick={() => removeFilter("internship")}
                  className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {selectedSex !== undefined && (
              <Badge
                variant="secondary"
                className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
              >
                <span>{getFilterLabel("sex")}</span>
                <button
                  onClick={() => removeFilter("sex")}
                  className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {selectedAutonomy !== undefined && (
              <Badge
                variant="secondary"
                className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
              >
                <span>{getFilterLabel("autonomy")}</span>
                <button
                  onClick={() => removeFilter("autonomy")}
                  className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {(selectedAgeMin !== undefined || selectedAgeMax !== undefined) && (
              <Badge
                variant="secondary"
                className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
              >
                <span>
                  {getFilterLabel(
                    selectedAgeMin !== undefined ? "ageMin" : "ageMax"
                  )}
                </span>
                <button
                  onClick={() => removeFilter("ageMin")}
                  className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
            {(selectedDateFrom !== undefined ||
              selectedDateTo !== undefined) && (
              <Badge
                variant="secondary"
                className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
              >
                <span>
                  {getFilterLabel(
                    selectedDateFrom !== undefined ? "dateFrom" : "dateTo"
                  )}
                </span>
                <button
                  onClick={() => removeFilter("dateFrom")}
                  className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-3 w-3" />
            Limpar
          </Button>
        </div>
      )}

      {/* Filter button and popover on the right */}
      <div className="ml-auto">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative gap-2">
              <Filter className="h-4 w-4" />
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
          <PopoverContent className="w-full max-w-md max-h-[80vh]" align="end">
            <div className="flex flex-col max-h-[70vh]">
              <div className="space-y-4 overflow-y-auto pr-1 flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/40 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Filtros</h4>
                  {hasLocalActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearLocalFilters}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Year selector for multi-year specialties */}
                  {specialty && specialty.years > 1 && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Ano
                      </label>
                      <Select
                        value={localYear?.toString() || "all"}
                        onValueChange={(value) =>
                          setLocalYear(
                            value === "all" ? undefined : parseInt(value)
                          )
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Todos os anos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os anos</SelectItem>
                          {Array.from({ length: specialty.years }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {specialty.code.toUpperCase()}.{i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Location selector */}
                  {locations.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Local
                      </label>
                      <Select
                        value={localLocation || "all"}
                        onValueChange={(value) =>
                          setLocalLocation(value === "all" ? undefined : value)
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os locais</SelectItem>
                          {locations.map((location) => (
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
                        value={localInternship || "all"}
                        onValueChange={(value) =>
                          setLocalInternship(
                            value === "all" ? undefined : value
                          )
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os estágios</SelectItem>
                          {internships.map((internship) => (
                            <SelectItem key={internship} value={internship}>
                              {getInternshipLabel(internship)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Sex selector */}
                  {sexField?.options && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Sexo
                      </label>
                      <Select
                        value={localSex || "all"}
                        onValueChange={(value) =>
                          setLocalSex(value === "all" ? undefined : value)
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
                  {autonomyField?.options && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Autonomia
                      </label>
                      <Select
                        value={localAutonomy || "all"}
                        onValueChange={(value) =>
                          setLocalAutonomy(value === "all" ? undefined : value)
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
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Idade (anos)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={localAgeMin ?? ""}
                        min={0}
                        max={150}
                        onChange={(e) =>
                          setLocalAgeMin(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                        className="h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={localAgeMax ?? ""}
                        min={0}
                        max={150}
                        onChange={(e) =>
                          setLocalAgeMax(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                        className="h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  {/* Date range */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Data
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <DatePicker
                          value={localDateFrom || ""}
                          onChange={(value) =>
                            setLocalDateFrom(value || undefined)
                          }
                          placeholder="dd/mm/aaaa"
                          id="date-from"
                        />
                      </div>
                      <div className="flex-1">
                        <DatePicker
                          value={localDateTo || ""}
                          onChange={(value) =>
                            setLocalDateTo(value || undefined)
                          }
                          placeholder="dd/mm/aaaa"
                          id="date-to"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky footer buttons (always visible) */}
              <div className="flex gap-2 pt-2 mt-2 border-t">
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
      </div>
    </div>
  );
}
