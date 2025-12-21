import type { UnitSamplePresentialKey } from "@/reports/report-types";

const PRESENTIAL_KEYS: UnitSamplePresentialKey[] = [true, false];

type PresentialBooleanLabelKey = "true" | "false";

const PRESENTIAL_LABELS: Record<PresentialBooleanLabelKey, string> = {
  true: "Presencial",
  false: "Não presencial",
};

export function formatAutonomyCounts(counts: Record<string, number>) {
  return Object.entries(counts)
    .map(([autonomy, value]) => `${autonomy}: ${value}`)
    .join(" · ");
}

export { PRESENTIAL_KEYS, PRESENTIAL_LABELS };

