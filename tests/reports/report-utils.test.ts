import { describe, expect, it } from "vitest";

import type { ConsultationMGF } from "@/lib/api/consultations";
import {
  buildSummary,
  buildUnitSampleBreakdown,
  buildUrgencySelection,
  computeTopProblems,
  extractProblems,
  getInternship,
  getWeekInfo,
  normalizeDateKey,
  selectBestWeeks,
} from "@/reports/report-utils";
import type { ReportUtilsConfig, UrgencyGroupConfig } from "@/reports/report-utils";

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

function makeRecord(overrides: Partial<ConsultationMGF> = {}): ConsultationMGF {
  return {
    id: "test-id",
    user_id: "user-1",
    specialty_id: "spec-1",
    date: "2024-06-17", // Monday
    process_number: 1,
    age: 30,
    age_unit: "years",
    sex: "m",
    location: "unidade",
    autonomy: "total",
    presential: true,
    specialty_year: 1,
    type: "SA",
    favorite: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    details: {},
    ...overrides,
  } as ConsultationMGF;
}

const BASE_CONFIG: ReportUtilsConfig = {
  consultationTypes: ["SA", "SIJ", "DA"],
  autonomyLevels: ["observada", "parcial", "total"],
};

// ---------------------------------------------------------------------------
// normalizeDateKey
// ---------------------------------------------------------------------------

describe("normalizeDateKey", () => {
  it("strips the time component from an ISO datetime string", () => {
    expect(normalizeDateKey("2024-06-15T10:30:00")).toBe("2024-06-15");
  });

  it("returns a date-only string unchanged", () => {
    expect(normalizeDateKey("2024-06-15")).toBe("2024-06-15");
  });

  it("returns null for null", () => {
    expect(normalizeDateKey(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(normalizeDateKey(undefined)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getWeekInfo
// ---------------------------------------------------------------------------

describe("getWeekInfo", () => {
  it("returns the correct week for a Monday (is its own week start)", () => {
    // Use T12:00:00 so local getDay() is stable across UTC± timezones
    const info = getWeekInfo(makeRecord({ date: "2024-06-17T12:00:00" }));
    expect(info).not.toBeNull();
    expect(info!.weekKey).toBe("2024-06-17");
    // startDate/endDate use toISOString() and can shift ±1 day in non-UTC
    // timezones; verify the 6-day span instead of hardcoded strings
    const spanMs = new Date(info!.endDate).getTime() - new Date(info!.startDate).getTime();
    expect(spanMs).toBe(6 * 86400000);
  });

  it("returns the same week for a Sunday (week ends on Sunday)", () => {
    // 2024-06-23 is a Sunday — same week as 2024-06-17
    const mondayInfo = getWeekInfo(makeRecord({ date: "2024-06-17T12:00:00" }));
    const sundayInfo = getWeekInfo(makeRecord({ date: "2024-06-23T12:00:00" }));
    expect(sundayInfo!.weekKey).toBe(mondayInfo!.weekKey);
  });

  it("returns the correct week for a mid-week day", () => {
    // 2024-06-19 is a Wednesday — still week of 2024-06-17
    const info = getWeekInfo(makeRecord({ date: "2024-06-19T12:00:00" }));
    expect(info!.weekKey).toBe("2024-06-17");
  });

  it("returns the correct month number", () => {
    const info = getWeekInfo(makeRecord({ date: "2024-06-17T12:00:00" }));
    expect(info!.month).toBe(6);
  });

  it("returns null when date is missing", () => {
    expect(getWeekInfo(makeRecord({ date: undefined as unknown as string }))).toBeNull();
  });

  it("returns null for an invalid date string", () => {
    expect(getWeekInfo(makeRecord({ date: "not-a-date" }))).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getInternship
// ---------------------------------------------------------------------------

describe("getInternship", () => {
  it("returns the internship in lowercase", () => {
    expect(
      getInternship(makeRecord({ details: { internship: "Pediatria" } }))
    ).toBe("pediatria");
  });

  it("returns an already-lowercase internship unchanged", () => {
    expect(
      getInternship(makeRecord({ details: { internship: "psiquiatria" } }))
    ).toBe("psiquiatria");
  });

  it("returns undefined when internship is a non-string value", () => {
    expect(
      getInternship(makeRecord({ details: { internship: 123 } }))
    ).toBeUndefined();
  });

  it("returns undefined when details has no internship field", () => {
    expect(getInternship(makeRecord({ details: {} }))).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// selectBestWeeks
// ---------------------------------------------------------------------------

describe("selectBestWeeks", () => {
  it("returns an empty array for empty records", () => {
    expect(selectBestWeeks([], { limit: 4 })).toEqual([]);
  });

  it("returns an empty array when limit is 0", () => {
    const records = [makeRecord({ date: "2024-06-17" })];
    expect(selectBestWeeks(records, { limit: 0 })).toEqual([]);
  });

  it("selects up to limit weeks sorted by consultation count descending", () => {
    // Week A: 3 consultations (Mon–Wed)
    const weekA = [
      makeRecord({ date: "2024-06-17" }),
      makeRecord({ date: "2024-06-18" }),
      makeRecord({ date: "2024-06-19" }),
    ];
    // Week B: 1 consultation
    const weekB = [makeRecord({ date: "2024-06-24" })];

    const result = selectBestWeeks([...weekA, ...weekB], { limit: 2 });
    expect(result).toHaveLength(2);
    expect(result[0].weekKey).toBe("2024-06-17"); // higher count first
    expect(result[0].consultations).toBe(3);
    expect(result[1].consultations).toBe(1);
  });

  it("respects the limit", () => {
    const records = [
      makeRecord({ date: "2024-06-17" }),
      makeRecord({ date: "2024-06-24" }),
      makeRecord({ date: "2024-07-01" }),
    ];
    const result = selectBestWeeks(records, { limit: 2 });
    expect(result).toHaveLength(2);
  });

  it("excludes weeks with fewer unique days than minDaysPerWeek", () => {
    // Week A has 1 unique day; week B has 2 unique days
    const records = [
      makeRecord({ date: "2024-06-17" }), // week A, day 1
      makeRecord({ date: "2024-06-17" }), // week A, same day
      makeRecord({ date: "2024-06-24" }), // week B, day 1
      makeRecord({ date: "2024-06-25" }), // week B, day 2
    ];
    const result = selectBestWeeks(records, { limit: 4, minDaysPerWeek: 2 });
    expect(result).toHaveLength(1);
    expect(result[0].weekKey).toBe("2024-06-24");
  });

  it("excludes records outside the startMonth–endMonth range", () => {
    const records = [
      makeRecord({ date: "2024-01-08" }), // January — excluded
      makeRecord({ date: "2024-07-01" }), // July — included
    ];
    const result = selectBestWeeks(records, {
      limit: 4,
      startMonth: 7,
      endMonth: 12,
    });
    expect(result).toHaveLength(1);
    expect(result[0].weekKey).toBe("2024-07-01");
  });

  it("includes the uniqueDays count in the result", () => {
    const records = [
      makeRecord({ date: "2024-06-17" }),
      makeRecord({ date: "2024-06-18" }),
      makeRecord({ date: "2024-06-17" }), // duplicate day
    ];
    const result = selectBestWeeks(records, { limit: 1 });
    expect(result[0].uniqueDays).toBe(2);
    expect(result[0].consultations).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// buildSummary
// ---------------------------------------------------------------------------

describe("buildSummary", () => {
  it("returns all-zero counts for empty records", () => {
    const summary = buildSummary([], BASE_CONFIG);
    expect(summary.totalConsultations).toBe(0);
    expect(Object.values(summary.typeCounts).every((v) => v === 0)).toBe(true);
    expect(Object.values(summary.autonomyCounts).every((v) => v === 0)).toBe(true);
    expect(summary.presentialCounts.presential).toBe(0);
    expect(summary.presentialCounts.remote).toBe(0);
  });

  it("counts consultations by type", () => {
    const records = [
      makeRecord({ type: "SA" }),
      makeRecord({ type: "SA" }),
      makeRecord({ type: "DA" }),
    ];
    const summary = buildSummary(records, BASE_CONFIG);
    expect(summary.typeCounts["SA"]).toBe(2);
    expect(summary.typeCounts["DA"]).toBe(1);
    expect(summary.totalConsultations).toBe(3);
  });

  it("excludes records with unknown or missing type", () => {
    const records = [
      makeRecord({ type: "SA" }),
      makeRecord({ type: "UNKNOWN_TYPE" }),
      makeRecord({ type: undefined as unknown as string }),
    ];
    const summary = buildSummary(records, BASE_CONFIG);
    expect(summary.totalConsultations).toBe(1);
  });

  it("counts autonomy levels", () => {
    const records = [
      makeRecord({ type: "SA", autonomy: "total" }),
      makeRecord({ type: "SA", autonomy: "total" }),
      makeRecord({ type: "DA", autonomy: "parcial" }),
    ];
    const summary = buildSummary(records, BASE_CONFIG);
    expect(summary.autonomyCounts["total"]).toBe(2);
    expect(summary.autonomyCounts["parcial"]).toBe(1);
  });

  it("splits presential and remote counts correctly", () => {
    const records = [
      makeRecord({ type: "SA", presential: true }),
      makeRecord({ type: "SA", presential: true }),
      makeRecord({ type: "DA", presential: false }),
    ];
    const summary = buildSummary(records, BASE_CONFIG);
    expect(summary.presentialCounts.presential).toBe(2);
    expect(summary.presentialCounts.remote).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// buildUnitSampleBreakdown
// ---------------------------------------------------------------------------

describe("buildUnitSampleBreakdown", () => {
  it("returns zero total and empty autonomy map for empty records", () => {
    const result = buildUnitSampleBreakdown([], BASE_CONFIG);
    expect(result.totalConsultations).toBe(0);
    expect(Object.keys(result.autonomy)).toHaveLength(0);
  });

  it("accumulates total consultations for valid-type records", () => {
    const records = [
      makeRecord({ type: "SA", autonomy: "total", presential: true }),
      makeRecord({ type: "SA", autonomy: "total", presential: false }),
    ];
    const result = buildUnitSampleBreakdown(records, BASE_CONFIG);
    expect(result.totalConsultations).toBe(2);
  });

  it("excludes records with an unknown type", () => {
    const records = [
      makeRecord({ type: "SA" }),
      makeRecord({ type: "NOT_IN_CONFIG" }),
    ];
    const result = buildUnitSampleBreakdown(records, BASE_CONFIG);
    expect(result.totalConsultations).toBe(1);
  });

  it("builds the autonomy → presential → typeCounts hierarchy", () => {
    const record = makeRecord({ type: "SA", autonomy: "total", presential: true });
    const result = buildUnitSampleBreakdown([record], BASE_CONFIG);
    const autonomyEntry = result.autonomy["total"];
    expect(autonomyEntry).toBeDefined();
    expect(autonomyEntry.consultations).toBe(1);
    const presentialEntry = autonomyEntry.presential.get(true);
    expect(presentialEntry).toBeDefined();
    expect(presentialEntry!.typeCounts["SA"]).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// buildUrgencySelection
// ---------------------------------------------------------------------------

describe("buildUrgencySelection", () => {
  const config: UrgencyGroupConfig[] = [
    { label: "Urgência Geral", internships: ["cir geral"], dayLimit: 2 },
  ];

  it("returns an empty array for empty records", () => {
    expect(buildUrgencySelection([], config)).toEqual([]);
  });

  it("returns an empty array when no records match any config internship", () => {
    const records = [
      makeRecord({ details: { internship: "pediatria" } }),
    ];
    expect(buildUrgencySelection(records, config)).toHaveLength(0);
  });

  it("selects the top dayLimit days by consultation count", () => {
    // Day A: 3 records, Day B: 1 record, Day C: 2 records
    const records = [
      makeRecord({ date: "2024-06-17", details: { internship: "cir geral" } }),
      makeRecord({ date: "2024-06-17", details: { internship: "cir geral" } }),
      makeRecord({ date: "2024-06-17", details: { internship: "cir geral" } }),
      makeRecord({ date: "2024-06-18", details: { internship: "cir geral" } }),
      makeRecord({ date: "2024-06-19", details: { internship: "cir geral" } }),
      makeRecord({ date: "2024-06-19", details: { internship: "cir geral" } }),
    ];
    const result = buildUrgencySelection(records, config);
    expect(result).toHaveLength(1);
    // dayLimit = 2 → top 2 days (June 17: 3, June 19: 2)
    expect(result[0].days).toHaveLength(2);
    expect(result[0].days[0].consultations).toBeGreaterThanOrEqual(
      result[0].days[1].consultations
    );
    expect(result[0].totalConsultations).toBe(5);
  });

  it("aggregates autonomyCounts across selected days", () => {
    const records = [
      makeRecord({ date: "2024-06-17", autonomy: "total", details: { internship: "cir geral" } }),
      makeRecord({ date: "2024-06-17", autonomy: "parcial", details: { internship: "cir geral" } }),
    ];
    const result = buildUrgencySelection(records, config);
    expect(result[0].autonomyTotals["total"]).toBe(1);
    expect(result[0].autonomyTotals["parcial"]).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// extractProblems
// ---------------------------------------------------------------------------

describe("extractProblems", () => {
  it("returns an array of trimmed strings when details.problems is an array", () => {
    const record = makeRecord({
      details: { problems: ["  A01 - Dor  ", "A02 - Arrepios"] },
    });
    expect(extractProblems(record)).toEqual(["A01 - Dor", "A02 - Arrepios"]);
  });

  it("splits a comma-separated string into individual problems", () => {
    const record = makeRecord({
      details: { problems: "A01 - Dor, A02 - Arrepios" },
    });
    expect(extractProblems(record)).toEqual(["A01 - Dor", "A02 - Arrepios"]);
  });

  it("filters out empty items", () => {
    const record = makeRecord({ details: { problems: ["A01", "", "  "] } });
    expect(extractProblems(record)).toEqual(["A01"]);
  });

  it("returns an empty array when details has no problems field", () => {
    expect(extractProblems(makeRecord({ details: {} }))).toEqual([]);
  });

  it("returns an empty array when problems has an unsupported type", () => {
    expect(extractProblems(makeRecord({ details: { problems: 42 } }))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// computeTopProblems
// ---------------------------------------------------------------------------

describe("computeTopProblems", () => {
  it("returns an empty array for empty records", () => {
    expect(computeTopProblems([])).toEqual([]);
  });

  it("counts and deduplicates problems across records", () => {
    const records = [
      makeRecord({ details: { problems: ["A01", "A02"] } }),
      makeRecord({ details: { problems: ["A01"] } }),
    ];
    const result = computeTopProblems(records);
    const a01 = result.find((r) => r.code === "A01");
    const a02 = result.find((r) => r.code === "A02");
    expect(a01!.count).toBe(2);
    expect(a02!.count).toBe(1);
  });

  it("sorts results by count descending", () => {
    const records = [
      makeRecord({ details: { problems: ["A01"] } }),
      makeRecord({ details: { problems: ["A02", "A02"] } }),
    ];
    const result = computeTopProblems(records);
    expect(result[0].count).toBeGreaterThanOrEqual(result[1].count);
  });

  it("returns at most 20 entries", () => {
    // 25 distinct problem codes
    const problems = Array.from({ length: 25 }, (_, i) => `P${String(i).padStart(2, "0")}`);
    const records = [makeRecord({ details: { problems } })];
    expect(computeTopProblems(records)).toHaveLength(20);
  });
});
