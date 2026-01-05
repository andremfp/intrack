import type {
  FilterUIConfig,
  FilterFieldType,
} from "@/components/filters/types";
import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationsFilters } from "@/lib/api/consultations";
import { COMMON_CONSULTATION_FIELDS, MGF_FIELDS } from "@/constants";
import type { SpecialtyFieldOption } from "@/constants";

// Re-export for convenience
export type { ConsultationsFilters } from "@/lib/api/consultations";

/**
 * Type for filter setter functions
 */
type FilterSetter = (value: unknown) => void;

/**
 * Type for a record of filter setters
 */
export type FilterSetters = Record<string, FilterSetter>;

export type FiltersRecord = Record<string, unknown>;

export const hasValue = (value: unknown) =>
  value !== undefined && value !== "" && value !== null;

/**
 * Simple debounce utility for filter inputs
 * Delays execution until after wait milliseconds have passed since the last call
 */
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | null = null;
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export interface FilterBadgeConfig {
  id: string;
  label: string;
  removeKey: string;
}

/**
 * Options for creating filter setters using setFilter function (unified API)
 * Specialized to ConsultationsFilters for simplicity.
 */
interface CreateFilterSettersFromSetFilterOptions {
  setFilter: <K extends keyof ConsultationsFilters>(
    key: K,
    value: ConsultationsFilters[K]
  ) => void;
  fields?: Array<keyof ConsultationsFilters>;
}

/**
 * Helper to determine the type of a filter field for type coercion
 */
function getFieldType(field: string): "string" | "number" | "boolean" {
  if (
    field === "ageMin" ||
    field === "ageMax" ||
    field === "year"
  ) {
    return "number";
  }
  if (field === "presential") {
    return "boolean";
  }
  return "string";
}

/**
 * Maps UI filter field types to their underlying filter keys.
 * Composite fields like "ageRange" map to multiple actual filter keys.
 */
function mapEnabledFieldsToSetterFields(
  enabledFields: FilterFieldType[]
): string[] {
  const setterFields: string[] = [];

  for (const field of enabledFields) {
    switch (field) {
      case "ageRange":
        setterFields.push("ageMin", "ageMax");
        break;
      case "dateRange":
        setterFields.push("dateFrom", "dateTo");
        break;
      case "year":
      case "location":
      case "internship":
      case "sex":
      case "autonomy":
      case "processNumber":
      case "type":
      case "presential":
      case "smoker":
      case "contraceptive":
      case "new_contraceptive":
      case "family_type":
      case "school_level":
      case "professional_area":
      case "profession":
      case "vaccination_plan":
        setterFields.push(field);
        break;
    }
  }

  return setterFields;
}

/**
 * Creates a set of filter setters from a setFilter function.
 *
 * This helper eliminates duplicate code across multiple components that
 * manually create filter setters.
 *
 * @param options - setFilter function and optional fields
 * @returns A record of filter setter functions, or undefined if no handler provided
 */
export function createFilterSetters(
  options: CreateFilterSettersFromSetFilterOptions
): FilterSetters | undefined {
  const { setFilter, fields } = options;
  if (!setFilter || !fields || fields.length === 0) {
    return undefined;
  }

  const setters: FilterSetters = {};
  for (const field of fields) {
    const fieldName = String(field);
    const fieldType = getFieldType(fieldName);

    // Create the base setter function with type coercion
    const baseSetter = (value: unknown) => {
      let coercedValue: unknown = value;

      // Coerce value to appropriate type
      if (fieldType === "number") {
        coercedValue = value === "" || value === undefined || value === null
          ? undefined
          : Number(value);
      } else if (fieldType === "boolean") {
        coercedValue = value === undefined || value === null
          ? undefined
          : Boolean(value);
      } else {
        coercedValue = value === "" || value === undefined || value === null
          ? undefined
          : String(value);
      }

      setFilter(field as keyof ConsultationsFilters, coercedValue as never);
    };

    // Apply debouncing to text inputs to prevent excessive API calls
    // Use 300ms debounce for text inputs, no debounce for selects/dates
    if (fieldType === "string" && ["internship", "location", "processNumber"].includes(fieldName)) {
      setters[fieldName] = debounce(baseSetter, 300);
    } else {
      setters[fieldName] = baseSetter;
    }
  }
  return setters;
}

/**
 * Options for creating filter config using setFilter function (unified API)
 * Specialized to ConsultationsFilters.
 */
interface CreateFilterConfigOptions {
  enabledFields: FilterFieldType[];
  badgeLocation: "inside" | "outside";
  filterValues: ConsultationsFilters;
  setFilter: <K extends keyof ConsultationsFilters>(
    key: K,
    value: ConsultationsFilters[K]
  ) => void;
  // Metrics-specific options
  specialty?: Specialty | null;
  // Optional: override auto-derived setterFields
  setterFields?: Array<keyof ConsultationsFilters>;
}

/**
 * Creates a complete FilterUIConfig object from a setFilter function.
 *
 * This helper eliminates duplicate code across multiple components that
 * manually create filter config objects.
 * Automatically derives setterFields from enabledFields if not provided.
 *
 * @param options - Configuration options for creating the filter config
 * @returns A complete FilterUIConfig object, or null if required handlers are missing
 */
export function createFilterConfig(
  options: CreateFilterConfigOptions
): FilterUIConfig | null {
  const {
    enabledFields,
    badgeLocation,
    filterValues,
    setFilter,
    specialty,
    setterFields: providedSetterFields,
  } = options;

  if (!setFilter) {
    return null;
  }

  // Auto-derive setterFields from enabledFields if not provided
  const derivedSetterFields = mapEnabledFieldsToSetterFields(enabledFields);
  // Cast is safe because enabledFields should only include fields valid for the filter type
  const setterFields: Array<keyof ConsultationsFilters> = (
    providedSetterFields ?? derivedSetterFields
  ) as Array<keyof ConsultationsFilters>;

  const filterSetters = createFilterSetters({
    setFilter,
    fields: setterFields,
  });

  if (!filterSetters) {
    return null;
  }

  return {
    enabledFields,
    badgeLocation,
    specialty,
    filterValues,
    filterSetters,
  };
}

// Helper functions for labels
export function getInternshipLabel(value: string): string {
  return getFieldLabel("internship", value);
}

export function getLocationLabel(value: string): string {
  return getFieldLabel("location", value);
}

export function getContraceptiveLabel(value: string): string {
  return getFieldLabel("contraceptive", value);
}

export function getNewContraceptiveLabel(value: string): string {
  return getFieldLabel("new_contraceptive", value);
}

export function getFamilyTypeLabel(value: string): string {
  return getFieldLabel("family_type", value);
}

export function getSchoolLevelLabel(value: string): string {
  return getFieldLabel("school_level", value);
}

export function getProfessionalAreaLabel(value: string): string {
  return getFieldLabel("professional_area", value);
}

export function getProfessionLabel(value: string): string {
  return getFieldLabel("profession", value);
}

export function getVaccinationPlanLabel(value: string): string {
  return getFieldLabel("vaccination_plan", value);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Badge helpers (logic-only, UI rendering stays in TSX)

export function buildFilterBadgeConfigs(params: {
  values: FiltersRecord;
  getLabel: (key: string) => string;
}): FilterBadgeConfig[] {
  const { values, getLabel } = params;
  const badges: FilterBadgeConfig[] = [];
  const processedKeys = new Set<string>();

  Object.keys(values).forEach((key) => {
    if (processedKeys.has(key)) return;

    const value = values[key];
    if (!hasValue(value)) return;

    // Handle age range as a single badge
    if (key === "ageMin" || key === "ageMax") {
      if (processedKeys.has("ageMin") || processedKeys.has("ageMax")) return;
      processedKeys.add("ageMin");
      processedKeys.add("ageMax");

      const label = getLabel("ageMin") || getLabel("ageMax");
      if (!label) return;

      badges.push({
        id: "age",
        label,
        removeKey: "ageMin",
      });
      return;
    }

    // Handle date range as a single badge
    if (key === "dateFrom" || key === "dateTo") {
      if (processedKeys.has("dateFrom") || processedKeys.has("dateTo")) return;
      processedKeys.add("dateFrom");
      processedKeys.add("dateTo");

      const label = getLabel("dateFrom") || getLabel("dateTo");
      if (!label) return;

      badges.push({
        id: "date",
        label,
        removeKey: "dateFrom",
      });
      return;
    }

    // Skip secondary range keys when primary is present
    if (key === "ageMax" && hasValue(values.ageMin)) return;
    if (key === "dateTo" && hasValue(values.dateFrom)) return;

    const label = getLabel(key);
    if (!label) return;

    processedKeys.add(key);
    badges.push({
      id: key,
      label,
      removeKey: key,
    });
  });

  return badges;
}

// Generic field helpers
export function getFieldOptions(fieldKey: string): SpecialtyFieldOption[] {
  // Search in COMMON_CONSULTATION_FIELDS first, then MGF_FIELDS
  const commonField = COMMON_CONSULTATION_FIELDS.find((field) => field.key === fieldKey);
  if (commonField?.options) {
    return commonField.options;
  }

  const mgfField = MGF_FIELDS.find((field) => field.key === fieldKey);
  return mgfField?.options || [];
}

export function getFieldLabel(fieldKey: string, value: string): string {
  // Search in COMMON_CONSULTATION_FIELDS first, then MGF_FIELDS
  const commonField = COMMON_CONSULTATION_FIELDS.find((field) => field.key === fieldKey);
  if (commonField?.options) {
    const option = commonField.options.find((opt) => opt.value === value);
    return option?.label || value;
  }

  const mgfField = MGF_FIELDS.find((field) => field.key === fieldKey);
  if (mgfField?.options) {
    const option = mgfField.options.find((opt) => opt.value === value);
    return option?.label || value;
  }

  return value;
}


// Helper to get field metadata
function getFieldMetadata(fieldKey: string): { label: string; hasOptions: boolean } | null {
  // Search in COMMON_CONSULTATION_FIELDS first, then MGF_FIELDS
  const commonField = COMMON_CONSULTATION_FIELDS.find((field) => field.key === fieldKey);
  if (commonField) {
    return {
      label: commonField.label,
      hasOptions: !!commonField.options?.length,
    };
  }

  const mgfField = MGF_FIELDS.find((field) => field.key === fieldKey);
  if (mgfField) {
    return {
      label: mgfField.label,
      hasOptions: !!mgfField.options?.length,
    };
  }

  return null;
}

// Unified display label helper
export function generatePrettyFilterLabel(
  key: string,
  value: unknown,
  specialty?: Specialty | null,
  otherValues?: Record<string, unknown>
): string {
  if (value === undefined || value === "" || value === null) return "";

  // Special cases that need custom handling
  switch (key) {
    case "year": {
      const year = value as number;
      return `Ano: ${specialty?.code.toUpperCase()}.${year}`;
    }
    case "ageMin": {
      const ageMax = otherValues?.ageMax as number | undefined;
      return ageMax
        ? `Idade: ${value}-${ageMax} anos`
        : `Idade: ≥${value} anos`;
    }
    case "ageMax": {
      const ageMin = otherValues?.ageMin as number | undefined;
      return ageMin ? "" : `Idade: ≤${value} anos`;
    }
    case "dateFrom": {
      const dateTo = otherValues?.dateTo as string | undefined;
      return dateTo
        ? `Data: ${formatDate(value as string)} - ${formatDate(dateTo)}`
        : `Data: ≥${formatDate(value as string)}`;
    }
    case "dateTo": {
      const dateFrom = otherValues?.dateFrom as string | undefined;
      return dateFrom ? "" : `Data: ≤${formatDate(value as string)}`;
    }
    case "processNumber":
      return `N° Processo: ${value}`;
    case "presential":
      return `Presencial: ${value ? "Sim" : "Não"}`;
    default: {
      // Generic case for fields with options or simple text fields
      const metadata = getFieldMetadata(key);
      if (metadata) {
        const displayValue = metadata.hasOptions
          ? getFieldLabel(key, value as string)
          : (value as string);
        return `${metadata.label}: ${displayValue}`;
      }
      return "";
    }
  }
}
