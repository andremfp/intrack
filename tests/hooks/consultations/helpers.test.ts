import { describe, expect, it } from "vitest";

import type { ReferrenceEntry, SpecialtyField } from "@/constants";
import {
  getFieldValue,
  initializeFormValues,
} from "@/hooks/consultations/helpers";
import { makeConsultationMGF } from "../../factories/consultation";

// ---------------------------------------------------------------------------
// getFieldValue
// ---------------------------------------------------------------------------

describe("getFieldValue", () => {
  // -------------------------------------------------------------------------
  // text-list
  // -------------------------------------------------------------------------

  describe("text-list", () => {
    const field: SpecialtyField = { key: "notes", label: "Notes", type: "text-list" };

    it("passes an existing array through unchanged", () => {
      expect(getFieldValue(field, ["a", "b"])).toEqual(["a", "b"]);
    });

    it("returns [''] when value is undefined", () => {
      expect(getFieldValue(field, undefined)).toEqual([""]);
    });

    it("returns [''] when value is null", () => {
      expect(getFieldValue(field, null)).toEqual([""]);
    });
  });

  // -------------------------------------------------------------------------
  // code-search — multiple mode
  // -------------------------------------------------------------------------

  describe("code-search (multiple=true)", () => {
    const field: SpecialtyField = {
      key: "problems",
      label: "Problems",
      type: "code-search",
      multiple: true,
    };

    it("passes an existing array through unchanged", () => {
      expect(getFieldValue(field, ["A01", "B02"])).toEqual(["A01", "B02"]);
    });

    it("returns [] when value is undefined", () => {
      expect(getFieldValue(field, undefined)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // code-search — single mode
  // -------------------------------------------------------------------------

  describe("code-search (multiple=false / undefined)", () => {
    const field: SpecialtyField = {
      key: "profession",
      label: "Profession",
      type: "code-search",
    };

    it("passes an existing string through unchanged", () => {
      expect(getFieldValue(field, "medic")).toBe("medic");
    });

    it("returns '' when value is undefined", () => {
      expect(getFieldValue(field, undefined)).toBe("");
    });
  });

  // -------------------------------------------------------------------------
  // boolean
  // -------------------------------------------------------------------------

  describe("boolean", () => {
    const field: SpecialtyField = { key: "presential", label: "Presential", type: "boolean" };
    const fieldWithDefault: SpecialtyField = {
      key: "smoker",
      label: "Smoker",
      type: "boolean",
      defaultValue: "false",
    };

    it("converts true → 'true'", () => {
      expect(getFieldValue(field, true)).toBe("true");
    });

    it("converts false → 'false'", () => {
      expect(getFieldValue(field, false)).toBe("false");
    });

    it("passes an already-string 'true' through", () => {
      expect(getFieldValue(field, "true")).toBe("true");
    });

    it("passes an already-string 'false' through", () => {
      expect(getFieldValue(field, "false")).toBe("false");
    });

    it("returns '' when value is undefined and no defaultValue", () => {
      expect(getFieldValue(field, undefined)).toBe("");
    });

    it("uses field.defaultValue when value is undefined", () => {
      expect(getFieldValue(fieldWithDefault, undefined)).toBe("false");
    });
  });

  // -------------------------------------------------------------------------
  // referrence-list
  // -------------------------------------------------------------------------

  describe("referrence-list", () => {
    const field: SpecialtyField = {
      key: "referrences",
      label: "Referrences",
      type: "referrence-list",
    };

    it("passes an existing array through unchanged", () => {
      const entries: ReferrenceEntry[] = [{ cardio: ["A01"] }];
      expect(getFieldValue(field, entries)).toEqual(entries);
    });

    it("returns [] when value is undefined", () => {
      expect(getFieldValue(field, undefined)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // multi-select
  // -------------------------------------------------------------------------

  describe("multi-select", () => {
    const field: SpecialtyField = {
      key: "medications",
      label: "Medications",
      type: "multi-select",
    };

    it("passes an existing array through unchanged", () => {
      expect(getFieldValue(field, ["med1", "med2"])).toEqual(["med1", "med2"]);
    });

    it("returns [] when value is undefined", () => {
      expect(getFieldValue(field, undefined)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Other types (text, number, select)
  // -------------------------------------------------------------------------

  describe("other types (text, number, select)", () => {
    const textField: SpecialtyField = { key: "location", label: "Location", type: "text" };
    const numField: SpecialtyField = { key: "age", label: "Age", type: "number" };
    const fieldWithDefault: SpecialtyField = {
      key: "age_unit",
      label: "Age unit",
      type: "select",
      defaultValue: "years",
    };

    it("converts a number value to string", () => {
      expect(getFieldValue(numField, 42)).toBe("42");
    });

    it("passes an existing string value through", () => {
      expect(getFieldValue(textField, "unidade")).toBe("unidade");
    });

    it("returns '' when value is undefined and no defaultValue", () => {
      expect(getFieldValue(textField, undefined)).toBe("");
    });

    it("uses field.defaultValue when value is undefined", () => {
      expect(getFieldValue(fieldWithDefault, undefined)).toBe("years");
    });

    it("returns '' when value is null and no defaultValue", () => {
      expect(getFieldValue(textField, null)).toBe("");
    });
  });
});

// ---------------------------------------------------------------------------
// initializeFormValues
// ---------------------------------------------------------------------------

describe("initializeFormValues", () => {
  // Minimal specialty fields for most tests: just a "type" flat-JSONB field
  const typeField: SpecialtyField = { key: "type", label: "Tipo", type: "select" };
  const minimalSpecialtyFields: SpecialtyField[] = [typeField];

  // -------------------------------------------------------------------------
  // Source 1 — top-level view columns (COMMON_CONSULTATION_FIELDS)
  // -------------------------------------------------------------------------

  describe("Source 1: top-level view columns", () => {
    it("reads sex, age, age_unit from consultation top-level fields", () => {
      const consultation = makeConsultationMGF({
        sex: "f",
        age: 45,
        age_unit: "years",
      });

      const result = initializeFormValues(minimalSpecialtyFields, consultation);

      expect(result.sex).toBe("f");
      expect(result.age).toBe("45");
      expect(result.age_unit).toBe("years");
    });

    it("converts date to YYYY-MM-DD format", () => {
      const consultation = makeConsultationMGF({ date: "2023-09-15" });

      const result = initializeFormValues(minimalSpecialtyFields, consultation);

      expect(result.date).toBe("2023-09-15");
    });

    it("defaults date to today when no consultation is provided", () => {
      const today = new Date().toISOString().split("T")[0];

      const result = initializeFormValues(minimalSpecialtyFields, null);

      expect(result.date).toBe(today);
    });
  });

  // -------------------------------------------------------------------------
  // specialty_year
  // -------------------------------------------------------------------------

  describe("specialty_year", () => {
    it("stringifies the consultation specialty_year", () => {
      const consultation = makeConsultationMGF({ specialty_year: 3 });

      const result = initializeFormValues(minimalSpecialtyFields, consultation);

      expect(result.specialty_year).toBe("3");
    });

    it("defaults to '1' when specialty_year is absent on the consultation", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const consultation = makeConsultationMGF({ specialty_year: undefined as any });

      const result = initializeFormValues(minimalSpecialtyFields, consultation);

      expect(result.specialty_year).toBe("1");
    });

    it("defaults to '1' for a new consultation (null)", () => {
      const result = initializeFormValues(minimalSpecialtyFields, null);

      expect(result.specialty_year).toBe("1");
    });
  });

  // -------------------------------------------------------------------------
  // Source 2 — flat fields in details JSONB
  // -------------------------------------------------------------------------

  describe("Source 2: flat fields in details JSONB", () => {
    it("reads a flat field from details", () => {
      const consultation = makeConsultationMGF({
        details: { type: "SA" },
      });

      const result = initializeFormValues(minimalSpecialtyFields, consultation);

      expect(result.type).toBe("SA");
    });

    it("returns empty string for a flat field absent from details", () => {
      const consultation = makeConsultationMGF({ details: {} });

      const result = initializeFormValues(minimalSpecialtyFields, consultation);

      expect(result.type).toBe("");
    });

    it("does not overwrite a key already set by Source 1", () => {
      // "date" is set by Source 1; adding it to specialtyFields should be ignored
      const dateAlsoInSpecialty: SpecialtyField[] = [
        { key: "date", label: "Data", type: "text" },
      ];
      const consultation = makeConsultationMGF({
        date: "2023-01-01",
        details: { date: "should-not-win" },
      });

      const result = initializeFormValues(dateAlsoInSpecialty, consultation);

      expect(result.date).toBe("2023-01-01");
    });
  });

  // -------------------------------------------------------------------------
  // Source 3 — nested fields in details JSONB (type-specific sections)
  // -------------------------------------------------------------------------

  describe("Source 3: nested type-specific fields in details JSONB", () => {
    // Use real DM sections from constants; path is details.dm["dm_exams"]["creatinina"]
    const dmSpecialtyFields: SpecialtyField[] = [
      { key: "type", label: "Tipo", type: "select" },
    ];

    it("reads a nested field from the correct type/section/field path", () => {
      const consultation = makeConsultationMGF({
        details: {
          type: "DM",
          dm: { dm_exams: { creatinina: "1.2" } },
        },
      });

      const result = initializeFormValues(dmSpecialtyFields, consultation);

      expect(result.creatinina).toBe("1.2");
    });

    it("defaults nested field to empty string when nested structure is absent", () => {
      const consultation = makeConsultationMGF({
        details: { type: "DM" },
      });

      const result = initializeFormValues(dmSpecialtyFields, consultation);

      // creatinina is a number field with no defaultValue → falls back to ""
      expect(result.creatinina).toBe("");
    });

    it("does not overwrite a key already set by Source 2 with Source 3 value", () => {
      // creatinina appears as a flat Source-2 field AND in DM nested sections
      const creatininaAlsoFlat: SpecialtyField[] = [
        { key: "type", label: "Tipo", type: "select" },
        { key: "creatinina", label: "Creatinina", type: "number" }, // flat in details
      ];
      const consultation = makeConsultationMGF({
        details: {
          type: "DM",
          creatinina: "from_source_2",
          dm: { dm_exams: { creatinina: "from_source_3" } },
        },
      });

      const result = initializeFormValues(creatininaAlsoFlat, consultation);

      expect(result.creatinina).toBe("from_source_2");
    });

    it("produces no type-specific keys when consultation type is empty", () => {
      const consultation = makeConsultationMGF({ details: {} });

      const result = initializeFormValues(minimalSpecialtyFields, consultation);

      // DM-specific field should not be present
      expect(result.creatinina).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // New consultation defaults (editingConsultation = null)
  // -------------------------------------------------------------------------

  describe("new consultation (editingConsultation = null)", () => {
    it("initializes all common fields with defaults", () => {
      const result = initializeFormValues(minimalSpecialtyFields, null);

      // date → today; others → defaults or ""
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.sex).toBe("");
      expect(result.age).toBe("");
      // age_unit has a defaultValue of "years"
      expect(result.age_unit).toBe("years");
      expect(result.specialty_year).toBe("1");
    });

    it("initializes specialty fields with defaults when no consultation", () => {
      const result = initializeFormValues(minimalSpecialtyFields, null);

      expect(result.type).toBe("");
    });
  });
});
