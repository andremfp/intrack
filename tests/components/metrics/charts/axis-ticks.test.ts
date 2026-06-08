import { describe, expect, it } from "vitest";

import {
  getCompactTicks,
  getNiceMax,
} from "@/components/metrics/charts/axis-ticks";

describe("getNiceMax", () => {
  it("floors non-positive input to 1 to avoid a degenerate [0, 0] axis domain", () => {
    // An all-zero series must still yield a valid [0, 1] domain; a [0, 0]
    // domain collapses the scale and makes Recharts emit duplicate `0` ticks.
    expect(getNiceMax(0)).toBe(1);
    expect(getNiceMax(-5)).toBe(1);
  });

  it("rounds a raw max up to a nice 1/2/5 × 10ⁿ bound", () => {
    expect(getNiceMax(1)).toBe(1);
    expect(getNiceMax(2)).toBe(2);
    expect(getNiceMax(5)).toBe(5);
    expect(getNiceMax(10)).toBe(10);
    expect(getNiceMax(50)).toBe(50);
  });
});

describe("getCompactTicks", () => {
  it("never returns duplicate ticks (duplicates would collide as React keys)", () => {
    for (const max of [0, 1, 2, 5, 10, 50, 100]) {
      const ticks = getCompactTicks(getNiceMax(max));
      expect(new Set(ticks).size).toBe(ticks.length);
    }
  });

  it("de-duplicates when the midpoint rounds onto an edge tick", () => {
    // niceMax = 1 → [0, Math.round(0.5)=1, 1] → de-duped to [0, 1].
    expect(getCompactTicks(1)).toEqual([0, 1]);
    // All-zero series: niceMax floored to 1 → [0, 1] (not [0, 0, 0]).
    expect(getCompactTicks(getNiceMax(0))).toEqual([0, 1]);
  });

  it("returns three distinct ticks for a normal range", () => {
    expect(getCompactTicks(10)).toEqual([0, 5, 10]);
    expect(getCompactTicks(2)).toEqual([0, 1, 2]);
  });
});
