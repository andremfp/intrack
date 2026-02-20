import { describe, expect, it } from "vitest";

import {
  getFieldSource,
  mapHeaderToKey,
  parseBoolean,
  parseDate,
  parseIcpcCodes,
  parseNumber,
  parseProfessionCode,
  parseSelectValue,
  parseTextList,
  validateLocationAndInternship,
} from "@/imports/mapping";
import type { ConsultationInsert } from "@/lib/api/consultations";

// ---------------------------------------------------------------------------
// mapHeaderToKey
// ---------------------------------------------------------------------------

describe("mapHeaderToKey", () => {
  it("matches an exact header", () => {
    expect(mapHeaderToKey("Data")).toBe("date");
    expect(mapHeaderToKey("Local")).toBe("location");
    expect(mapHeaderToKey("Notas")).toBe("notes");
  });

  it("matches case-insensitively when no exact entry exists", () => {
    expect(mapHeaderToKey("DATA")).toBe("date");
    expect(mapHeaderToKey("local")).toBe("location");
    expect(mapHeaderToKey("AUTONOMIA")).toBe("autonomy");
  });

  it("matches diacritic-insensitively when neither exact nor case match exists", () => {
    // "Diagnóstico" is in the map; "Diagnostico" is not — requires NFD normalisation
    expect(mapHeaderToKey("Diagnostico")).toBe("diagnosis");
    // "Tipologia de Família" is in map; "Tipologia de Familia" is NOT
    expect(mapHeaderToKey("Tipologia de Familia")).toBe("family_type");
  });

  it("returns null for an unknown header", () => {
    expect(mapHeaderToKey("Unknown Column")).toBeNull();
    expect(mapHeaderToKey("xyz")).toBeNull();
  });

  it("returns null for an empty or whitespace-only string", () => {
    expect(mapHeaderToKey("")).toBeNull();
    expect(mapHeaderToKey("   ")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseBoolean
// ---------------------------------------------------------------------------

describe("parseBoolean", () => {
  it("returns true for Portuguese/English/technical truthy strings", () => {
    for (const v of ["Sim", "S", "Yes", "Y", "true", "1"]) {
      expect(parseBoolean(v), `input: "${v}"`).toBe(true);
    }
  });

  it("returns false for Portuguese/English/technical falsy strings", () => {
    for (const v of ["Não", "Nao", "N", "No", "false", "0"]) {
      expect(parseBoolean(v), `input: "${v}"`).toBe(false);
    }
  });

  it("returns true/false for boolean primitives", () => {
    expect(parseBoolean(true)).toBe(true);
    expect(parseBoolean(false)).toBe(false);
  });

  it("treats non-zero numbers as true and 0 as false", () => {
    expect(parseBoolean(1)).toBe(true);
    expect(parseBoolean(0)).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(parseBoolean("SIM")).toBe(true);
    expect(parseBoolean("NÃO")).toBe(false);
    expect(parseBoolean("TRUE")).toBe(true);
    expect(parseBoolean("FALSE")).toBe(false);
  });

  it("returns null for null, undefined, or empty string", () => {
    expect(parseBoolean(null)).toBeNull();
    expect(parseBoolean(undefined)).toBeNull();
    expect(parseBoolean("")).toBeNull();
  });

  it("returns null for unrecognised values", () => {
    expect(parseBoolean("maybe")).toBeNull();
    expect(parseBoolean("2")).toBeNull();
    expect(parseBoolean("ok")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseSelectValue
// ---------------------------------------------------------------------------

describe("parseSelectValue", () => {
  describe("location field", () => {
    it("matches a label exactly (case-insensitive)", () => {
      expect(parseSelectValue("location", "Unidade de Saúde")).toBe("unidade");
      expect(parseSelectValue("location", "unidade de saúde")).toBe("unidade");
    });

    it("matches an option value directly (case-insensitive)", () => {
      expect(parseSelectValue("location", "unidade")).toBe("unidade");
      expect(parseSelectValue("location", "UNIDADE")).toBe("unidade");
    });

    it("matches diacritic-insensitively on label", () => {
      // "Formação Complementar" normalises to "formacao complementar"
      expect(parseSelectValue("location", "Formacao Complementar")).toBe(
        "complementar"
      );
    });

    it("matches via partial label when nothing else matches", () => {
      // "Saude" is a substring of "Unidade de Saúde"
      expect(parseSelectValue("location", "Saude")).toBe("unidade");
    });

    it("returns null when no option matches", () => {
      expect(parseSelectValue("location", "hospital")).toBeNull();
    });

    it("returns null for null/undefined/empty", () => {
      expect(parseSelectValue("location", null)).toBeNull();
      expect(parseSelectValue("location", undefined)).toBeNull();
      expect(parseSelectValue("location", "")).toBeNull();
    });
  });

  describe("age_unit abbreviations", () => {
    it("maps single-letter abbreviations to full values", () => {
      expect(parseSelectValue("age_unit", "D")).toBe("days");
      expect(parseSelectValue("age_unit", "S")).toBe("weeks");
      expect(parseSelectValue("age_unit", "M")).toBe("months");
      expect(parseSelectValue("age_unit", "A")).toBe("years");
    });
  });

  describe("field without options", () => {
    it("returns the raw string value for a field with no options defined", () => {
      expect(parseSelectValue("notes", "some text")).toBe("some text");
    });
  });
});

// ---------------------------------------------------------------------------
// parseDate
// ---------------------------------------------------------------------------

describe("parseDate", () => {
  it("accepts ISO format and returns it unchanged", () => {
    expect(parseDate("2024-06-15")).toBe("2024-06-15");
  });

  it("parses DD/MM/YYYY format", () => {
    expect(parseDate("15/06/2024")).toBe("2024-06-15");
  });

  it("parses DD-MM-YYYY format", () => {
    expect(parseDate("15-06-2024")).toBe("2024-06-15");
  });

  it("parses DD.MM.YYYY format", () => {
    expect(parseDate("15.06.2024")).toBe("2024-06-15");
  });

  it("converts a Date object to ISO string", () => {
    const d = new Date("2024-06-15T00:00:00Z");
    expect(parseDate(d)).toBe("2024-06-15");
  });

  it("converts an Excel serial number to an ISO date", () => {
    // Replicate the same formula as the source to stay timezone-agnostic
    const EXCEL_EPOCH = new Date(1899, 11, 30);
    const MS_PER_DAY = 86400000;
    const serial = 45658; // a plausible modern serial
    const expected = new Date(EXCEL_EPOCH.getTime() + serial * MS_PER_DAY)
      .toISOString()
      .split("T")[0];
    expect(parseDate(serial)).toBe(expected);
  });

  it("returns null for null, undefined, or empty string", () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate("")).toBeNull();
  });

  it("returns null for an invalid date string", () => {
    expect(parseDate("not-a-date")).toBeNull();
  });

  it("returns null for an invalid Date object", () => {
    expect(parseDate(new Date("invalid"))).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseNumber
// ---------------------------------------------------------------------------

describe("parseNumber", () => {
  it("returns a numeric value unchanged", () => {
    expect(parseNumber(42)).toBe(42);
    expect(parseNumber(0)).toBe(0);
    expect(parseNumber(3.14)).toBe(3.14);
  });

  it("parses a numeric string", () => {
    expect(parseNumber("42")).toBe(42);
    expect(parseNumber("  7  ")).toBe(7);
  });

  it("returns null for non-numeric strings", () => {
    expect(parseNumber("abc")).toBeNull();
    expect(parseNumber("1a")).toBeNull();
  });

  it("returns null for null, undefined, or empty string", () => {
    expect(parseNumber(null)).toBeNull();
    expect(parseNumber(undefined)).toBeNull();
    expect(parseNumber("")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseTextList
// ---------------------------------------------------------------------------

describe("parseTextList", () => {
  it("splits a semicolon-separated string into an array", () => {
    expect(parseTextList("a; b; c")).toEqual(["a", "b", "c"]);
  });

  it("trims whitespace from each item", () => {
    expect(parseTextList("  item1 ; item2  ; item3")).toEqual([
      "item1",
      "item2",
      "item3",
    ]);
  });

  it("filters out empty items", () => {
    expect(parseTextList("a;;b")).toEqual(["a", "b"]);
  });

  it("passes through an existing array", () => {
    expect(parseTextList(["x", "y"])).toEqual(["x", "y"]);
  });

  it("returns null for null, undefined, or empty string", () => {
    expect(parseTextList(null)).toBeNull();
    expect(parseTextList(undefined)).toBeNull();
    expect(parseTextList("")).toBeNull();
  });

  it("returns null when all items are empty after trimming", () => {
    expect(parseTextList(";; ;")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseIcpcCodes  (all-or-nothing validation)
// ---------------------------------------------------------------------------

describe("parseIcpcCodes", () => {
  const SPECIALTY = "mgf";

  it("returns formatted code+description for valid codes", () => {
    const result = parseIcpcCodes("A01", SPECIALTY);
    expect(result).toHaveLength(1);
    expect(result![0]).toMatch(/^A01 - /);
  });

  it("parses 'CODE - Description' format, extracting just the code for validation", () => {
    const result = parseIcpcCodes("A01 - Dor generalizada / múltipla", SPECIALTY);
    expect(result).toHaveLength(1);
    expect(result![0]).toMatch(/^A01 - /);
  });

  it("parses multiple semicolon-separated codes", () => {
    const result = parseIcpcCodes("A01; A02", SPECIALTY);
    expect(result).toHaveLength(2);
    expect(result![0]).toMatch(/^A01/);
    expect(result![1]).toMatch(/^A02/);
  });

  it("returns null when ANY single code is invalid (all-or-nothing)", () => {
    expect(parseIcpcCodes("A01; ZZZ", SPECIALTY)).toBeNull();
    expect(parseIcpcCodes("INVALID", SPECIALTY)).toBeNull();
  });

  it("returns null for null, undefined, or empty string", () => {
    expect(parseIcpcCodes(null, SPECIALTY)).toBeNull();
    expect(parseIcpcCodes(undefined, SPECIALTY)).toBeNull();
    expect(parseIcpcCodes("", SPECIALTY)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseProfessionCode
// ---------------------------------------------------------------------------

describe("parseProfessionCode", () => {
  it("returns only the code for a valid 'CODE - Description' string", () => {
    expect(parseProfessionCode("2655.0 - Actor")).toBe("2655.0");
  });

  it("returns the code for a bare valid code string", () => {
    expect(parseProfessionCode("2655.0")).toBe("2655.0");
  });

  it("returns null for an invalid profession code", () => {
    expect(parseProfessionCode("9999.9")).toBeNull();
    expect(parseProfessionCode("not-a-code")).toBeNull();
  });

  it("returns null for null, undefined, or empty string", () => {
    expect(parseProfessionCode(null)).toBeNull();
    expect(parseProfessionCode(undefined)).toBeNull();
    expect(parseProfessionCode("")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getFieldSource
// ---------------------------------------------------------------------------

describe("getFieldSource", () => {
  it("returns 'column' for top-level fields", () => {
    for (const key of ["date", "process_number", "location", "age", "favorite"]) {
      expect(getFieldSource(key), key).toBe("column");
    }
  });

  it("returns 'details' for specialty/JSONB fields", () => {
    for (const key of ["internship", "diagnosis", "profession", "smoker"]) {
      expect(getFieldSource(key), key).toBe("details");
    }
  });
});

// ---------------------------------------------------------------------------
// validateLocationAndInternship
// ---------------------------------------------------------------------------

describe("validateLocationAndInternship", () => {
  function makeConsultation(
    location: string | undefined,
    internship: string | undefined,
    type: string | undefined
  ): Partial<ConsultationInsert> {
    return {
      location,
      details: { internship, type } as Record<string, unknown>,
    } as Partial<ConsultationInsert>;
  }

  it("returns no errors for unidade + no internship + valid type", () => {
    const errors = validateLocationAndInternship(
      makeConsultation("unidade", undefined, "SA"),
      0
    );
    expect(errors.filter((e) => e.field === "internship")).toHaveLength(0);
    expect(errors.filter((e) => e.field === "type")).toHaveLength(0);
  });

  it("returns an internship error when internship is provided for unidade", () => {
    const errors = validateLocationAndInternship(
      makeConsultation("unidade", "pediatria", "SA"),
      0
    );
    expect(errors.some((e) => e.field === "internship")).toBe(true);
  });

  it("returns a type error when type is missing for unidade", () => {
    const errors = validateLocationAndInternship(
      makeConsultation("unidade", undefined, undefined),
      0
    );
    expect(errors.some((e) => e.field === "type")).toBe(true);
  });

  it("returns no errors for non-unidade + valid internship + no type", () => {
    const errors = validateLocationAndInternship(
      makeConsultation("urgência", "pediatria", undefined),
      0
    );
    expect(errors.filter((e) => e.field === "internship")).toHaveLength(0);
    expect(errors.filter((e) => e.field === "type")).toHaveLength(0);
  });

  it("returns an internship error when internship is missing for non-unidade", () => {
    const errors = validateLocationAndInternship(
      makeConsultation("urgência", undefined, undefined),
      0
    );
    expect(errors.some((e) => e.field === "internship")).toBe(true);
  });

  it("returns a type error when type is present for non-unidade", () => {
    const errors = validateLocationAndInternship(
      makeConsultation("urgência", "pediatria", "SA"),
      0
    );
    expect(errors.some((e) => e.field === "type")).toBe(true);
  });

  it("includes a location error for an invalid location value", () => {
    const errors = validateLocationAndInternship(
      makeConsultation("invalid-loc", undefined, "SA"),
      0
    );
    expect(errors.some((e) => e.field === "location")).toBe(true);
  });

  it("does not enforce relationship rules when location is invalid", () => {
    // Relationship check is skipped for invalid location — only a location error
    const errors = validateLocationAndInternship(
      makeConsultation("invalid-loc", undefined, undefined),
      0
    );
    const relationshipFields = errors.filter(
      (e) => e.field === "internship" || e.field === "type"
    );
    expect(relationshipFields).toHaveLength(0);
  });

  it("tags every error with the correct rowIndex", () => {
    const errors = validateLocationAndInternship(
      makeConsultation("unidade", "pediatria", undefined),
      5
    );
    expect(errors.every((e) => e.rowIndex === 5)).toBe(true);
  });
});
