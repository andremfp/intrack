import { describe, expect, it } from "vitest";

import type { ConsultationMGF } from "@/lib/api/consultations";
import {
  getMGFReportDefinition,
  MGF_REPORT_CONFIGS,
  MGF_REPORT_DEFINITIONS,
} from "@/reports/mgf/mgf-reports";

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

function makeRecord(overrides: Partial<ConsultationMGF> = {}): ConsultationMGF {
  return {
    id: "test-id",
    user_id: "user-1",
    specialty_id: "spec-1",
    date: "2024-08-05T12:00:00", // Monday, August 2024
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

/** Three records on Mon/Tue/Wed of the same August week — satisfies minDaysPerWeek: 3 */
function makeWeekTriple(
  overrides: Partial<ConsultationMGF> = {}
): ConsultationMGF[] {
  return [
    makeRecord({ date: "2024-08-05T12:00:00", ...overrides }), // Mon
    makeRecord({ date: "2024-08-06T12:00:00", ...overrides }), // Tue
    makeRecord({ date: "2024-08-07T12:00:00", ...overrides }), // Wed
  ];
}

function getBuilder(reportKey: string) {
  const config = MGF_REPORT_CONFIGS.find((c) => c.reportKey === reportKey);
  if (!config) throw new Error(`No config for ${reportKey}`);
  return config.buildReport;
}

// ---------------------------------------------------------------------------
// getMGFReportDefinition
// ---------------------------------------------------------------------------

describe("getMGFReportDefinition", () => {
  it("returns a definition for year1", () => {
    const def = getMGFReportDefinition("year1");
    expect(def).toBeDefined();
    expect(def!.key).toBe("year1");
  });

  it("returns a definition for years2_3", () => {
    const def = getMGFReportDefinition("years2_3");
    expect(def).toBeDefined();
    expect(def!.key).toBe("years2_3");
  });

  it("returns a definition for year4", () => {
    const def = getMGFReportDefinition("year4");
    expect(def).toBeDefined();
    expect(def!.key).toBe("year4");
  });

  it("returns undefined for an unknown key", () => {
    expect(
      getMGFReportDefinition("unknown" as Parameters<typeof getMGFReportDefinition>[0])
    ).toBeUndefined();
  });

  it("every definition has a non-empty label, shortLabel, and at least one section", () => {
    for (const def of MGF_REPORT_DEFINITIONS) {
      expect(def.label.length).toBeGreaterThan(0);
      expect(def.shortLabel.length).toBeGreaterThan(0);
      expect(def.sections.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Year 1 report builder
// ---------------------------------------------------------------------------

describe("Year 1 report builder", () => {
  const build = getBuilder("year1");

  it("returns zero-totals and empty arrays for empty records", () => {
    const report = build([]);
    expect(report.summary.totalConsultations).toBe(0);
    expect(report.sampleWeeks).toEqual([]);
    expect(report.urgencySelection).toEqual([]);
  });

  it("excludes records with location other than 'unidade' from summary/weeks", () => {
    const records = makeWeekTriple({ location: "urgência" });
    const report = build(records);
    // urgência records go to urgencySelection, not the unit sample
    expect(report.summary.totalConsultations).toBe(0);
    expect(report.sampleWeeks).toHaveLength(0);
  });

  it("excludes records from months 1–6 from week selection", () => {
    // Three records in January — outside startMonth:7
    const records = [
      makeRecord({ date: "2024-01-08T12:00:00", location: "unidade", type: "SA" }),
      makeRecord({ date: "2024-01-09T12:00:00", location: "unidade", type: "SA" }),
      makeRecord({ date: "2024-01-10T12:00:00", location: "unidade", type: "SA" }),
    ];
    const report = build(records);
    expect(report.sampleWeeks).toHaveLength(0);
  });

  it("selects weeks from months 7–12 when minDaysPerWeek is met", () => {
    const records = makeWeekTriple({ location: "unidade", type: "SA" });
    const report = build(records);
    expect(report.sampleWeeks!.length).toBeGreaterThan(0);
  });

  it("excludes records with an invalid type from unit sample", () => {
    const records = makeWeekTriple({
      location: "unidade",
      type: "NOT_VALID" as ConsultationMGF["type"],
    });
    const report = build(records);
    expect(report.summary.totalConsultations).toBe(0);
    expect(report.sampleWeeks).toHaveLength(0);
  });

  it("includes urgency records for 'cir geral' in urgencySelection", () => {
    const records = [
      makeRecord({
        location: "urgência",
        details: { internship: "cir geral" },
      }),
      makeRecord({
        location: "urgência",
        details: { internship: "cir geral" },
      }),
    ];
    const report = build(records);
    const cirGeral = report.urgencySelection?.find(
      (s) => s.internship === "cir geral"
    );
    expect(cirGeral).toBeDefined();
    expect(cirGeral!.totalConsultations).toBe(2);
  });

  it("returns the expected shape (summary, sampleWeeks, urgencySelection, unitSampleBreakdown)", () => {
    const report = build([]);
    expect(report).toHaveProperty("summary");
    expect(report).toHaveProperty("sampleWeeks");
    expect(report).toHaveProperty("urgencySelection");
    expect(report).toHaveProperty("unitSampleBreakdown");
    expect(report).not.toHaveProperty("firstHalfWeeks");
    expect(report).not.toHaveProperty("internshipsSamples");
  });
});

// ---------------------------------------------------------------------------
// Year 4 report builder
// ---------------------------------------------------------------------------

describe("Year 4 report builder", () => {
  const build = getBuilder("year4");

  it("returns zero total for empty records", () => {
    expect(build([]).summary.totalConsultations).toBe(0);
  });

  it("counts only unidade + autonomy=total + valid type records", () => {
    const records = [
      makeRecord({ location: "unidade", autonomy: "total", type: "SA" }),
      makeRecord({ location: "unidade", autonomy: "parcial", type: "SA" }), // excluded
      makeRecord({ location: "urgência", autonomy: "total", type: "SA" }), // excluded
    ];
    const report = build(records);
    expect(report.summary.totalConsultations).toBe(1);
    expect(report.summary.typeCounts["SA"]).toBe(1);
  });

  it("excludes records with an invalid type even if location and autonomy are correct", () => {
    const records = [
      makeRecord({
        location: "unidade",
        autonomy: "total",
        type: "NOT_VALID" as ConsultationMGF["type"],
      }),
    ];
    expect(build(records).summary.totalConsultations).toBe(0);
  });

  it("returns only summary — no weeks, urgency, or internships", () => {
    const report = build([]);
    expect(report).toHaveProperty("summary");
    expect(report).not.toHaveProperty("sampleWeeks");
    expect(report).not.toHaveProperty("urgencySelection");
    expect(report).not.toHaveProperty("internshipsSamples");
    expect(report).not.toHaveProperty("firstHalfWeeks");
  });
});

// ---------------------------------------------------------------------------
// Years 2–3 report builder
// ---------------------------------------------------------------------------

describe("Years 2–3 report builder", () => {
  const build = getBuilder("years2_3");

  it("returns zero-totals for empty records", () => {
    const report = build([]);
    expect(report.summary.totalConsultations).toBe(0);
    expect(report.firstHalfWeeks).toEqual([]);
    expect(report.secondHalfWeeks).toEqual([]);
  });

  it("splits records by specialty_year into firstHalfWeeks (yr 2) and secondHalfWeeks (yr 3)", () => {
    const year2Records = makeWeekTriple({
      location: "unidade",
      type: "SA",
      specialty_year: 2,
    });
    const year3Records = [
      makeRecord({ date: "2024-09-02T12:00:00", location: "unidade", type: "SA", specialty_year: 3 }),
      makeRecord({ date: "2024-09-03T12:00:00", location: "unidade", type: "SA", specialty_year: 3 }),
      makeRecord({ date: "2024-09-04T12:00:00", location: "unidade", type: "SA", specialty_year: 3 }),
    ];
    const report = build([...year2Records, ...year3Records]);
    expect(report.firstHalfWeeks!.length).toBeGreaterThan(0);
    expect(report.secondHalfWeeks!.length).toBeGreaterThan(0);
  });

  it("always returns exactly three internshipsSamples (pediatria, gineco, psiquiatria)", () => {
    const report = build([]);
    expect(report.internshipsSamples).toHaveLength(3);
    const labels = report.internshipsSamples!.map((s) => s.label);
    expect(labels).toContain("Pediatria");
    expect(labels).toContain("Ginecologia e Obstetrícia");
    expect(labels).toContain("Psiquiatria");
  });

  it("populates internship samples from complementar records", () => {
    const complementarRecords = [
      makeRecord({
        location: "complementar",
        details: { internship: "pediatria" },
        specialty_year: 2,
      }),
    ];
    const report = build(complementarRecords);
    const pediatria = report.internshipsSamples!.find(
      (s) => s.label === "Pediatria"
    )!;
    expect(pediatria.autonomyCounts["total"]).toBeGreaterThan(0);
  });

  it("returns topProblems (may be empty for records without problems)", () => {
    const report = build([]);
    expect(Array.isArray(report.topProblems)).toBe(true);
  });

  it("returns the expected shape", () => {
    const report = build([]);
    expect(report).toHaveProperty("summary");
    expect(report).toHaveProperty("firstHalfWeeks");
    expect(report).toHaveProperty("secondHalfWeeks");
    expect(report).toHaveProperty("urgencySelection");
    expect(report).toHaveProperty("internshipsSamples");
    expect(report).toHaveProperty("topProblems");
    expect(report).not.toHaveProperty("sampleWeeks");
  });
});
