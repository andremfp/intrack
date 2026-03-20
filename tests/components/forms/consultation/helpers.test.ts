import { describe, expect, it, vi } from "vitest";
import { validateForm } from "@/components/forms/consultation/helpers";
import type { FormValues } from "@/hooks/consultations/types";

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
