import { describe, expect, it } from "vitest";

import type { SpecialtyField } from "@/constants";
import {
  formatBoolean,
  formatDate,
  formatIcpcCodes,
  formatNumber,
  formatTextList,
  formatWithOptions,
  getFieldSource,
  mapKeyToHeader,
} from "@/exports/mapping";

// Minimal SpecialtyField factory for tests
function makeField(
  overrides: Partial<SpecialtyField> & Pick<SpecialtyField, "key" | "label" | "type">
): SpecialtyField {
  return { ...overrides };
}

const fieldWithOptions = makeField({
  key: "location",
  label: "Local",
  type: "select",
  options: [
    { value: "unidade", label: "Unidade de Saúde" },
    { value: "complementar", label: "Complementar" },
  ],
});

const multiField = makeField({
  key: "chronic_diseases",
  label: "Doenças Crónicas",
  type: "multi-select",
  options: [
    { value: "dm", label: "Diabetes" },
    { value: "hta", label: "Hipertensão" },
  ],
});

const fieldNoOptions = makeField({
  key: "notes",
  label: "Notas",
  type: "text",
});

describe("mapKeyToHeader", () => {
  it("returns the Portuguese header for a known field key", () => {
    expect(mapKeyToHeader("date")).toBe("Data");
    expect(mapKeyToHeader("profession")).toBe("Profissão");
    expect(mapKeyToHeader("diagnosis")).toBe("Diagnóstico (ICPC-2)");
  });

  it("returns the key itself for an unknown field key", () => {
    expect(mapKeyToHeader("unknown_field")).toBe("unknown_field");
    expect(mapKeyToHeader("custom_key")).toBe("custom_key");
  });
});

describe("getFieldSource", () => {
  it("returns 'column' for top-level fields", () => {
    expect(getFieldSource("date")).toBe("column");
    expect(getFieldSource("age")).toBe("column");
    expect(getFieldSource("location")).toBe("column");
    expect(getFieldSource("specialty_year")).toBe("column");
    expect(getFieldSource("favorite")).toBe("column");
  });

  it("returns 'details' for details/JSONB fields", () => {
    expect(getFieldSource("profession")).toBe("details");
    expect(getFieldSource("diagnosis")).toBe("details");
    expect(getFieldSource("internship")).toBe("details");
    expect(getFieldSource("chronic_diseases")).toBe("details");
  });
});

describe("formatBoolean", () => {
  it("converts boolean true to 'Sim'", () => {
    expect(formatBoolean(true)).toBe("Sim");
  });

  it("converts boolean false to 'Não'", () => {
    expect(formatBoolean(false)).toBe("Não");
  });

  it("converts string 'true' to 'Sim'", () => {
    expect(formatBoolean("true")).toBe("Sim");
  });

  it("converts string 'false' to 'Não'", () => {
    expect(formatBoolean("false")).toBe("Não");
  });

  it("returns null for null", () => {
    expect(formatBoolean(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(formatBoolean(undefined)).toBeNull();
  });

  it("returns null for unrecognised string values", () => {
    expect(formatBoolean("yes")).toBeNull();
    expect(formatBoolean("1")).toBeNull();
  });
});

describe("formatWithOptions", () => {
  describe("when field is undefined", () => {
    it("returns null for null/undefined value", () => {
      expect(formatWithOptions(undefined, null)).toBeNull();
      expect(formatWithOptions(undefined, undefined)).toBeNull();
    });

    it("joins array values with '; '", () => {
      expect(formatWithOptions(undefined, ["a", "b"])).toBe("a; b");
    });

    it("returns null for empty array", () => {
      expect(formatWithOptions(undefined, [])).toBeNull();
    });

    it("returns string representation of scalar value", () => {
      expect(formatWithOptions(undefined, "raw")).toBe("raw");
    });
  });

  describe("when field has options", () => {
    it("returns the option label for a matching value", () => {
      expect(formatWithOptions(fieldWithOptions, "unidade")).toBe(
        "Unidade de Saúde"
      );
    });

    it("returns the value itself when no matching option exists", () => {
      expect(formatWithOptions(fieldWithOptions, "unknown_val")).toBe(
        "unknown_val"
      );
    });

    it("returns null for null value", () => {
      expect(formatWithOptions(fieldWithOptions, null)).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(formatWithOptions(fieldWithOptions, "")).toBeNull();
    });

    it("joins multiple values with labels separated by '; '", () => {
      expect(formatWithOptions(multiField, ["dm", "hta"])).toBe(
        "Diabetes; Hipertensão"
      );
    });

    it("falls back to the raw value for unmatched items in an array", () => {
      expect(formatWithOptions(multiField, ["dm", "other"])).toBe(
        "Diabetes; other"
      );
    });

    it("returns null for empty array", () => {
      expect(formatWithOptions(multiField, [])).toBeNull();
    });
  });

  describe("when field has no options", () => {
    it("returns string representation of scalar value", () => {
      expect(formatWithOptions(fieldNoOptions, "some text")).toBe("some text");
    });

    it("joins array values with '; '", () => {
      expect(formatWithOptions(fieldNoOptions, ["a", "b"])).toBe("a; b");
    });
  });
});

describe("formatTextList", () => {
  it("joins array with '; '", () => {
    expect(formatTextList(["item1", "item2", "item3"])).toBe(
      "item1; item2; item3"
    );
  });

  it("returns null for empty array", () => {
    expect(formatTextList([])).toBeNull();
  });

  it("returns the string representation for a non-array value", () => {
    expect(formatTextList("single")).toBe("single");
  });

  it("returns null for null", () => {
    expect(formatTextList(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(formatTextList(undefined)).toBeNull();
  });
});

describe("formatIcpcCodes", () => {
  it("delegates to formatTextList — joins codes with '; '", () => {
    expect(formatIcpcCodes(["A01 - Dor generalizada", "B02 - Arrepios"])).toBe(
      "A01 - Dor generalizada; B02 - Arrepios"
    );
  });

  it("returns null for null", () => {
    expect(formatIcpcCodes(null)).toBeNull();
  });
});

describe("formatDate", () => {
  it("returns the same ISO date string", () => {
    expect(formatDate("2024-06-15")).toBe("2024-06-15");
  });

  it("strips the time component from an ISO datetime string", () => {
    expect(formatDate("2024-06-15T10:30:00.000Z")).toBe("2024-06-15");
  });

  it("returns null for null", () => {
    expect(formatDate(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(formatDate("")).toBeNull();
  });

  it("returns the raw string for an invalid date", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

describe("formatNumber", () => {
  it("returns the number as-is for a numeric value", () => {
    expect(formatNumber(42)).toBe(42);
    expect(formatNumber(3.14)).toBe(3.14);
  });

  it("returns 0 as a number (not null)", () => {
    expect(formatNumber(0)).toBe(0);
  });

  it("parses a numeric string to a number", () => {
    expect(formatNumber("42")).toBe(42);
  });

  it("returns the string as-is for a non-numeric string", () => {
    expect(formatNumber("abc")).toBe("abc");
  });

  it("returns null for null", () => {
    expect(formatNumber(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(formatNumber(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(formatNumber("")).toBeNull();
  });
});
