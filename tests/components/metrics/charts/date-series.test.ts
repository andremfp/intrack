import { describe, expect, it } from "vitest";

import {
  fillDailySeries,
  resolveSeriesEnd,
} from "@/components/metrics/charts/date-series";

describe("fillDailySeries", () => {
  it("returns an empty array for no data", () => {
    expect(fillDailySeries([])).toEqual([]);
  });

  it("returns a single point unchanged", () => {
    expect(fillDailySeries([{ date: "2026-05-06", count: 1 }])).toEqual([
      { date: "2026-05-06", count: 1 },
    ]);
  });

  it("zero-fills gaps between days", () => {
    expect(
      fillDailySeries([
        { date: "2026-03-01", count: 2 },
        { date: "2026-03-03", count: 5 },
      ])
    ).toEqual([
      { date: "2026-03-01", count: 2 },
      { date: "2026-03-02", count: 0 },
      { date: "2026-03-03", count: 5 },
    ]);
  });

  it("includes the last data day when no explicit range is given (the 'Tudo' bug)", () => {
    const result = fillDailySeries([
      { date: "2026-05-06", count: 1 },
      { date: "2026-06-01", count: 1 },
    ]);

    // First and last days are present and correctly counted...
    expect(result[0]).toEqual({ date: "2026-05-06", count: 1 });
    expect(result[result.length - 1]).toEqual({ date: "2026-06-01", count: 1 });
    // ...no day is shifted off either end (no phantom 2026-05-05)...
    expect(result.some((p) => p.date === "2026-05-05")).toBe(false);
    // ...and the gap days are zero-filled. May 6 → Jun 1 inclusive = 27 days.
    expect(result).toHaveLength(27);
    expect(result.find((p) => p.date === "2026-05-07")?.count).toBe(0);
  });

  it("honours an explicit inclusive range, zero-filling the edges", () => {
    const result = fillDailySeries(
      [{ date: "2026-03-02", count: 1 }],
      "2026-03-01",
      "2026-03-04"
    );

    expect(result.map((p) => p.date)).toEqual([
      "2026-03-01",
      "2026-03-02",
      "2026-03-03",
      "2026-03-04",
    ]);
    expect(result.find((p) => p.date === "2026-03-02")?.count).toBe(1);
    // The range end is inclusive.
    expect(result.find((p) => p.date === "2026-03-04")?.count).toBe(0);
  });
});

describe("resolveSeriesEnd", () => {
  it("uses the explicit filter end when one is set (presets)", () => {
    expect(resolveSeriesEnd("2026-06-08", "2026-06-01", "2026-03-31")).toBe(
      "2026-03-31"
    );
  });

  it("extends to today when there is no explicit end ('Tudo')", () => {
    expect(resolveSeriesEnd("2026-06-08", "2026-06-01")).toBe("2026-06-08");
  });

  it("never ends before the last data day (future-dated data)", () => {
    expect(resolveSeriesEnd("2026-06-08", "2026-06-20")).toBe("2026-06-20");
  });

  it("falls back to today when there is no data", () => {
    expect(resolveSeriesEnd("2026-06-08", undefined)).toBe("2026-06-08");
  });
});
