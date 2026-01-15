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
  getFieldOptions,
  generatePrettyFilterLabel,
  buildFilterBadgeConfigs,
  hasValue,
  type FiltersRecord,
} from "./helpers";
import type { SpecialtyFieldOption } from "@/constants";
import {
  CodeSearchField,
  type CodeSearchItem,
} from "@/components/forms/consultation/fields/code-search-field";
import { PROFESSIONS } from "@/professions";
import { MGF_FIELDS, MGF_SECTION_LABELS } from "@/constants";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";

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

  // Get field options dynamically
  const fieldOptions = useMemo(() => {
    const options: Record<string, SpecialtyFieldOption[]> = {};
    const fieldKeys = [
      "sex",
      "autonomy",
      "location",
      "internship",
      "type",
      "contraceptive",
      "new_contraceptive",
      "smoker",
      "family_type",
      "school_level",
      "profession",
      "professional_situation",
      "vaccination_plan",
    ];

    fieldKeys.forEach((key) => {
      options[key] = getFieldOptions(key);
    });

    return options;
  }, []);

  // Show internship selector when enabled and options exist
  const shouldShowInternship =
    config.enabledFields.includes("internship") &&
    fieldOptions.internship &&
    fieldOptions.internship.length > 0;

  // Helper to get section for a filter field
  const getFieldSection = (fieldKey: string): string | null => {
    const field = MGF_FIELDS.find((f) => f.key === fieldKey);
    return field?.section || null;
  };

  // Group enabled fields by section
  const fieldsBySection = useMemo(() => {
    const sections: Record<string, string[]> = {
      _general: [], // Fields without a section
    };

    config.enabledFields.forEach((fieldKey) => {
      // Handle composite fields
      if (fieldKey === "ageRange") {
        sections._general.push("ageRange");
      } else if (fieldKey === "dateRange") {
        sections._general.push("dateRange");
      } else {
        const section = getFieldSection(fieldKey);
        if (section) {
          if (!sections[section]) {
            sections[section] = [];
          }
          sections[section].push(fieldKey);
        } else {
          sections._general.push(fieldKey);
        }
      }
    });

    return sections;
  }, [config.enabledFields]);

  // Section order for display
  const sectionOrder = [
    "_general",
    "consultation_info",
    "patient_info",
    "clinical_history",
    "family_planning",
  ];

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

  // Helper function to normalize SpecialtyFieldOption[] to ComboboxOption[]
  const normalizeOptions = useMemo(
    () =>
      (options: SpecialtyFieldOption[]): ComboboxOption[] => {
        return options
          .map((option) => {
            const val =
              "value" in option
                ? option.value
                : "code" in option
                ? option.code
                : undefined;
            const label =
              "label" in option
                ? option.label
                : "description" in option
                ? option.description
                : "";
            return { val, label };
          })
          .filter(
            (item): item is { val: string; label: string } =>
              item.val !== undefined && item.label !== undefined
          )
          .map((item) => ({ value: item.val, label: item.label }));
      },
    []
  );

  // Helper component for combobox filter
  const ComboboxFilter = ({
    label,
    options,
    placeholder,
    value,
    onChange,
    allLabel = "Todos",
  }: {
    label: string;
    options: SpecialtyFieldOption[];
    placeholder?: string;
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    allLabel?: string;
  }) => {
    const normalizedOptions = normalizeOptions(options);

    return (
      <Combobox
        options={normalizedOptions}
        value={value}
        onSelect={onChange}
        placeholder={allLabel}
        searchPlaceholder={placeholder || `Pesquisar ${label.toLowerCase()}...`}
        buttonClassName="h-8"
        showAllOption={true}
        allOptionLabel={allLabel}
      />
    );
  };

  // Helper function to render a single field
  const renderField = (fieldKey: string) => {
    switch (fieldKey) {
      case "year":
        if (
          !config.enabledFields.includes("year") ||
          !config.specialty ||
          config.specialty.years <= 1
        ) {
          return null;
        }
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Ano
            </label>
            <Select
              value={
                (getFilterValue("year") as number | undefined)?.toString() ||
                "all"
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
        );

      case "processNumber":
        if (!config.enabledFields.includes("processNumber")) return null;
        return (
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
        );

      case "dateRange":
        if (!config.enabledFields.includes("dateRange")) return null;
        return (
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
        );

      case "ageRange":
        if (!config.enabledFields.includes("ageRange")) return null;
        return (
          <div className="space-y-1.5 sm:col-span-2">
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
                placeholder="Máx"
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
        );

      case "location":
        if (!config.enabledFields.includes("location")) return null;
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Local
            </label>
            <Select
              value={(getFilterValue("location") as string) || "all"}
              onValueChange={(value) =>
                setFilterValue("location", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os locais</SelectItem>
                {fieldOptions.location
                  .map((option) => {
                    const val =
                      "value" in option
                        ? option.value
                        : "code" in option
                        ? option.code
                        : undefined;
                    const label =
                      "label" in option
                        ? option.label
                        : "description" in option
                        ? option.description
                        : "";
                    return { val, label, option };
                  })
                  .filter(
                    (
                      item
                    ): item is {
                      val: string;
                      label: string;
                      option: SpecialtyFieldOption;
                    } => item.val !== undefined
                  )
                  .map((item) => (
                    <SelectItem key={item.val} value={item.val}>
                      {item.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "internship":
        if (!shouldShowInternship) return null;
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Estágio
            </label>
            <ComboboxFilter
              label="Estágio"
              options={fieldOptions.internship}
              value={getFilterValue("internship") as string | undefined}
              onChange={(value) => setFilterValue("internship", value)}
              allLabel="Todos os estágios"
            />
          </div>
        );

      case "sex":
        if (
          !config.enabledFields.includes("sex") ||
          fieldOptions.sex.length === 0
        )
          return null;
        return (
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
                {fieldOptions.sex
                  .map((option) => {
                    const val =
                      "value" in option
                        ? option.value
                        : "code" in option
                        ? option.code
                        : undefined;
                    const label =
                      "label" in option
                        ? option.label
                        : "description" in option
                        ? option.description
                        : "";
                    return { val, label, option };
                  })
                  .filter(
                    (
                      item
                    ): item is {
                      val: string;
                      label: string;
                      option: SpecialtyFieldOption;
                    } => item.val !== undefined
                  )
                  .map((item) => (
                    <SelectItem key={item.val} value={item.val}>
                      {item.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "autonomy":
        if (
          !config.enabledFields.includes("autonomy") ||
          fieldOptions.autonomy.length === 0
        )
          return null;
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Autonomia
            </label>
            <Select
              value={(getFilterValue("autonomy") as string) || "all"}
              onValueChange={(value) =>
                setFilterValue("autonomy", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {fieldOptions.autonomy
                  .map((option) => {
                    const val =
                      "value" in option
                        ? option.value
                        : "code" in option
                        ? option.code
                        : undefined;
                    const label =
                      "label" in option
                        ? option.label
                        : "description" in option
                        ? option.description
                        : "";
                    return { val, label, option };
                  })
                  .filter(
                    (
                      item
                    ): item is {
                      val: string;
                      label: string;
                      option: SpecialtyFieldOption;
                    } => item.val !== undefined
                  )
                  .map((item) => (
                    <SelectItem key={item.val} value={item.val}>
                      {item.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "type":
        if (
          !config.enabledFields.includes("type") ||
          fieldOptions.type.length === 0
        )
          return null;
        return (
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
                {fieldOptions.type
                  .map((option) => {
                    const val =
                      "value" in option
                        ? option.value
                        : "code" in option
                        ? option.code
                        : undefined;
                    const label =
                      "label" in option
                        ? option.label
                        : "description" in option
                        ? option.description
                        : "";
                    return { val, label, option };
                  })
                  .filter(
                    (
                      item
                    ): item is {
                      val: string;
                      label: string;
                      option: SpecialtyFieldOption;
                    } => item.val !== undefined
                  )
                  .map((item) => (
                    <SelectItem key={item.val} value={item.val}>
                      {item.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "presential":
        if (!config.enabledFields.includes("presential")) return null;
        return (
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
        );

      case "smoker":
        if (
          !config.enabledFields.includes("smoker") ||
          fieldOptions.smoker.length === 0
        )
          return null;
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Fumador
            </label>
            <Select
              value={(getFilterValue("smoker") as string) || "all"}
              onValueChange={(value) =>
                setFilterValue("smoker", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {fieldOptions.smoker
                  .map((option) => {
                    const val =
                      "value" in option
                        ? option.value
                        : "code" in option
                        ? option.code
                        : undefined;
                    const label =
                      "label" in option
                        ? option.label
                        : "description" in option
                        ? option.description
                        : "";
                    return { val, label, option };
                  })
                  .filter(
                    (
                      item
                    ): item is {
                      val: string;
                      label: string;
                      option: SpecialtyFieldOption;
                    } => item.val !== undefined
                  )
                  .map((item) => (
                    <SelectItem key={item.val} value={item.val}>
                      {item.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "contraceptive":
        if (
          !config.enabledFields.includes("contraceptive") ||
          fieldOptions.contraceptive.length === 0
        )
          return null;
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Contraceptivo
            </label>
            <ComboboxFilter
              label="Contraceptivo"
              options={fieldOptions.contraceptive}
              value={getFilterValue("contraceptive") as string | undefined}
              onChange={(value) => setFilterValue("contraceptive", value)}
            />
          </div>
        );

      case "new_contraceptive":
        if (
          !config.enabledFields.includes("new_contraceptive") ||
          fieldOptions.new_contraceptive.length === 0
        )
          return null;
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Novo Contraceptivo
            </label>
            <ComboboxFilter
              label="Novo Contraceptivo"
              options={fieldOptions.new_contraceptive}
              value={getFilterValue("new_contraceptive") as string | undefined}
              onChange={(value) => setFilterValue("new_contraceptive", value)}
            />
          </div>
        );

      case "family_type":
        if (
          !config.enabledFields.includes("family_type") ||
          fieldOptions.family_type.length === 0
        )
          return null;
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Tipologia de Família
            </label>
            <ComboboxFilter
              label="Tipologia de Família"
              options={fieldOptions.family_type}
              value={getFilterValue("family_type") as string | undefined}
              onChange={(value) => setFilterValue("family_type", value)}
            />
          </div>
        );

      case "school_level":
        if (
          !config.enabledFields.includes("school_level") ||
          fieldOptions.school_level.length === 0
        )
          return null;
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Escolaridade
            </label>
            <ComboboxFilter
              label="Escolaridade"
              options={fieldOptions.school_level}
              value={getFilterValue("school_level") as string | undefined}
              onChange={(value) => setFilterValue("school_level", value)}
            />
          </div>
        );

      case "profession":
        if (!config.enabledFields.includes("profession")) return null;
        return (
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">
              Profissão
            </label>
            <div className="[&_label]:hidden [&_.space-y-2]:space-y-1.5 [&_input]:h-8 [&_button]:h-auto [&_button]:py-1">
              <CodeSearchField
                field={MGF_FIELDS.find((f) => f.key === "profession")!}
                value={(getFilterValue("profession") as string) || ""}
                onUpdate={(value) =>
                  setFilterValue(
                    "profession",
                    typeof value === "string" && value ? value : undefined
                  )
                }
                items={PROFESSIONS as CodeSearchItem[]}
                mode="single"
                codeMinWidth="4rem"
              />
            </div>
          </div>
        );

      case "professional_situation":
        if (
          !config.enabledFields.includes("professional_situation") ||
          !fieldOptions.professional_situation ||
          fieldOptions.professional_situation.length === 0
        )
          return null;
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Situação Profissional
            </label>
            <Select
              value={
                (getFilterValue("professional_situation") as string) || "all"
              }
              onValueChange={(value) =>
                setFilterValue(
                  "professional_situation",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {fieldOptions.professional_situation
                  .map((option) => {
                    const val =
                      "value" in option
                        ? option.value
                        : "code" in option
                        ? option.code
                        : undefined;
                    const label =
                      "label" in option
                        ? option.label
                        : "description" in option
                        ? option.description
                        : "";
                    return { val, label, option };
                  })
                  .filter(
                    (
                      item
                    ): item is {
                      val: string;
                      label: string;
                      option: SpecialtyFieldOption;
                    } => item.val !== undefined
                  )
                  .map((item) => (
                    <SelectItem key={item.val} value={item.val}>
                      {item.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "vaccination_plan":
        if (!config.enabledFields.includes("vaccination_plan")) return null;
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              PNV Cumprido
            </label>
            <Select
              value={
                getFilterValue("vaccination_plan") === undefined
                  ? "all"
                  : getFilterValue("vaccination_plan")
                  ? "yes"
                  : "no"
              }
              onValueChange={(value) =>
                setFilterValue(
                  "vaccination_plan",
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
        );

      case "alcohol":
        if (!config.enabledFields.includes("alcohol")) return null;
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Alcoól
            </label>
            <Select
              value={
                getFilterValue("alcohol") === undefined
                  ? "all"
                  : getFilterValue("alcohol")
                  ? "yes"
                  : "no"
              }
              onValueChange={(value) =>
                setFilterValue(
                  "alcohol",
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
        );

      case "drugs":
        if (!config.enabledFields.includes("drugs")) return null;
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Drogas
            </label>
            <Select
              value={
                getFilterValue("drugs") === undefined
                  ? "all"
                  : getFilterValue("drugs")
                  ? "yes"
                  : "no"
              }
              onValueChange={(value) =>
                setFilterValue(
                  "drugs",
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
        );

      default:
        return null;
    }
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
            <div className="flex flex-wrap gap-1.5">{localFilterBadges}</div>
          </div>
        )}

        <div className="space-y-4">
          {sectionOrder
            .filter((sectionKey) => fieldsBySection[sectionKey]?.length > 0)
            .map((sectionKey) => {
              const fields = fieldsBySection[sectionKey];
              const sectionLabel =
                sectionKey === "_general"
                  ? null
                  : MGF_SECTION_LABELS[sectionKey] || sectionKey;

              return (
                <div key={sectionKey} className="space-y-3">
                  {sectionLabel && (
                    <div className="border-b pb-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {sectionLabel}
                      </h3>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fields.map((fieldKey) => (
                      <div key={fieldKey}>{renderField(fieldKey)}</div>
                    ))}
                  </div>
                </div>
              );
            })}
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
