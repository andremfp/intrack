import { describe, expect, it } from "vitest";

import { validateImportRow } from "@/imports/helpers";
import { MGF_FIELDS } from "@/constants";
import type { ConsultationInsert } from "@/lib/api/consultations";
import type { ImportRow, ValidationError } from "@/imports/types";

// ---------------------------------------------------------------------------
// validateImportRow
//
// Validation is one validator per field-type / concern, so the tests mirror
// that: one describe per validator. Everything is driven through the public
// validateImportRow on a *post-mapping* consultation — top-level fields (date,
// process_number, location, autonomy, sex, age, age_unit, specialty_year) sit
// on the object; specialty fields live under `details` as their parsed values
// (option values, arrays, booleans). rawRow + headers exercise the
// "raw value provided but failed to parse" branches.
// ---------------------------------------------------------------------------

function validate(
  consultation: Record<string, unknown>,
  rawRow?: ImportRow,
  headers?: string[],
): ValidationError[] {
  return validateImportRow(
    consultation as Partial<ConsultationInsert>,
    0,
    MGF_FIELDS,
    rawRow,
    headers,
  );
}

// True if any error targets `field` (optionally matching a message pattern).
function has(errors: ValidationError[], field: string, re?: RegExp): boolean {
  return errors.some((e) => e.field === field && (!re || re.test(e.message)));
}

describe("validateImportRow — required fields", () => {
  it("flags a missing always-required field (Local)", () => {
    expect(has(validate({ details: {} }), "location", /obrigatório/)).toBe(true);
  });

  it("does not flag a required field that is present", () => {
    expect(has(validate({ location: "unidade", details: {} }), "location")).toBe(
      false,
    );
  });

  it("requires Tipologia only when Local is Unidade de Saúde", () => {
    expect(
      has(validate({ location: "unidade", details: {} }), "type", /obrigatório/),
    ).toBe(true);
    expect(has(validate({ location: "urgência", details: {} }), "type")).toBe(
      false,
    );
  });

  it("requires Estágio only when Local is not Unidade de Saúde", () => {
    expect(
      has(
        validate({ location: "urgência", details: {} }),
        "internship",
        /obrigatório/,
      ),
    ).toBe(true);
    expect(
      has(validate({ location: "unidade", details: {} }), "internship"),
    ).toBe(false);
  });
});

describe("validateImportRow — visibility constraints", () => {
  it("flags a value on a field not visible in this context (Tipologia on Urgência)", () => {
    expect(
      has(
        validate({ location: "urgência", details: { type: "SA" } }),
        "type",
        /não permitido/,
      ),
    ).toBe(true);
  });

  it("allows the same field when it is visible (Tipologia on Unidade)", () => {
    expect(
      has(
        validate({ location: "unidade", details: { type: "SA" } }),
        "type",
        /não permitido/,
      ),
    ).toBe(false);
  });

  it("flags Estágio when Local is Unidade de Saúde", () => {
    expect(
      has(
        validate({ location: "unidade", details: { internship: "cardio" } }),
        "internship",
        /não permitido/,
      ),
    ).toBe(true);
  });
});

describe("validateImportRow — numeric constraints", () => {
  it("accepts age at the 0 and 150 boundaries", () => {
    expect(has(validate({ age: 0, details: {} }), "age")).toBe(false);
    expect(has(validate({ age: 150, details: {} }), "age")).toBe(false);
  });

  it("flags age above 150", () => {
    expect(has(validate({ age: 151, details: {} }), "age", /entre 0 e 150/)).toBe(
      true,
    );
  });

  it("flags a negative age", () => {
    expect(has(validate({ age: -1, details: {} }), "age")).toBe(true);
  });

  it("accepts a 9-digit process number", () => {
    expect(
      has(validate({ process_number: 123456789, details: {} }), "process_number"),
    ).toBe(false);
  });

  it("flags a process number with more than 9 digits", () => {
    expect(
      has(
        validate({ process_number: 1234567890, details: {} }),
        "process_number",
        /9 dígitos/,
      ),
    ).toBe(true);
  });

  it("flags a negative process number", () => {
    expect(
      has(
        validate({ process_number: -1, details: {} }),
        "process_number",
        /não negativo/,
      ),
    ).toBe(true);
  });

  it("flags a specialty year below 1", () => {
    expect(
      has(validate({ specialty_year: 0, details: {} }), "specialty_year", />= 1/),
    ).toBe(true);
  });
});

describe("validateImportRow — date", () => {
  it("accepts a valid ISO date", () => {
    expect(has(validate({ date: "2024-01-15", details: {} }), "date")).toBe(
      false,
    );
  });

  it("flags an unparseable date", () => {
    expect(
      has(
        validate({ date: "not-a-date", details: {} }),
        "date",
        /Formato de data inválido/,
      ),
    ).toBe(true);
  });
});

describe("validateImportRow — select / combobox fields", () => {
  it("accepts a valid option value (Autonomia)", () => {
    expect(
      has(
        validate({ location: "unidade", autonomy: "total", details: {} }),
        "autonomy",
        /Valor inválido/,
      ),
    ).toBe(false);
  });

  it("flags an invalid option value (Autonomia)", () => {
    expect(
      has(
        validate({ location: "unidade", autonomy: "bogus", details: {} }),
        "autonomy",
        /Valor inválido/,
      ),
    ).toBe(true);
  });

  it("flags a raw value that failed to parse to a valid option", () => {
    expect(
      has(
        validate({ location: "unidade", details: {} }, { Autonomia: "Inexistente" }, [
          "Autonomia",
        ]),
        "autonomy",
        /Valor inválido/,
      ),
    ).toBe(true);
  });
});

describe("validateImportRow — code-search fields (profession)", () => {
  // profession is optional and single-selection. Its default is [] (the
  // code-search default), so an empty value must validate; only genuinely
  // multiple values are an error.
  it("does not flag an empty profession as multiple selection", () => {
    expect(
      has(
        validate({ location: "unidade", details: { profession: [] } }),
        "profession",
      ),
    ).toBe(false);
  });

  it("accepts a single profession value", () => {
    expect(
      has(
        validate({ location: "unidade", details: { profession: "2611.1" } }),
        "profession",
      ),
    ).toBe(false);
  });

  it("flags a profession with more than one value", () => {
    expect(
      has(
        validate({
          location: "unidade",
          details: { profession: ["2611.1", "2655.0"] },
        }),
        "profession",
        /múltipla seleção/,
      ),
    ).toBe(true);
  });
});

describe("validateImportRow — text fields (length)", () => {
  it("flags a text field exceeding 20 characters (Outra Lista)", () => {
    expect(
      has(
        validate({
          location: "unidade",
          details: { own_list: false, other_list: "x".repeat(25) },
        }),
        "other_list",
        /não pode exceder 20/,
      ),
    ).toBe(true);
  });

  it("accepts a text field within 20 characters", () => {
    expect(
      has(
        validate({
          location: "unidade",
          details: { own_list: false, other_list: "Lista Dr. Silva" },
        }),
        "other_list",
      ),
    ).toBe(false);
  });
});

describe("validateImportRow — text-list fields (item length)", () => {
  it("flags a text-list item exceeding 100 characters (Doenças Crónicas)", () => {
    expect(
      has(
        validate({
          location: "unidade",
          details: { chronic_diseases: ["x".repeat(150)] },
        }),
        "chronic_diseases",
        /não pode exceder 100/,
      ),
    ).toBe(true);
  });

  it("accepts text-list items within 100 characters", () => {
    expect(
      has(
        validate({
          location: "unidade",
          details: { chronic_diseases: ["Diabetes", "Hipertensão"] },
        }),
        "chronic_diseases",
      ),
    ).toBe(false);
  });
});

describe("validateImportRow — boolean fields", () => {
  it("flags a raw boolean value that could not be parsed (Presencial)", () => {
    expect(
      has(
        validate({ location: "unidade", details: { presential: null } }, { Presencial: "Talvez" }, [
          "Presencial",
        ]),
        "presential",
        /Use "Sim"/,
      ),
    ).toBe(true);
  });

  it("does not flag a valid boolean", () => {
    expect(
      has(
        validate({ location: "unidade", details: { presential: true } }, { Presencial: "Sim" }, [
          "Presencial",
        ]),
        "presential",
        /Use "Sim"/,
      ),
    ).toBe(false);
  });
});
