import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  IconFilter,
  IconX,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { useState, useCallback } from "react";
import type {
  MGFConsultationsFilters,
  MGFConsultationsSorting,
} from "@/lib/api/consultations";

interface ConsultationsFiltersProps {
  filters: MGFConsultationsFilters;
  sorting: MGFConsultationsSorting;
  isLoading?: boolean;
  onFiltersChange: (filters: MGFConsultationsFilters) => void;
  onSortingChange: (sorting: MGFConsultationsSorting) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export function ConsultationsFilters({
  filters,
  sorting,
  isLoading = false,
  onFiltersChange,
  onSortingChange,
  onApplyFilters,
  onClearFilters,
}: ConsultationsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof MGFConsultationsFilters] !== undefined
  );

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ""
  ).length;

  const handleClearFilters = () => {
    onClearFilters();
    setIsOpen(false);
  };

  const handleApplyFilters = () => {
    onApplyFilters();
    setIsOpen(false);
  };

  // Helper functions to remove individual filters
  const removeFilter = useCallback(
    (filterKey: keyof MGFConsultationsFilters) => {
      const newFilters = { ...filters };
      delete newFilters[filterKey];
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const getFilterLabel = (key: keyof MGFConsultationsFilters): string => {
    const value = filters[key];
    switch (key) {
      case "sex":
        return `Sexo: ${value === "m" ? "M" : value === "f" ? "F" : "Outro"}`;
      case "healthNumber":
        return `N° Saúde: ${value}`;
      case "processNumber":
        return `N° Processo: ${value}`;
      case "location":
        return `Local: ${value}`;
      case "autonomy":
        return `Autonomia: ${value}`;
      case "ageMin":
        return filters.ageMax
          ? `Idade: ${value}-${filters.ageMax}`
          : `Idade: ≥${value}`;
      case "ageMax":
        return filters.ageMin ? "" : `Idade: ≤${value}`; // Skip if ageMin exists (already shown)
      case "type":
        return `Tipo: ${value}`;
      case "presential":
        return `Presencial: ${value ? "Sim" : "Não"}`;
      case "smoker":
        return `Fumador: ${value ? "Sim" : "Não"}`;
      default:
        return "";
    }
  };

  // Get sorting label for display
  const getSortingLabel = () => {
    const fieldLabels = {
      date: "Data",
      age: "Idade",
      health_number: "N° Saúde",
      process_number: "N° Processo",
    };
    const orderLabel = sorting.order === "asc" ? "↑" : "↓";
    return `${fieldLabels[sorting.field]} ${orderLabel}`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Sort popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            {sorting.order === "asc" ? (
              <IconSortAscending className="h-4 w-4" />
            ) : (
              <IconSortDescending className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{getSortingLabel()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Ordenação</h4>

            {/* Sort field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Ordenar por
              </label>
              <Select
                value={sorting.field}
                onValueChange={(value) =>
                  onSortingChange({
                    ...sorting,
                    field: value as MGFConsultationsSorting["field"],
                  })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="age">Idade</SelectItem>
                  <SelectItem value="health_number">N° Saúde</SelectItem>
                  <SelectItem value="process_number">N° Processo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort order */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Ordem
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={sorting.order === "asc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSortingChange({ ...sorting, order: "asc" })}
                  className="h-8 gap-1.5 px-2"
                >
                  <IconSortAscending className="h-4 w-4" />
                  <span className="text-xs">Crescente</span>
                </Button>
                <Button
                  variant={sorting.order === "desc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSortingChange({ ...sorting, order: "desc" })}
                  className="h-8 gap-1.5 px-2"
                >
                  <IconSortDescending className="h-4 w-4" />
                  <span className="text-xs">Decrescente</span>
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Filter popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="relative"
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
        <PopoverContent className="w-full max-w-md max-h-[80vh]" align="end">
          <div className="flex flex-col max-h-[70vh]">
            <div className="space-y-4 overflow-y-auto pr-1 flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/40 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Filtros</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-6 px-2 text-xs"
                  >
                    <IconX className="h-3 w-3 mr-1" />
                    Limpar Tudo
                  </Button>
                )}
              </div>

              {/* Active filters badges */}
              {hasActiveFilters && (
                <div className="space-y-2 pb-3 border-b">
                  <p className="text-xs text-muted-foreground font-medium">
                    Filtros Ativos:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(filters).map((key) => {
                      const filterKey = key as keyof MGFConsultationsFilters;
                      const label = getFilterLabel(filterKey);

                      // Skip empty labels (like ageMax when ageMin exists)
                      if (!label) return null;

                      return (
                        <Badge
                          key={filterKey}
                          variant="secondary"
                          className="text-xs pr-1 gap-1 group hover:bg-secondary/80"
                        >
                          <span>{label}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Remove both ageMin and ageMax if either is clicked
                              if (
                                filterKey === "ageMin" ||
                                filterKey === "ageMax"
                              ) {
                                const newFilters = { ...filters };
                                delete newFilters.ageMin;
                                delete newFilters.ageMax;
                                onFiltersChange(newFilters);
                              } else {
                                removeFilter(filterKey);
                              }
                            }}
                            className="h-3 w-3 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
                          >
                            <IconX className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {/* Process number filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Número de Processo
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={999999999}
                    value={
                      filters.processNumber
                        ? filters.processNumber?.toString()
                        : ""
                    }
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        processNumber: e.target.value
                          ? e.target.value
                          : undefined,
                      })
                    }
                    className="h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&input-placeholder]:text-muted-foreground"
                  />
                </div>

                {/* Location filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Local
                  </label>
                  <Select
                    value={filters.location || "all"}
                    onValueChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        location: value === "all" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="health_unit">
                        Unidade de Saúde
                      </SelectItem>
                      <SelectItem value="emergency_unit">
                        Serviço de Urgência
                      </SelectItem>
                      <SelectItem value="complementary">
                        Formação Complementar
                      </SelectItem>
                      <SelectItem value="short_course">
                        Formação Curta
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Autonomy filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Autonomia
                  </label>
                  <Select
                    value={filters.autonomy || "all"}
                    onValueChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        autonomy: value === "all" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="partial">Parcial</SelectItem>
                      <SelectItem value="full">Total</SelectItem>
                      <SelectItem value="observed">Observada</SelectItem>
                      <SelectItem value="shoulder-to-shoulder">
                        Ombro-a-ombro
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sex filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Sexo
                  </label>
                  <Select
                    value={filters.sex || "all"}
                    onValueChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        sex: value === "all" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="m">Masculino</SelectItem>
                      <SelectItem value="f">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Health number filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Número de Saúde
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={999999999}
                    value={
                      filters.healthNumber
                        ? filters.healthNumber.toString()
                        : ""
                    }
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        healthNumber: e.target.value
                          ? e.target.value
                          : undefined,
                      })
                    }
                    className="h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                {/* Age range filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Idade (anos)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.ageMin ?? ""}
                      min={0}
                      max={150}
                      onChange={(e) =>
                        onFiltersChange({
                          ...filters,
                          ageMin: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      className="h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.ageMax ?? ""}
                      min={0}
                      max={150}
                      onChange={(e) =>
                        onFiltersChange({
                          ...filters,
                          ageMax: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      className="h-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Type filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Tipo de Consulta
                  </label>
                  <Select
                    value={filters.type || "all"}
                    onValueChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        type: value === "all" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="SA">Saúde Adulto</SelectItem>
                      <SelectItem value="SIJ">
                        Saúde Infantil e Juvenil
                      </SelectItem>
                      <SelectItem value="PF">Planeamento Familiar</SelectItem>
                      <SelectItem value="SM">Saúde Materna</SelectItem>
                      <SelectItem value="DM">Diabetes</SelectItem>
                      <SelectItem value="HTA">Hipertensão Arterial</SelectItem>
                      <SelectItem value="DA">Doença Aguda</SelectItem>
                      <SelectItem value="AM">Acto Médico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Presential filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Presencial
                  </label>
                  <Select
                    value={
                      filters.presential === undefined
                        ? "all"
                        : filters.presential
                        ? "yes"
                        : "no"
                    }
                    onValueChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        presential:
                          value === "all"
                            ? undefined
                            : value === "yes"
                            ? true
                            : false,
                      })
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

                {/* Smoker filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Fumador
                  </label>
                  <Select
                    value={
                      filters.smoker === undefined
                        ? "all"
                        : filters.smoker
                        ? "yes"
                        : "no"
                    }
                    onValueChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        smoker:
                          value === "all"
                            ? undefined
                            : value === "yes"
                            ? true
                            : false,
                      })
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
              </div>
            </div>

            {/* Sticky footer buttons (always visible) */}
            <div className="flex gap-2 pt-2 mt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button size="sm" onClick={handleApplyFilters} className="flex-1">
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
