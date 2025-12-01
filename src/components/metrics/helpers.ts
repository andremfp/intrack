import { MGF_FIELDS } from "@/constants";
import type { Specialty } from "@/lib/api/specialties";
import type { ConsultationMetrics } from "@/lib/api/consultations";

// Helper to get label from field options
export function getFieldLabel(fieldKey: string, value: string): string {
  const field = MGF_FIELDS.find((f) => f.key === fieldKey);
  if (field && field.options) {
    const option = field.options.find((opt) => opt.value === value);
    if (option) return option.label;
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
}

/**
 * Extended props for GeneralTab which includes getSexLabel helper.
 */
export interface GeneralTabProps extends MetricsTabProps {
  getSexLabel: (sex: string) => string;
}
