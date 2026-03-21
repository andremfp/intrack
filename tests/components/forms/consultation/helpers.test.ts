import { describe, expect, it, vi } from "vitest";
import {
  validateForm,
  getFieldsThatWouldBeCleared,
} from "@/components/forms/consultation/helpers";
import type { FormValues } from "@/hooks/consultations/types";
import type { SpecialtyField } from "@/constants";

// ---------------------------------------------------------------------------
// Mock toasts to prevent side-effects in tests
// ---------------------------------------------------------------------------
vi.mock("@/utils/toasts", () => ({ toasts: { error: vi.fn() } }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds a fully-valid FormValues object; individual tests override one field. */
function makeFormValues(overrides: Partial<FormValues> = {}): FormValues {
  return {
    date: "2024-01-01",
    age: "30",
    age_unit: "years",
    process_number: "123456",
    specialty_year: "1",
    location: "Centro de Saúde",
    sex: "F",
    type: "",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// validateForm — age
// ---------------------------------------------------------------------------

describe("validateForm — age", () => {
  it("returns error for age below minimum (0)", () => {
    const result = validateForm(makeFormValues({ age: "0" }), [], "some-id");
    expect(result).toEqual(expect.objectContaining({ key: "age" }));
  });

  it("returns null for minimum valid age (1)", () => {
    const result = validateForm(makeFormValues({ age: "1" }), [], "some-id");
    expect(result).toBeNull();
  });

  it("returns null for maximum valid age (150)", () => {
    const result = validateForm(makeFormValues({ age: "150" }), [], "some-id");
    expect(result).toBeNull();
  });

  it("returns error for age above maximum (151)", () => {
    const result = validateForm(makeFormValues({ age: "151" }), [], "some-id");
    expect(result).toEqual(expect.objectContaining({ key: "age" }));
  });

  it("returns error for non-numeric age", () => {
    const result = validateForm(makeFormValues({ age: "abc" }), [], "some-id");
    expect(result).toEqual(expect.objectContaining({ key: "age" }));
  });

  it("returns error for empty age", () => {
    const result = validateForm(makeFormValues({ age: "" }), [], "some-id");
    // Empty age is caught by the age validation (parseIntSafe returns null)
    expect(result).toEqual(expect.objectContaining({ key: "age" }));
  });
});

// ---------------------------------------------------------------------------
// validateForm — process_number
// ---------------------------------------------------------------------------

describe("validateForm — process_number", () => {
  it("returns error for process_number too short (2 digits)", () => {
    const result = validateForm(
      makeFormValues({ process_number: "12" }),
      [],
      "some-id",
    );
    expect(result).toEqual(expect.objectContaining({ key: "process_number" }));
  });

  it("returns null for minimum valid process_number (3 digits)", () => {
    const result = validateForm(
      makeFormValues({ process_number: "123" }),
      [],
      "some-id",
    );
    expect(result).toBeNull();
  });

  it("returns null for maximum valid process_number (9 digits)", () => {
    const result = validateForm(
      makeFormValues({ process_number: "123456789" }),
      [],
      "some-id",
    );
    expect(result).toBeNull();
  });

  it("returns error for process_number too long (10 digits)", () => {
    const result = validateForm(
      makeFormValues({ process_number: "1234567890" }),
      [],
      "some-id",
    );
    expect(result).toEqual(expect.objectContaining({ key: "process_number" }));
  });

  it("returns error for process_number containing non-digit characters", () => {
    const result = validateForm(
      makeFormValues({ process_number: "12a" }),
      [],
      "some-id",
    );
    expect(result).toEqual(expect.objectContaining({ key: "process_number" }));
  });

  it("returns null for process_number with leading zeros (regression: leading zeros preserved)", () => {
    const result = validateForm(
      makeFormValues({ process_number: "007" }),
      [],
      "some-id",
    );
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getFieldsThatWouldBeCleared
// ---------------------------------------------------------------------------

// Minimal field definitions used across these tests
const typeField: SpecialtyField = {
  key: "type",
  label: "Tipologia",
  type: "select",
  visibleWhen: (ctx) => ctx.location === "unidade",
};

const ownListField: SpecialtyField = {
  key: "own_list",
  label: "Lista Própria",
  type: "boolean",
  visibleWhen: (ctx) => ctx.location === "unidade",
};

const problemsField: SpecialtyField = {
  key: "problems",
  label: "Problemas",
  type: "code-search",
  multiple: true,
  visibleWhen: (ctx) => ctx.location === "unidade",
};

const alwaysVisibleField: SpecialtyField = {
  key: "autonomy",
  label: "Autonomia",
  type: "select",
  // no visibleWhen → always visible
};

describe("getFieldsThatWouldBeCleared", () => {
  it("returns empty when no fields or sections are affected", () => {
    const formValues: FormValues = { location: "unidade", type: "SA" };
    const result = getFieldsThatWouldBeCleared(formValues, [typeField]);
    expect(result.fields).toEqual([]);
    expect(result.sections).toEqual([]);
  });

  it("returns a hidden specialty field with a non-empty string value", () => {
    const formValues: FormValues = { location: "urgência", type: "SA" };
    const result = getFieldsThatWouldBeCleared(formValues, [typeField]);
    expect(result.fields).toEqual([typeField]);
    expect(result.sections).toEqual([]);
  });

  it("excludes a hidden specialty field whose value is an empty string", () => {
    const formValues: FormValues = { location: "urgência", type: "" };
    const result = getFieldsThatWouldBeCleared(formValues, [typeField]);
    expect(result.fields).toEqual([]);
  });

  it("excludes a hidden specialty field with no value in formValues", () => {
    const formValues: FormValues = { location: "urgência" };
    const result = getFieldsThatWouldBeCleared(formValues, [typeField]);
    expect(result.fields).toEqual([]);
  });

  it("returns multiple hidden specialty fields that each have a value", () => {
    const formValues: FormValues = {
      location: "urgência",
      type: "SA",
      own_list: "true",
    };
    const result = getFieldsThatWouldBeCleared(formValues, [
      typeField,
      ownListField,
    ]);
    expect(result.fields).toHaveLength(2);
    expect(result.fields).toContain(typeField);
    expect(result.fields).toContain(ownListField);
  });

  it("excludes visible specialty fields even if they have values", () => {
    const formValues: FormValues = { location: "unidade", autonomy: "total" };
    const result = getFieldsThatWouldBeCleared(formValues, [alwaysVisibleField]);
    expect(result.fields).toEqual([]);
    expect(result.sections).toEqual([]);
  });

  it("returns a hidden specialty array field with a non-empty array value", () => {
    const formValues: FormValues = { location: "urgência", problems: ["A01"] };
    const result = getFieldsThatWouldBeCleared(formValues, [problemsField]);
    expect(result.fields).toEqual([problemsField]);
  });

  it("excludes a hidden specialty array field whose value is an empty array", () => {
    const formValues: FormValues = { location: "urgência", problems: [] };
    const result = getFieldsThatWouldBeCleared(formValues, [problemsField]);
    expect(result.fields).toEqual([]);
  });

  it("excludes hidden specialty fields with blank-only string-array values", () => {
    const formValues: FormValues = { location: "urgência", problems: ["  "] };
    const result = getFieldsThatWouldBeCleared(formValues, [problemsField]);
    expect(result.fields).toEqual([]);
  });

  it("returns sections when 'type' itself is cleared (DM → location changes)", () => {
    // 'type' has visibleWhen: ctx.location === "unidade".
    // When location changes to "urgência", 'type' is cleared and all DM sections
    // are implicitly lost. The result should contain sections, not individual fields.
    const formValues: FormValues = {
      location: "urgência",
      type: "DM",
      creatinina: "1.2",
      medicamentos: ["ieca"],
    };
    const dmTypeField: SpecialtyField = {
      key: "type",
      label: "Tipologia",
      type: "select",
      visibleWhen: (ctx) => ctx.location === "unidade",
    };
    const result = getFieldsThatWouldBeCleared(formValues, [dmTypeField]);
    expect(result.fields.some((f) => f.key === "type")).toBe(true);
    expect(result.sections.length).toBeGreaterThan(0);
    // Sections should contain the ones that had values (creatinina → dm_exams, medicamentos → dm_history)
    expect(
      result.sections.some((s) => s.fields.some((f) => f.key === "creatinina")),
    ).toBe(true);
    expect(
      result.sections.some((s) =>
        s.fields.some((f) => f.key === "medicamentos"),
      ),
    ).toBe(true);
  });

  it("returns sections when type changes to a type with no sections (DM → SIJ)", () => {
    // type is still visible (location is "unidade"), so 'type' itself is not cleared.
    // But SIJ has no sections, so all DM section data in form state is lost.
    const formValues: FormValues = {
      location: "unidade",
      type: "SIJ",
      creatinina: "1.2",
      medicamentos: ["ieca"],
    };
    const dmTypeField: SpecialtyField = {
      key: "type",
      label: "Tipologia",
      type: "select",
      visibleWhen: (ctx) => ctx.location === "unidade",
    };
    const result = getFieldsThatWouldBeCleared(formValues, [dmTypeField]);
    expect(result.fields.some((f) => f.key === "type")).toBe(false);
    expect(result.sections.length).toBeGreaterThan(0);
    expect(
      result.sections.some((s) => s.fields.some((f) => f.key === "creatinina")),
    ).toBe(true);
  });

  it("returns the section when its visibleWhen is false (SM sex=m)", () => {
    // The SM section has visibleWhen: ctx.location === "unidade" && ctx.sex !== "m".
    // With sex="m", the section is hidden — the whole section should appear in sections.
    const formValues: FormValues = {
      location: "unidade",
      sex: "m",
      type: "SM",
      trimestre: "1t",
    };
    const result = getFieldsThatWouldBeCleared(formValues, []);
    expect(result.sections.some((s) => s.fields.some((f) => f.key === "trimestre"))).toBe(true);
  });
});
