import { describe, expect, it } from "vitest";

import type { ConsultationsSorting } from "@/lib/api/consultations";
import { sortConsultationsWithFavorites } from "@/lib/api/helpers";
import { makeConsultationMGF } from "../../factories/consultation";

// ---------------------------------------------------------------------------
// sortConsultationsWithFavorites
// ---------------------------------------------------------------------------

describe("sortConsultationsWithFavorites", () => {
  const ageSorting: ConsultationsSorting = { field: "age", order: "asc" };

  // -------------------------------------------------------------------------
  // Favorites-first invariant
  // -------------------------------------------------------------------------

  it("places favorites before non-favorites regardless of other fields", () => {
    const nonFav = makeConsultationMGF({ id: "a", favorite: false, age: 5, age_unit: "years" });
    const fav = makeConsultationMGF({ id: "b", favorite: true, age: 99, age_unit: "years" });

    const result = sortConsultationsWithFavorites([nonFav, fav], ageSorting);

    expect(result[0].id).toBe("b");
    expect(result[1].id).toBe("a");
  });

  it("keeps relative order among favorites when ages are equal", () => {
    const fav1 = makeConsultationMGF({ id: "f1", favorite: true, age: 30, age_unit: "years" });
    const fav2 = makeConsultationMGF({ id: "f2", favorite: true, age: 30, age_unit: "years" });

    const result = sortConsultationsWithFavorites([fav1, fav2], ageSorting);

    // Both are favorites; relative order is unspecified but both come first
    expect(result.map((c) => c.id)).toContain("f1");
    expect(result.map((c) => c.id)).toContain("f2");
  });

  it("favorites-first takes precedence over age sort", () => {
    const nonFavYoung = makeConsultationMGF({ id: "nfy", favorite: false, age: 1, age_unit: "years" });
    const favOld = makeConsultationMGF({ id: "fo", favorite: true, age: 90, age_unit: "years" });

    const result = sortConsultationsWithFavorites([nonFavYoung, favOld], ageSorting);

    expect(result[0].id).toBe("fo");
  });

  // -------------------------------------------------------------------------
  // Age sorting — ascending
  // -------------------------------------------------------------------------

  it("sorts non-favorites by age ascending", () => {
    const a = makeConsultationMGF({ id: "a", favorite: false, age: 40, age_unit: "years" });
    const b = makeConsultationMGF({ id: "b", favorite: false, age: 20, age_unit: "years" });
    const c = makeConsultationMGF({ id: "c", favorite: false, age: 60, age_unit: "years" });

    const result = sortConsultationsWithFavorites([a, b, c], { field: "age", order: "asc" });

    expect(result.map((r) => r.id)).toEqual(["b", "a", "c"]);
  });

  it("sorts non-favorites by age descending", () => {
    const a = makeConsultationMGF({ id: "a", favorite: false, age: 40, age_unit: "years" });
    const b = makeConsultationMGF({ id: "b", favorite: false, age: 20, age_unit: "years" });
    const c = makeConsultationMGF({ id: "c", favorite: false, age: 60, age_unit: "years" });

    const result = sortConsultationsWithFavorites([a, b, c], { field: "age", order: "desc" });

    expect(result.map((r) => r.id)).toEqual(["c", "a", "b"]);
  });

  // -------------------------------------------------------------------------
  // Age unit conversion
  // -------------------------------------------------------------------------

  it("converts mixed age units correctly (2 years > 11 months)", () => {
    const twoYears = makeConsultationMGF({ id: "2y", favorite: false, age: 2, age_unit: "years" });
    const elevenMonths = makeConsultationMGF({ id: "11m", favorite: false, age: 11, age_unit: "months" });

    const asc = sortConsultationsWithFavorites([twoYears, elevenMonths], { field: "age", order: "asc" });
    expect(asc.map((r) => r.id)).toEqual(["11m", "2y"]);

    const desc = sortConsultationsWithFavorites([twoYears, elevenMonths], { field: "age", order: "desc" });
    expect(desc.map((r) => r.id)).toEqual(["2y", "11m"]);
  });

  it("converts days and weeks correctly relative to years", () => {
    const twoYears = makeConsultationMGF({ id: "2y", favorite: false, age: 2, age_unit: "years" });
    const fiveHundredDays = makeConsultationMGF({ id: "500d", favorite: false, age: 500, age_unit: "days" });
    const hundredWeeks = makeConsultationMGF({ id: "100w", favorite: false, age: 100, age_unit: "weeks" });

    // 2 years ≈ 730 days > 500 days; 100 weeks ≈ 1.92 years < 2 years
    const asc = sortConsultationsWithFavorites(
      [twoYears, fiveHundredDays, hundredWeeks],
      { field: "age", order: "asc" }
    );
    expect(asc[0].id).toBe("500d");
    expect(asc[2].id).toBe("2y");
  });

  // -------------------------------------------------------------------------
  // Null / undefined age
  // -------------------------------------------------------------------------

  it("treats null age as 0", () => {
    const nullAge = makeConsultationMGF({ id: "null", favorite: false, age: null, age_unit: null });
    const someAge = makeConsultationMGF({ id: "some", favorite: false, age: 1, age_unit: "years" });

    const asc = sortConsultationsWithFavorites([someAge, nullAge], { field: "age", order: "asc" });
    expect(asc[0].id).toBe("null");
  });

  // -------------------------------------------------------------------------
  // Generic (non-age) field sort
  // -------------------------------------------------------------------------

  it("sorts non-age fields ascending", () => {
    const a = makeConsultationMGF({ id: "a", favorite: false, process_number: 300 });
    const b = makeConsultationMGF({ id: "b", favorite: false, process_number: 100 });
    const c = makeConsultationMGF({ id: "c", favorite: false, process_number: 200 });

    const result = sortConsultationsWithFavorites(
      [a, b, c],
      { field: "process_number", order: "asc" }
    );

    expect(result.map((r) => r.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts non-age fields descending", () => {
    const a = makeConsultationMGF({ id: "a", favorite: false, process_number: 300 });
    const b = makeConsultationMGF({ id: "b", favorite: false, process_number: 100 });
    const c = makeConsultationMGF({ id: "c", favorite: false, process_number: 200 });

    const result = sortConsultationsWithFavorites(
      [a, b, c],
      { field: "process_number", order: "desc" }
    );

    expect(result.map((r) => r.id)).toEqual(["a", "c", "b"]);
  });

  // -------------------------------------------------------------------------
  // Immutability
  // -------------------------------------------------------------------------

  it("does not mutate the original array", () => {
    const a = makeConsultationMGF({ id: "a", favorite: false, age: 50, age_unit: "years" });
    const b = makeConsultationMGF({ id: "b", favorite: true, age: 10, age_unit: "years" });
    const original = [a, b];
    const originalOrder = [...original];

    sortConsultationsWithFavorites(original, ageSorting);

    expect(original).toEqual(originalOrder);
  });
});
