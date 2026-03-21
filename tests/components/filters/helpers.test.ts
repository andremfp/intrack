import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildFilterBadgeConfigs,
  createFilterSetters,
  generatePrettyFilterLabel,
  hasValue,
} from "@/components/filters/helpers";
import type { Specialty } from "@/lib/api/specialties";

// ---------------------------------------------------------------------------
// hasValue
// ---------------------------------------------------------------------------

describe("hasValue", () => {
  it("returns false for undefined", () => {
    expect(hasValue(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(hasValue("")).toBe(false);
  });

  it("returns false for null", () => {
    expect(hasValue(null)).toBe(false);
  });

  it("returns true for a non-empty string", () => {
    expect(hasValue("hello")).toBe(true);
  });

  it("returns true for zero (0 is a real value)", () => {
    expect(hasValue(0)).toBe(true);
  });

  it("returns true for false (boolean false is a real value)", () => {
    expect(hasValue(false)).toBe(true);
  });

  it("returns true for a number", () => {
    expect(hasValue(42)).toBe(true);
  });

  it("returns true for an object", () => {
    expect(hasValue({})).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createFilterSetters
// ---------------------------------------------------------------------------

describe("createFilterSetters", () => {
  it("returns undefined when fields is empty", () => {
    const setFilter = vi.fn();
    const result = createFilterSetters({ setFilter, fields: [] });
    expect(result).toBeUndefined();
  });

  it("returns undefined when fields is not provided", () => {
    const setFilter = vi.fn();
    const result = createFilterSetters({ setFilter });
    expect(result).toBeUndefined();
  });

  it("creates a setter for each provided field", () => {
    const setFilter = vi.fn();
    const result = createFilterSetters({
      setFilter,
      fields: ["sex", "autonomy"],
    });
    expect(result).toBeDefined();
    expect(result).toHaveProperty("sex");
    expect(result).toHaveProperty("autonomy");
  });

  it("number fields coerce value to Number", () => {
    const setFilter = vi.fn();
    const result = createFilterSetters({ setFilter, fields: ["ageMin"] })!;
    result["ageMin"]("25");
    expect(setFilter).toHaveBeenCalledWith("ageMin", 25);
  });

  it("number fields coerce empty string to undefined", () => {
    const setFilter = vi.fn();
    const result = createFilterSetters({ setFilter, fields: ["ageMax"] })!;
    result["ageMax"]("");
    expect(setFilter).toHaveBeenCalledWith("ageMax", undefined);
  });

  it("number fields coerce undefined to undefined", () => {
    const setFilter = vi.fn();
    const result = createFilterSetters({ setFilter, fields: ["year"] })!;
    result["year"](undefined);
    expect(setFilter).toHaveBeenCalledWith("year", undefined);
  });

  it("boolean fields coerce value to Boolean", () => {
    const setFilter = vi.fn();
    const result = createFilterSetters({ setFilter, fields: ["presential"] })!;
    result["presential"](true);
    expect(setFilter).toHaveBeenCalledWith("presential", true);
  });

  it("boolean fields coerce null to undefined", () => {
    const setFilter = vi.fn();
    const result = createFilterSetters({ setFilter, fields: ["vaccination_plan"] })!;
    result["vaccination_plan"](null);
    expect(setFilter).toHaveBeenCalledWith("vaccination_plan", undefined);
  });

  it("string fields coerce value to string", () => {
    const setFilter = vi.fn();
    const result = createFilterSetters({ setFilter, fields: ["sex"] })!;
    result["sex"]("m");
    expect(setFilter).toHaveBeenCalledWith("sex", "m");
  });

  it("string fields coerce empty string to undefined", () => {
    const setFilter = vi.fn();
    const result = createFilterSetters({ setFilter, fields: ["type"] })!;
    result["type"]("");
    expect(setFilter).toHaveBeenCalledWith("type", undefined);
  });

  describe("debounced text input fields", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("internship setter does not call setFilter synchronously", () => {
      const setFilter = vi.fn();
      const result = createFilterSetters({ setFilter, fields: ["internship"] })!;
      result["internship"]("HFF");
      // Should not have been called yet (debounced)
      expect(setFilter).not.toHaveBeenCalled();
    });

    it("internship setter calls setFilter after debounce delay", () => {
      const setFilter = vi.fn();
      const result = createFilterSetters({ setFilter, fields: ["internship"] })!;
      result["internship"]("HFF");
      vi.advanceTimersByTime(300);
      expect(setFilter).toHaveBeenCalledWith("internship", "HFF");
    });

    it("location setter is debounced", () => {
      const setFilter = vi.fn();
      const result = createFilterSetters({ setFilter, fields: ["location"] })!;
      result["location"]("unidade");
      expect(setFilter).not.toHaveBeenCalled();
      vi.advanceTimersByTime(300);
      expect(setFilter).toHaveBeenCalledWith("location", "unidade");
    });

    it("processNumber setter is debounced", () => {
      const setFilter = vi.fn();
      const result = createFilterSetters({ setFilter, fields: ["processNumber"] })!;
      result["processNumber"]("12345");
      expect(setFilter).not.toHaveBeenCalled();
      vi.advanceTimersByTime(300);
      expect(setFilter).toHaveBeenCalledWith("processNumber", "12345");
    });

    it("non-text string fields (e.g. sex) are NOT debounced", () => {
      const setFilter = vi.fn();
      const result = createFilterSetters({ setFilter, fields: ["sex"] })!;
      result["sex"]("f");
      // Should be called synchronously (no debounce)
      expect(setFilter).toHaveBeenCalledWith("sex", "f");
    });
  });
});

// ---------------------------------------------------------------------------
// buildFilterBadgeConfigs
// ---------------------------------------------------------------------------

describe("buildFilterBadgeConfigs", () => {
  it("returns [] when no values are set", () => {
    const result = buildFilterBadgeConfigs({
      values: {},
      getLabel: () => "SomeLabel",
    });
    expect(result).toEqual([]);
  });

  it("returns [] when all values are empty/null/undefined", () => {
    const result = buildFilterBadgeConfigs({
      values: { sex: undefined, type: null, location: "" },
      getLabel: () => "Label",
    });
    expect(result).toEqual([]);
  });

  it("produces a single badge with id 'age' when only ageMin is set", () => {
    const result = buildFilterBadgeConfigs({
      values: { ageMin: 18 },
      getLabel: (key) => (key === "ageMin" ? "Idade: ≥18 anos" : ""),
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("age");
    expect(result[0].removeKey).toBe("ageMin");
  });

  it("produces a single badge with id 'age' when only ageMax is set", () => {
    const result = buildFilterBadgeConfigs({
      values: { ageMax: 65 },
      getLabel: (key) => (key === "ageMax" ? "Idade: ≤65 anos" : ""),
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("age");
    expect(result[0].removeKey).toBe("ageMin");
  });

  it("produces a single badge with id 'age' when both ageMin and ageMax are set", () => {
    const result = buildFilterBadgeConfigs({
      values: { ageMin: 18, ageMax: 65 },
      getLabel: (key) => (key === "ageMin" ? "Idade: 18-65 anos" : ""),
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("age");
  });

  it("produces a single badge with id 'date' when only dateFrom is set", () => {
    const result = buildFilterBadgeConfigs({
      values: { dateFrom: "2024-01-01" },
      getLabel: (key) => (key === "dateFrom" ? "Data: ≥2024-01-01" : ""),
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("date");
    expect(result[0].removeKey).toBe("dateFrom");
  });

  it("produces a single badge with id 'date' when both dateFrom and dateTo are set", () => {
    const result = buildFilterBadgeConfigs({
      values: { dateFrom: "2024-01-01", dateTo: "2024-12-31" },
      getLabel: (key) => (key === "dateFrom" ? "Data: 2024-01-01 - 2024-12-31" : ""),
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("date");
  });

  it("produces individual badges for non-range active fields", () => {
    const result = buildFilterBadgeConfigs({
      values: { sex: "m", type: "DM" },
      getLabel: (key) => (key === "sex" ? "Sexo: M" : "Tipologia: DM"),
    });
    expect(result).toHaveLength(2);
    expect(result.map((b) => b.id)).toEqual(expect.arrayContaining(["sex", "type"]));
  });

  it("skips badges when getLabel returns empty string", () => {
    const result = buildFilterBadgeConfigs({
      values: { sex: "m" },
      getLabel: () => "",
    });
    expect(result).toEqual([]);
  });

  it("sets removeKey equal to the field key for individual badges", () => {
    const result = buildFilterBadgeConfigs({
      values: { type: "DM" },
      getLabel: () => "Tipologia: DM",
    });
    expect(result[0].removeKey).toBe("type");
  });
});

// ---------------------------------------------------------------------------
// generatePrettyFilterLabel
// ---------------------------------------------------------------------------

describe("generatePrettyFilterLabel", () => {
  const specialty = { code: "mgf" } as Specialty;

  it("returns '' when value is undefined", () => {
    expect(generatePrettyFilterLabel("sex", undefined)).toBe("");
  });

  it("returns '' when value is empty string", () => {
    expect(generatePrettyFilterLabel("sex", "")).toBe("");
  });

  it("returns '' when value is null", () => {
    expect(generatePrettyFilterLabel("sex", null)).toBe("");
  });

  describe("year", () => {
    it("formats as 'Ano: MGF.2' with specialty code uppercased", () => {
      expect(generatePrettyFilterLabel("year", 2, specialty)).toBe("Ano: MGF.2");
    });
  });

  describe("ageMin", () => {
    it("alone → 'Idade: ≥X anos'", () => {
      expect(generatePrettyFilterLabel("ageMin", 18)).toBe("Idade: ≥18 anos");
    });

    it("with ageMax in otherValues → 'Idade: X-Y anos'", () => {
      expect(generatePrettyFilterLabel("ageMin", 18, undefined, { ageMax: 65 })).toBe(
        "Idade: 18-65 anos"
      );
    });
  });

  describe("ageMax", () => {
    it("alone → 'Idade: ≤X anos'", () => {
      expect(generatePrettyFilterLabel("ageMax", 65)).toBe("Idade: ≤65 anos");
    });

    it("when ageMin is present in otherValues → ''", () => {
      expect(generatePrettyFilterLabel("ageMax", 65, undefined, { ageMin: 18 })).toBe("");
    });
  });

  describe("dateFrom", () => {
    const date = "2024-06-15";
    // Use the same formatting logic to derive expected values
    const formattedDate = new Date(date).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    it("alone → 'Data: ≥{formatted}'", () => {
      expect(generatePrettyFilterLabel("dateFrom", date)).toBe(`Data: ≥${formattedDate}`);
    });

    it("with dateTo in otherValues → 'Data: {from} - {to}'", () => {
      const dateTo = "2024-12-31";
      const formattedTo = new Date(dateTo).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      expect(generatePrettyFilterLabel("dateFrom", date, undefined, { dateTo })).toBe(
        `Data: ${formattedDate} - ${formattedTo}`
      );
    });
  });

  describe("dateTo", () => {
    const date = "2024-12-31";
    const formattedDate = new Date(date).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    it("alone → 'Data: ≤{formatted}'", () => {
      expect(generatePrettyFilterLabel("dateTo", date)).toBe(`Data: ≤${formattedDate}`);
    });

    it("when dateFrom is present in otherValues → ''", () => {
      expect(generatePrettyFilterLabel("dateTo", date, undefined, { dateFrom: "2024-01-01" })).toBe(
        ""
      );
    });
  });

  describe("presential", () => {
    it("true → 'Presencial: Sim'", () => {
      expect(generatePrettyFilterLabel("presential", true)).toBe("Presencial: Sim");
    });

    it("false → 'Presencial: Não'", () => {
      expect(generatePrettyFilterLabel("presential", false)).toBe("Presencial: Não");
    });
  });

  describe("processNumber", () => {
    it("→ 'N° Processo: {value}'", () => {
      expect(generatePrettyFilterLabel("processNumber", "12345")).toBe("N° Processo: 12345");
    });
  });

  describe("unknown key with no field metadata", () => {
    it("→ ''", () => {
      expect(generatePrettyFilterLabel("nonexistentField", "someValue")).toBe("");
    });
  });
});
