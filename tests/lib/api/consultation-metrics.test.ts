import { describe, expect, it } from "vitest";

import type { ConsultationMGF } from "@/lib/api/consultations";
import {
  calculateMetrics,
  getEmptyMetrics,
} from "@/lib/api/consultation-metrics";

// ---------------------------------------------------------------------------
// Local factory — all ConsultationMGF columns are nullable (view, not table)
// ---------------------------------------------------------------------------
function makeMGFConsultation(
  overrides: Partial<ConsultationMGF> = {}
): ConsultationMGF {
  return {
    id: crypto.randomUUID(),
    user_id: "u1",
    date: "2024-01-01",
    process_number: 1,
    sex: null,
    age: null,
    age_unit: null,
    type: null,
    presential: null,
    location: null,
    autonomy: null,
    smoker: null,
    vaccination_plan: null,
    alcohol: null,
    drugs: null,
    family_type: null,
    school_level: null,
    professional_situation: null,
    favorite: null,
    details: null,
    specialty_year: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getEmptyMetrics
// ---------------------------------------------------------------------------
describe("getEmptyMetrics", () => {
  it("returns zero totals", () => {
    const m = getEmptyMetrics();
    expect(m.totalConsultations).toBe(0);
    expect(m.averageAge).toBe(0);
  });

  it("returns empty arrays for every breakdown field", () => {
    const m = getEmptyMetrics();
    expect(m.bySex).toEqual([]);
    expect(m.byAgeRange).toEqual([]);
    expect(m.byType).toEqual([]);
    expect(m.byPresential).toEqual([]);
    expect(m.byLocation).toEqual([]);
    expect(m.byAutonomy).toEqual([]);
    expect(m.byOwnList).toEqual([]);
    expect(m.bySmoker).toEqual([]);
    expect(m.byVaccinationPlan).toEqual([]);
    expect(m.byAlcohol).toEqual([]);
    expect(m.byDrugs).toEqual([]);
    expect(m.byFamilyType).toEqual([]);
    expect(m.bySchoolLevel).toEqual([]);
    expect(m.byProfessionalSituation).toEqual([]);
    expect(m.byContraceptive).toEqual([]);
    expect(m.byNewContraceptive).toEqual([]);
    expect(m.byDiagnosis).toEqual([]);
    expect(m.byProblems).toEqual([]);
    expect(m.byNewDiagnosis).toEqual([]);
    expect(m.byReferral).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — empty input
// ---------------------------------------------------------------------------
describe("calculateMetrics — empty input", () => {
  it("returns the same shape as getEmptyMetrics for an empty array", () => {
    const m = calculateMetrics([]);
    expect(m.totalConsultations).toBe(0);
    expect(m.averageAge).toBe(0);
    expect(m.bySex).toEqual([]);
    expect(m.byAgeRange).toEqual([]);
    expect(m.byReferral).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — totalConsultations
// ---------------------------------------------------------------------------
describe("calculateMetrics — totalConsultations", () => {
  it("counts all consultations regardless of field values", () => {
    const m = calculateMetrics([
      makeMGFConsultation(),
      makeMGFConsultation(),
      makeMGFConsultation(),
    ]);
    expect(m.totalConsultations).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — age averaging
// ---------------------------------------------------------------------------
describe("calculateMetrics — age averaging", () => {
  it("computes average for years unit", () => {
    const m = calculateMetrics([makeMGFConsultation({ age: 30, age_unit: "years" })]);
    expect(m.averageAge).toBe(30);
  });

  it("converts months to years for averaging (24 months → 2 years)", () => {
    const m = calculateMetrics([makeMGFConsultation({ age: 24, age_unit: "months" })]);
    expect(m.averageAge).toBe(2);
  });

  it("converts weeks to years for averaging (52.1429 weeks/year)", () => {
    const m = calculateMetrics([makeMGFConsultation({ age: 104, age_unit: "weeks" })]);
    expect(m.averageAge).toBeCloseTo(104 / 52.1429, 2);
  });

  it("converts days to years for averaging (365.25 days/year)", () => {
    const m = calculateMetrics([makeMGFConsultation({ age: 730, age_unit: "days" })]);
    expect(m.averageAge).toBeCloseTo(730 / 365.25, 2);
  });

  it("excludes records with null age from the average", () => {
    const m = calculateMetrics([makeMGFConsultation({ age: null, age_unit: "years" })]);
    expect(m.averageAge).toBe(0);
  });

  it("excludes records with null age_unit from the average", () => {
    const m = calculateMetrics([makeMGFConsultation({ age: 30, age_unit: null })]);
    expect(m.averageAge).toBe(0);
  });

  it("averages across multiple records ignoring those with null age", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ age: 30, age_unit: "years" }),
      makeMGFConsultation({ age: null, age_unit: "years" }),
      makeMGFConsultation({ age: 10, age_unit: "years" }),
    ]);
    // Only the 30-year and 10-year records count → (30+10)/2 = 20
    expect(m.averageAge).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — age range buckets
// ---------------------------------------------------------------------------
describe("calculateMetrics — byAgeRange", () => {
  it.each([
    [0, "0-17"],
    [17, "0-17"],
    [18, "18-44"],
    [44, "18-44"],
    [45, "45-64"],
    [64, "45-64"],
    [65, "65+"],
    [100, "65+"],
  ])("age %i years falls into bucket %s", (age, expectedRange) => {
    const m = calculateMetrics([makeMGFConsultation({ age, age_unit: "years" })]);
    expect(m.byAgeRange).toContainEqual({ range: expectedRange, count: 1 });
  });

  it("omits buckets with zero count from byAgeRange", () => {
    const m = calculateMetrics([makeMGFConsultation({ age: 30, age_unit: "years" })]);
    const ranges = m.byAgeRange.map((b) => b.range);
    expect(ranges).not.toContain("0-17");
    expect(ranges).not.toContain("45-64");
    expect(ranges).not.toContain("65+");
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — bySex
// ---------------------------------------------------------------------------
describe("calculateMetrics — bySex", () => {
  it("counts by sex value", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ sex: "f" }),
      makeMGFConsultation({ sex: "f" }),
      makeMGFConsultation({ sex: "m" }),
    ]);
    expect(m.bySex).toContainEqual({ sex: "f", count: 2 });
    expect(m.bySex).toContainEqual({ sex: "m", count: 1 });
  });

  it("skips records with null sex", () => {
    const m = calculateMetrics([makeMGFConsultation({ sex: null })]);
    expect(m.bySex).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — byType (with label lookup)
// ---------------------------------------------------------------------------
describe("calculateMetrics — byType", () => {
  it("resolves known type values to their Portuguese labels", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ type: "SA" }),
      makeMGFConsultation({ type: "AM" }),
    ]);
    const sa = m.byType.find((t) => t.type === "SA");
    const am = m.byType.find((t) => t.type === "AM");
    expect(sa?.label).toBe("Saúde Adulto");
    expect(am?.label).toBe("Acto Médico");
  });

  it("sorts byType descending by count", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ type: "SA" }),
      makeMGFConsultation({ type: "SA" }),
      makeMGFConsultation({ type: "AM" }),
    ]);
    expect(m.byType[0].type).toBe("SA");
    expect(m.byType[0].count).toBe(2);
    expect(m.byType[1].type).toBe("AM");
    expect(m.byType[1].count).toBe(1);
  });

  it("skips records with null type", () => {
    const m = calculateMetrics([makeMGFConsultation({ type: null })]);
    expect(m.byType).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — byPresential (bool → string key)
// ---------------------------------------------------------------------------
describe("calculateMetrics — byPresential", () => {
  it("maps true to key 'true'", () => {
    const m = calculateMetrics([makeMGFConsultation({ presential: true })]);
    expect(m.byPresential).toContainEqual({ presential: "true", count: 1 });
  });

  it("maps false to key 'false'", () => {
    const m = calculateMetrics([makeMGFConsultation({ presential: false })]);
    expect(m.byPresential).toContainEqual({ presential: "false", count: 1 });
  });

  it("skips null presential", () => {
    const m = calculateMetrics([makeMGFConsultation({ presential: null })]);
    expect(m.byPresential).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — byLocation
// ---------------------------------------------------------------------------
describe("calculateMetrics — byLocation", () => {
  it("counts by location string", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ location: "CS" }),
      makeMGFConsultation({ location: "CS" }),
      makeMGFConsultation({ location: "domicílio" }),
    ]);
    expect(m.byLocation).toContainEqual({ location: "CS", count: 2 });
    expect(m.byLocation).toContainEqual({ location: "domicílio", count: 1 });
  });

  it("skips null location", () => {
    const m = calculateMetrics([makeMGFConsultation({ location: null })]);
    expect(m.byLocation).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — byAutonomy
// ---------------------------------------------------------------------------
describe("calculateMetrics — byAutonomy", () => {
  it("counts by autonomy string", () => {
    const m = calculateMetrics([makeMGFConsultation({ autonomy: "total" })]);
    expect(m.byAutonomy).toContainEqual({ autonomy: "total", count: 1 });
  });

  it("skips null autonomy", () => {
    const m = calculateMetrics([makeMGFConsultation({ autonomy: null })]);
    expect(m.byAutonomy).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — bySmoker
// ---------------------------------------------------------------------------
describe("calculateMetrics — bySmoker", () => {
  it("counts by smoker value", () => {
    const m = calculateMetrics([makeMGFConsultation({ smoker: "sim" })]);
    expect(m.bySmoker).toContainEqual({ smoker: "sim", count: 1 });
  });

  it("skips null smoker", () => {
    const m = calculateMetrics([makeMGFConsultation({ smoker: null })]);
    expect(m.bySmoker).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — byVaccinationPlan / byAlcohol / byDrugs (boolean)
// ---------------------------------------------------------------------------
describe("calculateMetrics — boolean fields (vaccinationPlan, alcohol, drugs)", () => {
  it("maps vaccination_plan true → 'true' key", () => {
    const m = calculateMetrics([makeMGFConsultation({ vaccination_plan: true })]);
    expect(m.byVaccinationPlan).toContainEqual({ vaccinationPlan: "true", count: 1 });
  });

  it("maps vaccination_plan false → 'false' key", () => {
    const m = calculateMetrics([makeMGFConsultation({ vaccination_plan: false })]);
    expect(m.byVaccinationPlan).toContainEqual({ vaccinationPlan: "false", count: 1 });
  });

  it("skips null vaccination_plan", () => {
    const m = calculateMetrics([makeMGFConsultation({ vaccination_plan: null })]);
    expect(m.byVaccinationPlan).toEqual([]);
  });

  it("maps alcohol true → 'true' key", () => {
    const m = calculateMetrics([makeMGFConsultation({ alcohol: true })]);
    expect(m.byAlcohol).toContainEqual({ alcohol: "true", count: 1 });
  });

  it("maps drugs false → 'false' key", () => {
    const m = calculateMetrics([makeMGFConsultation({ drugs: false })]);
    expect(m.byDrugs).toContainEqual({ drugs: "false", count: 1 });
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — byFamilyType, bySchoolLevel, byProfessionalSituation
// ---------------------------------------------------------------------------
describe("calculateMetrics — demographic string fields", () => {
  it("counts family_type", () => {
    const m = calculateMetrics([makeMGFConsultation({ family_type: "nuclear" })]);
    expect(m.byFamilyType).toContainEqual({ familyType: "nuclear", count: 1 });
  });

  it("counts school_level", () => {
    const m = calculateMetrics([makeMGFConsultation({ school_level: "university" })]);
    expect(m.bySchoolLevel).toContainEqual({ schoolLevel: "university", count: 1 });
  });

  it("counts professional_situation", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ professional_situation: "employed" }),
    ]);
    expect(m.byProfessionalSituation).toContainEqual({
      professionalSituation: "employed",
      count: 1,
    });
  });

  it("skips null values", () => {
    const m = calculateMetrics([makeMGFConsultation()]);
    expect(m.byFamilyType).toEqual([]);
    expect(m.bySchoolLevel).toEqual([]);
    expect(m.byProfessionalSituation).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — JSONB details: own_list
// ---------------------------------------------------------------------------
describe("calculateMetrics — byOwnList (details.own_list)", () => {
  it("maps truthy own_list to 'true' key", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { own_list: true } }),
    ]);
    expect(m.byOwnList).toContainEqual({ ownList: "true", count: 1 });
  });

  it("maps falsy own_list to 'false' key", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { own_list: false } }),
    ]);
    expect(m.byOwnList).toContainEqual({ ownList: "false", count: 1 });
  });

  it("skips when details is null", () => {
    const m = calculateMetrics([makeMGFConsultation({ details: null })]);
    expect(m.byOwnList).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — JSONB details: contraceptive
// ---------------------------------------------------------------------------
describe("calculateMetrics — byContraceptive (details.contraceptive)", () => {
  it("counts string contraceptive values", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { contraceptive: "pill" } }),
      makeMGFConsultation({ details: { contraceptive: "pill" } }),
      makeMGFConsultation({ details: { contraceptive: "diu" } }),
    ]);
    expect(m.byContraceptive).toContainEqual({ contraceptive: "pill", count: 2 });
    expect(m.byContraceptive).toContainEqual({ contraceptive: "diu", count: 1 });
  });

  it("sorts byContraceptive descending by count", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { contraceptive: "pill" } }),
      makeMGFConsultation({ details: { contraceptive: "pill" } }),
      makeMGFConsultation({ details: { contraceptive: "diu" } }),
    ]);
    expect(m.byContraceptive[0].contraceptive).toBe("pill");
    expect(m.byContraceptive[1].contraceptive).toBe("diu");
  });

  it("skips non-string contraceptive values", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { contraceptive: 42 } }),
    ]);
    expect(m.byContraceptive).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — JSONB details: new_contraceptive
// ---------------------------------------------------------------------------
describe("calculateMetrics — byNewContraceptive (details.new_contraceptive)", () => {
  it("uses the string value as key when new_contraceptive is a string", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { new_contraceptive: "diu" } }),
    ]);
    expect(m.byNewContraceptive).toContainEqual({ newContraceptive: "diu", count: 1 });
  });

  it("uses 'Sim' as key when new_contraceptive is a non-string truthy value", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { new_contraceptive: true } }),
    ]);
    expect(m.byNewContraceptive).toContainEqual({ newContraceptive: "Sim", count: 1 });
  });

  it("skips falsy new_contraceptive", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { new_contraceptive: false } }),
    ]);
    expect(m.byNewContraceptive).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — JSONB details: diagnosis / problems / new_diagnosis
// ---------------------------------------------------------------------------
describe("calculateMetrics — code arrays (diagnosis, problems, new_diagnosis)", () => {
  it("counts each code in the diagnosis array", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { diagnosis: ["A01", "B02"] } }),
      makeMGFConsultation({ details: { diagnosis: ["A01"] } }),
    ]);
    expect(m.byDiagnosis).toContainEqual({ code: "A01", count: 2 });
    expect(m.byDiagnosis).toContainEqual({ code: "B02", count: 1 });
  });

  it("trims whitespace from diagnosis codes", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { diagnosis: [" A01 "] } }),
    ]);
    expect(m.byDiagnosis).toContainEqual({ code: "A01", count: 1 });
  });

  it("sorts byDiagnosis descending by count", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { diagnosis: ["A01", "B02"] } }),
      makeMGFConsultation({ details: { diagnosis: ["A01"] } }),
    ]);
    expect(m.byDiagnosis[0].code).toBe("A01");
  });

  it("handles null diagnosis gracefully (no entries added)", () => {
    const m = calculateMetrics([makeMGFConsultation({ details: { diagnosis: null } })]);
    expect(m.byDiagnosis).toEqual([]);
  });

  it("counts problems array codes", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { problems: ["P01"] } }),
    ]);
    expect(m.byProblems).toContainEqual({ code: "P01", count: 1 });
  });

  it("counts new_diagnosis array codes", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { new_diagnosis: ["N01"] } }),
    ]);
    expect(m.byNewDiagnosis).toContainEqual({ code: "N01", count: 1 });
  });
});

// ---------------------------------------------------------------------------
// calculateMetrics — JSONB details: referral with motives
// ---------------------------------------------------------------------------
describe("calculateMetrics — byReferral (details.referrence + referrence_motive)", () => {
  it("counts each referral type from the referrence array", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { referrence: ["urgencia"] } }),
      makeMGFConsultation({ details: { referrence: ["urgencia"] } }),
      makeMGFConsultation({ details: { referrence: ["ivg"] } }),
    ]);
    const urgencia = m.byReferral.find((r) => r.referral === "urgencia");
    const ivg = m.byReferral.find((r) => r.referral === "ivg");
    expect(urgencia?.count).toBe(2);
    expect(ivg?.count).toBe(1);
  });

  it("includes a label from the referrence field options", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { referrence: ["urgencia"] } }),
    ]);
    const entry = m.byReferral.find((r) => r.referral === "urgencia");
    expect(entry?.label).toBe("Serviço de Urgência");
  });

  it("tracks motives per referral type", () => {
    const m = calculateMetrics([
      makeMGFConsultation({
        details: { referrence: ["urgencia"], referrence_motive: ["A01", "B02"] },
      }),
    ]);
    const entry = m.byReferral.find((r) => r.referral === "urgencia");
    expect(entry?.motives).toContainEqual({ code: "A01", count: 1 });
    expect(entry?.motives).toContainEqual({ code: "B02", count: 1 });
  });

  it("aggregates motives across multiple consultations with same referral", () => {
    const m = calculateMetrics([
      makeMGFConsultation({
        details: { referrence: ["urgencia"], referrence_motive: ["A01"] },
      }),
      makeMGFConsultation({
        details: { referrence: ["urgencia"], referrence_motive: ["A01"] },
      }),
    ]);
    const entry = m.byReferral.find((r) => r.referral === "urgencia");
    expect(entry?.motives).toContainEqual({ code: "A01", count: 2 });
  });

  it("sorts byReferral descending by count", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { referrence: ["urgencia"] } }),
      makeMGFConsultation({ details: { referrence: ["urgencia"] } }),
      makeMGFConsultation({ details: { referrence: ["ivg"] } }),
    ]);
    expect(m.byReferral[0].referral).toBe("urgencia");
    expect(m.byReferral[1].referral).toBe("ivg");
  });

  it("returns empty motives array when no referrence_motive is set", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { referrence: ["urgencia"] } }),
    ]);
    const entry = m.byReferral.find((r) => r.referral === "urgencia");
    expect(entry?.motives).toEqual([]);
  });

  it("skips non-string values in the referrence array", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { referrence: [null, "", "urgencia"] } }),
    ]);
    // Only "urgencia" counted; null and empty string filtered
    expect(m.byReferral).toHaveLength(1);
    expect(m.byReferral[0].referral).toBe("urgencia");
  });

  it("handles null referrence gracefully", () => {
    const m = calculateMetrics([
      makeMGFConsultation({ details: { referrence: null } }),
    ]);
    expect(m.byReferral).toEqual([]);
  });
});
