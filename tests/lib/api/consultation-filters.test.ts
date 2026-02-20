import { describe, expect, it, vi } from "vitest";

import { applyMGFFilters } from "@/lib/api/consultation-filters";

// ---------------------------------------------------------------------------
// Mock query builder factory
// Each test gets a fresh mock so state never leaks between tests.
// All methods return `query` itself to support Supabase-style chaining.
// ---------------------------------------------------------------------------
function makeQuery() {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    or: vi.fn(),
    neq: vi.fn(),
    ilike: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    in: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(),
  };
  Object.values(query).forEach((fn) => fn.mockReturnValue(query));
  return query;
}

// ---------------------------------------------------------------------------
// applyMGFFilters — unified filter function for all MGF query callers
//
// Unified behaviour (resolved from historical inconsistencies):
//   internship  → ilike (case-insensitive, no wildcard)
//   profession  → ilike with trailing % (matches code-only and "CODE - Desc")
//   age math    → precise 52.1429 weeks/yr and 365.25 days/yr;
//                 Math.floor for ageMin, Math.ceil for ageMax
//   year        → maps to specialty_year column
//   excludeType → optional third arg; adds neq("type", ...)
// ---------------------------------------------------------------------------
describe("applyMGFFilters", () => {
  // -------------------------------------------------------------------------
  // Empty / no-op
  // -------------------------------------------------------------------------
  it("does not call any filter methods when filters object is empty", () => {
    const query = makeQuery();
    applyMGFFilters(query, {});
    expect(query.eq).not.toHaveBeenCalled();
    expect(query.gte).not.toHaveBeenCalled();
    expect(query.lte).not.toHaveBeenCalled();
    expect(query.or).not.toHaveBeenCalled();
    expect(query.neq).not.toHaveBeenCalled();
    expect(query.ilike).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // year → specialty_year
  // -------------------------------------------------------------------------
  it("maps filters.year to specialty_year column", () => {
    const query = makeQuery();
    applyMGFFilters(query, { year: 2 });
    expect(query.eq).toHaveBeenCalledWith("specialty_year", 2);
  });

  // -------------------------------------------------------------------------
  // Top-level scalar fields
  // -------------------------------------------------------------------------
  it("applies location filter", () => {
    const query = makeQuery();
    applyMGFFilters(query, { location: "CS" });
    expect(query.eq).toHaveBeenCalledWith("location", "CS");
  });

  it("applies sex filter", () => {
    const query = makeQuery();
    applyMGFFilters(query, { sex: "f" });
    expect(query.eq).toHaveBeenCalledWith("sex", "f");
  });

  it("applies type filter", () => {
    const query = makeQuery();
    applyMGFFilters(query, { type: "SA" });
    expect(query.eq).toHaveBeenCalledWith("type", "SA");
  });

  it("applies autonomy filter", () => {
    const query = makeQuery();
    applyMGFFilters(query, { autonomy: "total" });
    expect(query.eq).toHaveBeenCalledWith("autonomy", "total");
  });

  it("applies smoker filter", () => {
    const query = makeQuery();
    applyMGFFilters(query, { smoker: "sim" });
    expect(query.eq).toHaveBeenCalledWith("smoker", "sim");
  });

  // -------------------------------------------------------------------------
  // Boolean fields — false must NOT be skipped
  // -------------------------------------------------------------------------
  it("applies presential=false (false is not skipped)", () => {
    const query = makeQuery();
    applyMGFFilters(query, { presential: false });
    expect(query.eq).toHaveBeenCalledWith("presential", false);
  });

  it("applies vaccination_plan=true filter", () => {
    const query = makeQuery();
    applyMGFFilters(query, { vaccination_plan: true });
    expect(query.eq).toHaveBeenCalledWith("vaccination_plan", true);
  });

  it("applies vaccination_plan=false (false is not skipped)", () => {
    const query = makeQuery();
    applyMGFFilters(query, { vaccination_plan: false });
    expect(query.eq).toHaveBeenCalledWith("vaccination_plan", false);
  });

  it("applies alcohol=false (false is not skipped)", () => {
    const query = makeQuery();
    applyMGFFilters(query, { alcohol: false });
    expect(query.eq).toHaveBeenCalledWith("alcohol", false);
  });

  it("applies drugs=false (false is not skipped)", () => {
    const query = makeQuery();
    applyMGFFilters(query, { drugs: false });
    expect(query.eq).toHaveBeenCalledWith("drugs", false);
  });

  // -------------------------------------------------------------------------
  // Date range
  // -------------------------------------------------------------------------
  it("applies dateFrom with gte", () => {
    const query = makeQuery();
    applyMGFFilters(query, { dateFrom: "2024-01-01" });
    expect(query.gte).toHaveBeenCalledWith("date", "2024-01-01");
  });

  it("applies dateTo with lte", () => {
    const query = makeQuery();
    applyMGFFilters(query, { dateTo: "2024-12-31" });
    expect(query.lte).toHaveBeenCalledWith("date", "2024-12-31");
  });

  // -------------------------------------------------------------------------
  // processNumber — parsed to integer
  // -------------------------------------------------------------------------
  it("parses processNumber string to integer", () => {
    const query = makeQuery();
    applyMGFFilters(query, { processNumber: "12345" });
    expect(query.eq).toHaveBeenCalledWith("process_number", 12345);
  });

  // -------------------------------------------------------------------------
  // JSONB details fields
  // -------------------------------------------------------------------------
  it("applies internship with ilike (not eq)", () => {
    const query = makeQuery();
    applyMGFFilters(query, { internship: "cardio" });
    expect(query.ilike).toHaveBeenCalledWith("details->>internship", "cardio");
    expect(query.eq).not.toHaveBeenCalled();
  });

  it("applies profession with ilike and trailing percent suffix", () => {
    const query = makeQuery();
    applyMGFFilters(query, { profession: "nurse" });
    expect(query.ilike).toHaveBeenCalledWith("details->>profession", "nurse%");
  });

  it("applies family_type filter", () => {
    const query = makeQuery();
    applyMGFFilters(query, { family_type: "nuclear" });
    expect(query.eq).toHaveBeenCalledWith("details->>family_type", "nuclear");
  });

  it("applies school_level filter", () => {
    const query = makeQuery();
    applyMGFFilters(query, { school_level: "university" });
    expect(query.eq).toHaveBeenCalledWith("details->>school_level", "university");
  });

  it("applies professional_situation filter", () => {
    const query = makeQuery();
    applyMGFFilters(query, { professional_situation: "employed" });
    expect(query.eq).toHaveBeenCalledWith(
      "details->>professional_situation",
      "employed"
    );
  });

  it("applies contraceptive filter", () => {
    const query = makeQuery();
    applyMGFFilters(query, { contraceptive: "pill" });
    expect(query.eq).toHaveBeenCalledWith("details->>contraceptive", "pill");
  });

  it("applies new_contraceptive filter", () => {
    const query = makeQuery();
    applyMGFFilters(query, { new_contraceptive: "diu" });
    expect(query.eq).toHaveBeenCalledWith("details->>new_contraceptive", "diu");
  });

  // -------------------------------------------------------------------------
  // Age filtering — or() with four unit conversions
  // Precise factors: 52.1429 weeks/yr, 365.25 days/yr
  // ageMin uses Math.floor; ageMax uses Math.ceil
  // -------------------------------------------------------------------------
  it("applies ageMin with all four unit conversions (floor)", () => {
    const query = makeQuery();
    applyMGFFilters(query, { ageMin: 18 });
    expect(query.or).toHaveBeenCalledOnce();
    const orArg: string = (query.or.mock.calls[0] as [string])[0];
    expect(orArg).toContain("age.gte.18");    // years: 18
    expect(orArg).toContain("age.gte.216");   // months: 18 × 12 = 216
    expect(orArg).toContain("age.gte.938");   // weeks:  floor(18 × 52.1429) = 938
    expect(orArg).toContain("age.gte.6574");  // days:   floor(18 × 365.25)  = 6574
  });

  it("applies ageMax with all four unit conversions (ceil)", () => {
    const query = makeQuery();
    applyMGFFilters(query, { ageMax: 65 });
    expect(query.or).toHaveBeenCalledOnce();
    const orArg: string = (query.or.mock.calls[0] as [string])[0];
    expect(orArg).toContain("age.lte.65");    // years: 65
    expect(orArg).toContain("age.lte.780");   // months: 65 × 12 = 780
    expect(orArg).toContain("age.lte.3390");  // weeks:  ceil(65 × 52.1429) = 3390
    expect(orArg).toContain("age.lte.23742"); // days:   ceil(65 × 365.25)  = 23742
  });

  it("emits a single or() call when both ageMin and ageMax are set", () => {
    const query = makeQuery();
    applyMGFFilters(query, { ageMin: 18, ageMax: 65 });
    expect(query.or).toHaveBeenCalledOnce();
    const orArg: string = (query.or.mock.calls[0] as [string])[0];
    expect(orArg).toContain("age.gte.18");
    expect(orArg).toContain("age.lte.65");
  });

  // -------------------------------------------------------------------------
  // excludeType — optional third argument
  // -------------------------------------------------------------------------
  it("applies excludeType via neq when passed as third argument", () => {
    const query = makeQuery();
    applyMGFFilters(query, {}, "AM");
    expect(query.neq).toHaveBeenCalledWith("type", "AM");
    expect(query.eq).not.toHaveBeenCalled();
  });

  it("does not call neq when excludeType is not provided", () => {
    const query = makeQuery();
    applyMGFFilters(query, { type: "SA" });
    expect(query.neq).not.toHaveBeenCalled();
  });

  it("applies both type eq and excludeType neq when both are set", () => {
    const query = makeQuery();
    applyMGFFilters(query, { type: "SA" }, "AM");
    expect(query.eq).toHaveBeenCalledWith("type", "SA");
    expect(query.neq).toHaveBeenCalledWith("type", "AM");
  });
});
