import type {
  FilterUIConfig,
  FilterFieldType,
} from "@/components/filters/types";
import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationsFilters } from "@/lib/api/consultations";
import { 
  TAB_CONSTANTS, 
  COMMON_CONSULTATION_FIELDS, 
  MGF_FIELDS, 
} from "@/constants";
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

/**
 * Options for creating filter setters using setFilter function (unified API)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CreateFilterSettersFromSetFilterOptions<T extends Record<string, any> = any> {
  setFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  fields?: Array<keyof T>;
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
  if (field === "presential" || field === "smoker") {
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createFilterSetters<T extends Record<string, any>>(
  options: CreateFilterSettersFromSetFilterOptions<T>
): FilterSetters | undefined {
  const { setFilter, fields } = options;
  if (!setFilter || !fields || fields.length === 0) {
    return undefined;
  }

  const setters: FilterSetters = {};
  for (const field of fields) {
    const fieldName = String(field);
    const fieldType = getFieldType(fieldName);
    
    setters[fieldName] = (value) => {
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
      
      setFilter(field, coercedValue as T[keyof T]);
    };
  }
  return setters;
}

/**
 * Options for creating filter config using setFilter function (unified API)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CreateFilterConfigFromSetFilterOptions<T extends Record<string, any> = any> {
  enabledFields: FilterFieldType[];
  badgeLocation: "inside" | "outside";
  filterValues: Record<string, unknown>;
  setFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  // Metrics-specific options
  specialty?: Specialty | null;
  // Optional: override auto-derived setterFields
  setterFields?: Array<keyof T>;
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createFilterConfig<T extends Record<string, any> = ConsultationsFilters>(
  options: CreateFilterConfigFromSetFilterOptions<T>
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
  const setterFields: Array<keyof T> = (providedSetterFields ?? derivedSetterFields) as Array<keyof T>;

  const filterSetters = createFilterSetters<T>({
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

/**
 * Generates the localStorage key for persisting consultations filters.
 * Uses a consistent pattern: consultations-filters-{specialtyYear}
 * 
 * specialtyYear should always be set for Consultas tabs (parsed from tab string like "Consultas.1").
 * If somehow it's undefined, uses 1 as a fallback (shouldn't happen in practice).
 */
export function getConsultationsFiltersKey(
  specialtyYear: number | undefined,
  mainTab: string
): string {
  // For Consultas tab, use specialty year (or 1 as fallback)
  if (mainTab === TAB_CONSTANTS.MAIN_TABS.CONSULTATIONS) {
    const year = specialtyYear ?? 1;
    return `consultations-filters-${year}`;
  }
  
  // For other tabs, return a key that won't interfere
  // (Filters won't be used anyway when not on Consultas tab)
  return `consultations-filters-other`;
}

// Helper functions for labels

export function getInternshipLabel(value: string): string {
  const internshipField = MGF_FIELDS.find(
    (field) => field.key === "internship"
  );
  if (!internshipField?.options) return value;
  const option = internshipField.options.find((opt) => opt.value === value);
  return option?.label || value;
}

export function getLocationLabel(value: string): string {
  const locationField = COMMON_CONSULTATION_FIELDS.find(
    (field) => field.key === "location"
  );
  if (!locationField?.options) return value;
  const option = locationField.options.find((opt) => opt.value === value);
  return option?.label || value;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getSexLabel(value: string): string {
  const sexField = COMMON_CONSULTATION_FIELDS.find(
    (field) => field.key === "sex"
  );
  const sexOption = sexField?.options?.find(
    (opt) => opt.value === value
  );
  return sexOption?.label || value;
}

export function getAutonomyLabel(value: string): string {
  const autonomyField = COMMON_CONSULTATION_FIELDS.find(
    (field) => field.key === "autonomy"
  );
  const autonomyOption = autonomyField?.options?.find(
    (opt) => opt.value === value
  );
  return autonomyOption?.label || value;
}

// Field options helpers
export function getSexOptions(): SpecialtyFieldOption[] {
  return COMMON_CONSULTATION_FIELDS.find((field) => field.key === "sex")?.options || [];
}

export function getAutonomyOptions(): SpecialtyFieldOption[] {
  return COMMON_CONSULTATION_FIELDS.find((field) => field.key === "autonomy")?.options || [];
}

export function getLocationOptions(): SpecialtyFieldOption[] {
  return COMMON_CONSULTATION_FIELDS.find((field) => field.key === "location")?.options || [];
}

export function getInternshipOptions(): SpecialtyFieldOption[] {
  return MGF_FIELDS.find((field) => field.key === "internship")?.options || [];
}

export function getTypeOptions(): SpecialtyFieldOption[] {
  return MGF_FIELDS.find((field) => field.key === "type")?.options || [];
}

// Unified display label helper
export function getFilterDisplayLabel(
  key: string,
  value: unknown,
  specialty?: Specialty | null,
  otherValues?: Record<string, unknown>
): string {
  if (value === undefined || value === "" || value === null) return "";

  switch (key) {
    case "year": {
      const year = value as number;
      return `Ano: ${specialty?.code.toUpperCase()}.${year}`;
    }
    case "location":
      return `Local: ${getLocationLabel(value as string)}`;
    case "internship":
      return `Estágio: ${getInternshipLabel(value as string)}`;
    case "sex":
      return `Sexo: ${getSexLabel(value as string)}`;
    case "autonomy":
      return `Autonomia: ${getAutonomyLabel(value as string)}`;
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
    case "type":
      return `Tipo: ${value}`;
    case "presential":
      return `Presencial: ${value ? "Sim" : "Não"}`;
    case "smoker":
      return `Fumador: ${value ? "Sim" : "Não"}`;
    default:
      return "";
  }
}
