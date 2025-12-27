import type { ConsultationMGF } from "@/lib/api/consultations";
import type {
  WeekSample,
  MGFReportSummary,
  UrgencySelection,
  InternshipsSample,
  UnitSampleAutonomyBreakdown,
  UnitSampleBreakdown,
  UnitSamplePresentialKey,
  UnitSampleTypeBreakdown,
  UrgencyDay,
} from "@/reports/report-types";

type WeekInfo = {
  weekKey: string;
  startDate: string;
  endDate: string;
  month: number;
};

export interface ReportUtilsConfig {
  consultationTypes: string[];
  autonomyLevels: string[];
}

export interface InternshipSampleConfig {
  label: string;
  internships: string[];
  location?: string;
  weekLimit?: number;
}

export type UrgencyGroupConfig = {
  label: string;
  internships: string[];
  dayLimit: number;
};

type UrgencyDayGroup = {
  internship: string;
  date: string;
  count: number;
  autonomyCounts: Record<string, number>;
};

export const PRESENTIAL_STATES: UnitSamplePresentialKey[] = [true, false];

function toDateString(date: Date) {
  return date.toISOString().split("T")[0];
}

export function normalizeDateKey(value?: string | null) {
  return value ? value.split("T")[0] : null;
}

export function getWeekInfo(record: ConsultationMGF): WeekInfo | null {
  if (!record.date) return null;
  const parsed = new Date(record.date);
  if (Number.isNaN(parsed.getTime())) return null;
  const dayIndex = parsed.getDay();
  const diffToMonday = (dayIndex + 6) % 7;
  const monday = new Date(parsed);
  monday.setDate(parsed.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    weekKey: `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(
      monday.getDate()
    ).padStart(2, "0")}`,
    startDate: toDateString(monday),
    endDate: toDateString(sunday),
    month: parsed.getMonth() + 1,
  };
}

export function getInternship(record: ConsultationMGF) {
  const details = (record.details as Record<string, unknown>) || {};
  const rawInternship = details["internship"];
  if (typeof rawInternship === "string") {
    return rawInternship.toLowerCase();
  }
  return undefined;
}

export function selectBestWeeks(
  records: ConsultationMGF[],
  params: { limit: number; minDaysPerWeek?: number; startMonth?: number; endMonth?: number }
): WeekSample[] {
  const weekMap = new Map<string, { info: WeekInfo; count: number; uniqueDays: Set<string> }>();
  records.forEach((record) => {
    const weekInfo = getWeekInfo(record);
    if (!weekInfo) return;
    if (params.startMonth && weekInfo.month < params.startMonth) return;
    if (params.endMonth && weekInfo.month > params.endMonth) return;
    const dateKey = normalizeDateKey(record.date);
    if (!dateKey) return;
    const builder = weekMap.get(weekInfo.weekKey);
    if (builder) {
      builder.count += 1;
      builder.uniqueDays.add(dateKey);
    } else {
      const set = new Set<string>();
      set.add(dateKey);
      weekMap.set(weekInfo.weekKey, {
        info: weekInfo,
        count: 1,
        uniqueDays: set,
      });
    }
  });
  const weeks = Array.from(weekMap.values())
    .filter((entry) => entry.uniqueDays.size >= (params.minDaysPerWeek ?? 0))
    .sort((a, b) => b.count - a.count)
    .slice(0, params.limit)
    .map((entry) => ({
      weekKey: entry.info.weekKey,
      startDate: entry.info.startDate,
      endDate: entry.info.endDate,
      consultations: entry.count,
      uniqueDays: entry.uniqueDays.size,
    }));

  return weeks;
}

export function buildSummary(records: ConsultationMGF[], config: ReportUtilsConfig): MGFReportSummary {
  const typeCounts = createTypeCounts(config.consultationTypes);
  const autonomyCounts = createAutonomyCounts(config.autonomyLevels);

  const presentialCounts = {
    presential: 0,
    remote: 0,
  };

  let recordsProcessed = 0;
  records.forEach((record) => {
    if (!record.type || !(record.type in typeCounts)) {
      return;
    }
    recordsProcessed += 1;
    typeCounts[record.type] += 1;
    const autonomy = record.autonomy;
    if (autonomy && autonomy in autonomyCounts) {
      autonomyCounts[autonomy] += 1;
    }
    if (record.presential === true) {
      presentialCounts.presential += 1;
    } else {
      presentialCounts.remote += 1;
    }
  });
  return {
    totalConsultations: recordsProcessed,
    typeCounts,
    autonomyCounts,
    presentialCounts,
  };
}

function createTypeCounts(types: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  types.forEach((type) => {
    counts[type] = 0;
  });
  return counts;
}

function createAutonomyCounts(levels: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  levels.forEach((value) => {
    counts[value] = 0;
  });
  return counts;
}

function createPresentialBreakdowns(config: ReportUtilsConfig): Map<UnitSamplePresentialKey, UnitSampleTypeBreakdown> {
  const breakdowns = new Map<UnitSamplePresentialKey, UnitSampleTypeBreakdown>();
  PRESENTIAL_STATES.forEach((state) => {
    breakdowns.set(state, {
      consultations: 0,
      typeCounts: createTypeCounts(config.consultationTypes),
    });
  });
  return breakdowns;
}

function createAutonomyBreakdown(config: ReportUtilsConfig): UnitSampleAutonomyBreakdown {
  return {
    consultations: 0,
    presential: createPresentialBreakdowns(config),
  };
}

function getPresentialKey(record: ConsultationMGF): UnitSamplePresentialKey {
  return record.presential === true;
}

export function buildUnitSampleBreakdown(
  records: ConsultationMGF[],
  config: ReportUtilsConfig
): UnitSampleBreakdown {
  const autonomy: Record<string, UnitSampleAutonomyBreakdown> = {};
  let totalConsultations = 0;

  const allowedTypes = new Set(config.consultationTypes);
  records.forEach((record) => {
    const type = record.type;
    if (!type || !allowedTypes.has(type)) {
      return;
    }
    const autonomyKey = record.autonomy || "unknown";
    const autonomyEntry = autonomy[autonomyKey] ?? createAutonomyBreakdown(config);
    const presentialKey = getPresentialKey(record);
    const presentialEntry = autonomyEntry.presential.get(presentialKey)!;

    totalConsultations += 1;
    autonomyEntry.consultations += 1;
    presentialEntry.consultations += 1;
    if (type in presentialEntry.typeCounts) {
      presentialEntry.typeCounts[type] += 1;
    }

    autonomy[autonomyKey] = autonomyEntry;
  });

  return {
    totalConsultations,
    autonomy,
  };
}

function buildUrgencyDayGroups(records: ConsultationMGF[]) {
  const grouped = new Map<string, UrgencyDayGroup>();
  records.forEach((record) => {
    const internship = getInternship(record);
    if (!internship) return;
    const date = normalizeDateKey(record.date);
    if (!date) return;
    const key = `${internship}|${date}`;
    const group = grouped.get(key);
    const autonomy = record.autonomy ?? "unknown";
    if (group) {
      group.count += 1;
      group.autonomyCounts[autonomy] = (group.autonomyCounts[autonomy] ?? 0) + 1;
    } else {
      grouped.set(key, {
        internship,
        date,
        count: 1,
        autonomyCounts: { [autonomy]: 1 },
      });
    }
  });
  return Array.from(grouped.values());
}

export function buildUrgencySelection(
  records: ConsultationMGF[],
  configs: UrgencyGroupConfig[]
): UrgencySelection[] {
  if (!records.length) return [];
  const dayGroups = buildUrgencyDayGroups(records);
  return configs
    .flatMap((config) =>
      config.internships.map((internship) => {
        const matching = dayGroups
          .filter((day) => day.internship === internship)
          .sort((a, b) => b.count - a.count)
          .slice(0, config.dayLimit);
        if (!matching.length) {
          return null;
        }
        const autonomyTotals: Record<string, number> = {};
        matching.forEach((day) => {
          Object.entries(day.autonomyCounts).forEach(([key, value]) => {
            autonomyTotals[key] = (autonomyTotals[key] ?? 0) + value;
          });
        });
        const totalConsultations = matching.reduce((sum, day) => sum + day.count, 0);
        const days: UrgencyDay[] = matching.map((day) => ({
          date: day.date,
          consultations: day.count,
          autonomyCounts: day.autonomyCounts,
        }));
        return {
          label: config.label,
          internship,
          days,
          autonomyTotals,
          totalConsultations,
        };
      })
    )
    .filter(Boolean) as UrgencySelection[];
}

export function buildInternshipsSamples(
  records: ConsultationMGF[],
  config: ReportUtilsConfig,
  configs: InternshipSampleConfig[]
): InternshipsSample[] {
  return configs.map((sampleConfig) => {
    const filtered = records.filter((record) => {
      if (sampleConfig.location && record.location !== sampleConfig.location) {
        return false;
      }
      const internship = getInternship(record);
      return internship && sampleConfig.internships.includes(internship);
    });
    const weeks = selectBestWeeks(filtered, { limit: sampleConfig.weekLimit ?? 4 });
    const autonomyCounts = createAutonomyCounts(config.autonomyLevels);
    filtered.forEach((record) => {
      const autonomy = record.autonomy || "unknown";
      autonomyCounts[autonomy] = (autonomyCounts[autonomy] ?? 0) + 1;
    });
    return {
      label: sampleConfig.label,
      internships: sampleConfig.internships,
      weeks,
      autonomyCounts,
    };
  });
}

export function computeTopProblems(records: ConsultationMGF[]) {
  const counts = new Map<string, number>();
  records.forEach((record) => {
    const problems = extractProblems(record);
    problems.forEach((problem) => {
      if (!problem) return;
      const normalized = problem.trim();
      if (!normalized) return;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([code, count]) => ({ code, count }));
}

export function extractProblems(record: ConsultationMGF): string[] {
  const details = (record.details as Record<string, unknown>) || {};
  const value = details["problems"];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}
