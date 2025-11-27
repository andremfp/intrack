import type { ConsultationMGF } from "@/lib/api/consultations";

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

