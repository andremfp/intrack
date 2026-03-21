import { describe, expect, it } from "vitest";

import {
  getSexLabel,
  mapEnabledFieldsToDataFields,
} from "@/components/metrics/helpers";

// ---------------------------------------------------------------------------
// getSexLabel
// ---------------------------------------------------------------------------

describe("getSexLabel", () => {
  it('maps "m" to "Masculino"', () => {
    expect(getSexLabel("m")).toBe("Masculino");
  });

  it('maps "f" to "Feminino"', () => {
    expect(getSexLabel("f")).toBe("Feminino");
  });

  it('maps "other" to "Outro"', () => {
    expect(getSexLabel("other")).toBe("Outro");
  });

  it("passes through an unknown value unchanged", () => {
    expect(getSexLabel("unknown")).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// mapEnabledFieldsToDataFields
// ---------------------------------------------------------------------------

describe("mapEnabledFieldsToDataFields", () => {
  it('maps "ageRange" to ["ageMin", "ageMax"]', () => {
    expect(mapEnabledFieldsToDataFields(["ageRange"])).toEqual([
      "ageMin",
      "ageMax",
    ]);
  });

  it('maps "dateRange" to ["dateFrom", "dateTo"]', () => {
    expect(mapEnabledFieldsToDataFields(["dateRange"])).toEqual([
      "dateFrom",
      "dateTo",
    ]);
  });

  it("maps each single-key field to itself", () => {
    const singleFields = [
      "year",
      "location",
      "internship",
      "sex",
      "autonomy",
      "processNumber",
      "type",
      "presential",
      "smoker",
      "contraceptive",
      "new_contraceptive",
      "family_type",
      "school_level",
      "profession",
      "vaccination_plan",
    ] as const;

    for (const field of singleFields) {
      expect(mapEnabledFieldsToDataFields([field])).toEqual([field]);
    }
  });

  it("produces no output for unknown fields", () => {
    expect(mapEnabledFieldsToDataFields(["unknownField"])).toEqual([]);
  });

  it("handles a mix of known and unknown fields", () => {
    expect(
      mapEnabledFieldsToDataFields(["ageRange", "unknownField", "sex"])
    ).toEqual(["ageMin", "ageMax", "sex"]);
  });

  it("returns an empty array for an empty input", () => {
    expect(mapEnabledFieldsToDataFields([])).toEqual([]);
  });
});
