import { MGF_FIELDS } from "@/constants";
import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationMetrics } from "@/lib/api/consultations";

// Helper to get label from field options
export function getFieldLabel(fieldKey: string, value: string): string {
  const field = MGF_FIELDS.find((f) => f.key === fieldKey);
  if (field && field.options) {
    const option = field.options.find((opt) => {
      const optValue = "value" in opt ? opt.value : "code" in opt ? opt.code : undefined;
      return optValue === value;
    });
    if (option) {
      const label = "label" in option ? option.label : "description" in option ? option.description : undefined;
      return label ?? value;
    }
  }
  return value;
}

// Helper to map sex codes to labels
export function getSexLabel(sex: string): string {
  const sexLabels: Record<string, string> = {
    m: "Masculino",
    f: "Feminino",
    other: "Outro",
  };
  return sexLabels[sex] || sex;
}

import type { ConsultationsFilters } from "@/lib/api/consultations";

// Re-export for convenience
export type { ConsultationsFilters };

/**
 * Maps enabled filter fields to their corresponding data field keys in ConsultationsFilters.
 * This mirrors the logic in mapEnabledFieldsToSetterFields but returns the data field names.
 */
export function mapEnabledFieldsToDataFields(
  enabledFields: string[]
): Array<keyof ConsultationsFilters> {
  const dataFields: Array<keyof ConsultationsFilters> = [];

  for (const field of enabledFields) {
    switch (field) {
      case "ageRange":
        dataFields.push("ageMin", "ageMax");
        break;
      case "dateRange":
        dataFields.push("dateFrom", "dateTo");
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
      case "profession":
      case "vaccination_plan":
        dataFields.push(field as keyof ConsultationsFilters);
        break;
    }
  }

  return dataFields;
}

/**
 * Shared props type for metrics tab components.
 * Simplifies prop passing by using a filters object and setFilter function
 * instead of individual props for each filter.
 */
export interface MetricsTabProps {
  specialty: Specialty | null;
  filters: ConsultationsFilters;
  setFilter: <K extends keyof ConsultationsFilters>(
    key: K,
    value: ConsultationsFilters[K]
  ) => void;
  metrics: ConsultationMetrics;
  hasActiveFilters?: boolean;
  onExportExcel?: () => void;
  isExportingExcel?: boolean;
  isExportDisabled?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

/**
 * Extended props for GeneralTab which includes getSexLabel helper and userId.
 */
export interface GeneralTabProps extends MetricsTabProps {
  userId: string;
  getSexLabel: (sex: string) => string;
  implicitFilters?: Partial<ConsultationsFilters>;
  excludeType?: string;
}
