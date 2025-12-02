import type {
  ConsultationInsert,
  ConsultationMGF,
  ConsultationsFilters,
} from "@/lib/api/consultations";
import type { Specialty } from "@/lib/api/specialties";
import { normalizeToISODate } from "@/utils/utils";

/**
 * Gets a field value from a consultation object.
 * Tries top-level columns first, then falls back to the details JSONB field.
 *
 * @param consultation - The consultation object to get the value from
 * @param fieldKey - The key of the field to retrieve
 * @returns The field value, or null if not found
 */
export function getConsultationFieldValue(
  consultation: ConsultationMGF,
  fieldKey: string
): unknown {
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
}

export function buildFiltersSummary(
  currentFilters: ConsultationsFilters
): string {
  const parts: string[] = [];

  if (currentFilters.year !== undefined) {
    parts.push(`Ano: ${currentFilters.year}`);
  }
  if (currentFilters.location) {
    parts.push(`Local: ${currentFilters.location}`);
  }
  if (currentFilters.internship) {
    parts.push(`Estágio: ${currentFilters.internship}`);
  }
  if (currentFilters.sex) {
    parts.push(`Sexo: ${currentFilters.sex}`);
  }
  if (currentFilters.autonomy) {
    parts.push(`Autonomia: ${currentFilters.autonomy}`);
  }
  if (
    currentFilters.ageMin !== undefined ||
    currentFilters.ageMax !== undefined
  ) {
    const from = currentFilters.ageMin ?? "";
    const to = currentFilters.ageMax ?? "";
    parts.push(`Idade: ${from} - ${to}`);
  }
  if (currentFilters.dateFrom || currentFilters.dateTo) {
    const from = currentFilters.dateFrom ?? "";
    const to = currentFilters.dateTo ?? "";
    parts.push(`Período: ${from} - ${to}`);
  }
  if (currentFilters.type) {
    parts.push(`Tipologia: ${currentFilters.type}`);
  }
  if (currentFilters.presential !== undefined) {
    parts.push(`Presencial: ${currentFilters.presential ? "Sim" : "Não"}`);
  }
  if (currentFilters.smoker !== undefined) {
    parts.push(`Fumador: ${currentFilters.smoker}`);
  }
  if (currentFilters.contraceptive) {
    parts.push(`Contraceptivo: ${currentFilters.contraceptive}`);
  }
  if (currentFilters.new_contraceptive) {
    parts.push(`Novo Contraceptivo: ${currentFilters.new_contraceptive}`);
  }

  return parts.length > 0 ? parts.join(" | ") : "Nenhum filtro aplicado";
}

export function buildConsultationsExportMetadataRows(params: {
  filters: ConsultationsFilters;
  specialty: Specialty | null;
  specialtyYear: number | undefined;
  activeTab?: string;
}): (string | number | null)[][] {
  const { filters, specialty, specialtyYear, activeTab } = params;

  const now = new Date();
  const exportDate = now.toLocaleString("pt-PT");
  const filtersSummary = buildFiltersSummary(filters);
  const specialtyInfo =
    specialty && specialtyYear
      ? `${specialty.code.toUpperCase()}.${specialtyYear}`
      : specialty
      ? specialty.code.toUpperCase()
      : "N/A";

  // build output rows
  const outputRows: (string | number | null)[][] = [
    ["Exportado em", exportDate],
    ["Especialidade", specialtyInfo],
    ["Filtros", filtersSummary],
  ];
  if (activeTab) {
    outputRows.push(["Métricas", activeTab]);
  }
  return outputRows;
}

/**
 * Builds a stable uniqueness key for a consultation based on
 * calendar-day date (YYYY-MM-DD) + process number.
 */
export function makeConsultationKey(params: {
  date: string;
  processNumber: number | string;
}): string {
  const normalizedDate = normalizeToISODate(params.date);
  const normalizedProcessNumber =
    typeof params.processNumber === "string"
      ? params.processNumber.trim()
      : String(params.processNumber);

  return `${normalizedDate}::${normalizedProcessNumber}`;
}

/**
 * Builds a uniqueness key from a ConsultationInsert-like object.
 * Returns null if required fields are missing.
 */
export function makeConsultationKeyFromInsert(
  consultation: Partial<ConsultationInsert>
): string | null {
  if (!consultation.date || consultation.process_number === undefined) {
    return null;
  }

  return makeConsultationKey({
    date: consultation.date,
    processNumber: consultation.process_number,
  });
}

/**
 * Compares two consultations (or consultation-like objects) by identity:
 * same calendar-day date + process number.
 */
export function areConsultationsSameIdentity<
  T extends { date: string; process_number: number | string }
>(a: T, b: T): boolean {
  const keyA = makeConsultationKey({
    date: a.date,
    processNumber: a.process_number,
  });

  const keyB = makeConsultationKey({
    date: b.date,
    processNumber: b.process_number,
  });

  return keyA === keyB;
}
