import { describe, expect, it } from "vitest";

import {
  getReportTabDisplayName,
  getReportTabKey,
  getReportsForSpecialty,
  getSpecialtyReportConfig,
  hasReportData,
} from "@/reports/helpers";
import type { MGFReportData, MGFReportSummary } from "@/reports/report-types";

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeEmptySummary(): MGFReportSummary {
  return {
    totalConsultations: 0,
    typeCounts: {},
    autonomyCounts: {},
    presentialCounts: { presential: 0, remote: 0 },
  };
}

function makeData(overrides: Partial<MGFReportData> = {}): MGFReportData {
  return { summary: makeEmptySummary(), ...overrides };
}

// ---------------------------------------------------------------------------
// hasReportData
// ---------------------------------------------------------------------------

describe("hasReportData", () => {
  it("returns false for undefined", () => {
    expect(hasReportData(undefined)).toBe(false);
  });

  it("returns false when all counts are zero and no weeks/urgency/internships", () => {
    expect(hasReportData(makeData())).toBe(false);
  });

  it("returns true when summary.totalConsultations > 0", () => {
    expect(
      hasReportData(
        makeData({ summary: { ...makeEmptySummary(), totalConsultations: 1 } })
      )
    ).toBe(true);
  });

  it("returns true when unitSampleBreakdown has consultations", () => {
    expect(
      hasReportData(
        makeData({
          unitSampleBreakdown: { totalConsultations: 1, autonomy: {} },
        })
      )
    ).toBe(true);
  });

  it("returns true when sampleWeeks is non-empty", () => {
    const week = {
      weekKey: "2024-06-17",
      startDate: "2024-06-17",
      endDate: "2024-06-23",
      consultations: 5,
      uniqueDays: 3,
    };
    expect(hasReportData(makeData({ sampleWeeks: [week] }))).toBe(true);
  });

  it("returns true when firstHalfWeeks is non-empty", () => {
    const week = {
      weekKey: "2024-06-17",
      startDate: "2024-06-17",
      endDate: "2024-06-23",
      consultations: 3,
      uniqueDays: 2,
    };
    expect(hasReportData(makeData({ firstHalfWeeks: [week] }))).toBe(true);
  });

  it("returns true when secondHalfWeeks is non-empty", () => {
    const week = {
      weekKey: "2024-06-17",
      startDate: "2024-06-17",
      endDate: "2024-06-23",
      consultations: 3,
      uniqueDays: 2,
    };
    expect(hasReportData(makeData({ secondHalfWeeks: [week] }))).toBe(true);
  });

  it("returns true when urgencySelection is non-empty", () => {
    const sel = {
      label: "Urgência",
      internship: "cir geral",
      days: [],
      totalConsultations: 2,
      autonomyTotals: {},
    };
    expect(hasReportData(makeData({ urgencySelection: [sel] }))).toBe(true);
  });

  it("returns true when topProblems is non-empty", () => {
    expect(
      hasReportData(makeData({ topProblems: [{ code: "A01", count: 5 }] }))
    ).toBe(true);
  });

  it("returns true when an internship sample has weeks", () => {
    const week = {
      weekKey: "2024-06-17",
      startDate: "2024-06-17",
      endDate: "2024-06-23",
      consultations: 3,
      uniqueDays: 2,
    };
    expect(
      hasReportData(
        makeData({
          internshipsSamples: [
            {
              label: "Pediatria",
              internships: ["pediatria"],
              weeks: [week],
              autonomyCounts: {},
            },
          ],
        })
      )
    ).toBe(true);
  });

  it("returns true when an internship sample has a non-zero autonomy count", () => {
    expect(
      hasReportData(
        makeData({
          internshipsSamples: [
            {
              label: "Pediatria",
              internships: ["pediatria"],
              weeks: [],
              autonomyCounts: { total: 3 },
            },
          ],
        })
      )
    ).toBe(true);
  });

  it("returns false when internship sample has no weeks and all autonomy counts are zero", () => {
    expect(
      hasReportData(
        makeData({
          internshipsSamples: [
            {
              label: "Pediatria",
              internships: ["pediatria"],
              weeks: [],
              autonomyCounts: { total: 0, parcial: 0 },
            },
          ],
        })
      )
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getReportTabKey
// ---------------------------------------------------------------------------

describe("getReportTabKey", () => {
  it("returns the expected Relatórios.<specialty>.<reportKey> format", () => {
    expect(getReportTabKey("mgf", "year1")).toBe("Relatórios.mgf.year1");
    expect(getReportTabKey("mgf", "years2_3")).toBe("Relatórios.mgf.years2_3");
  });

  it("produces distinct keys for different specialty/reportKey combos", () => {
    expect(getReportTabKey("mgf", "year1")).not.toBe(
      getReportTabKey("mgf", "year4")
    );
  });
});

// ---------------------------------------------------------------------------
// getReportTabDisplayName
// ---------------------------------------------------------------------------

describe("getReportTabDisplayName", () => {
  it("returns a Portuguese label for a known MGF report key", () => {
    const label = getReportTabDisplayName("mgf", "year1");
    expect(typeof label).toBe("string");
    expect(label.length).toBeGreaterThan(0);
    // Should not fall back to the raw key
    expect(label).not.toBe("year1");
  });

  it("falls back to the raw reportKey for an unknown MGF key", () => {
    expect(getReportTabDisplayName("mgf", "unknown_key")).toBe("unknown_key");
  });

  it("falls back to the raw reportKey for an unsupported specialty", () => {
    expect(getReportTabDisplayName("other_specialty", "year1")).toBe("year1");
  });
});

// ---------------------------------------------------------------------------
// getReportsForSpecialty
// ---------------------------------------------------------------------------

describe("getReportsForSpecialty", () => {
  it("returns three report entries for MGF", () => {
    const reports = getReportsForSpecialty("mgf");
    expect(reports).toHaveLength(3);
  });

  it("each entry has a non-empty key and label", () => {
    const reports = getReportsForSpecialty("mgf");
    for (const r of reports) {
      expect(typeof r.key).toBe("string");
      expect(r.key.length).toBeGreaterThan(0);
      expect(typeof r.label).toBe("string");
      expect(r.label.length).toBeGreaterThan(0);
    }
  });

  it("includes year1, years2_3, and year4 keys", () => {
    const keys = getReportsForSpecialty("mgf").map((r) => r.key);
    expect(keys).toContain("year1");
    expect(keys).toContain("years2_3");
    expect(keys).toContain("year4");
  });

  it("returns an empty array for an unsupported specialty", () => {
    expect(getReportsForSpecialty("other")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getSpecialtyReportConfig
// ---------------------------------------------------------------------------

describe("getSpecialtyReportConfig", () => {
  it("returns a config for a valid MGF report key", () => {
    const config = getSpecialtyReportConfig("mgf", "year1");
    expect(config).not.toBeNull();
    expect(config!.reportKey).toBe("year1");
    expect(typeof config!.buildReport).toBe("function");
  });

  it("returns configs for all three MGF report keys", () => {
    expect(getSpecialtyReportConfig("mgf", "year1")).not.toBeNull();
    expect(getSpecialtyReportConfig("mgf", "years2_3")).not.toBeNull();
    expect(getSpecialtyReportConfig("mgf", "year4")).not.toBeNull();
  });

  it("returns null for an unknown report key", () => {
    expect(getSpecialtyReportConfig("mgf", "unknown_key")).toBeNull();
  });

  it("returns null for an unsupported specialty", () => {
    expect(getSpecialtyReportConfig("other", "year1")).toBeNull();
  });
});
