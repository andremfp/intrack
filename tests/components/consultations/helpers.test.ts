import { describe, expect, it } from "vitest";

import {
  areConsultationsSameIdentity,
  buildFiltersSummary,
  getConsultationFieldValue,
  makeConsultationKey,
  makeConsultationKeyFromInsert,
} from "@/components/consultations/helpers";
import type { ConsultationInsert } from "@/lib/api/consultations";
import { makeConsultationMGF } from "../../factories/consultation";

// ---------------------------------------------------------------------------
// getConsultationFieldValue
// ---------------------------------------------------------------------------

describe("getConsultationFieldValue", () => {
  it("returns a top-level value when it exists and is non-null", () => {
    const consultation = makeConsultationMGF({ type: "DM" });
    expect(getConsultationFieldValue(consultation, "type")).toBe("DM");
  });

  it("falls back to details JSONB when top-level value is null", () => {
    const consultation = makeConsultationMGF({
      smoker: null,
      details: { smoker: "yes" },
    });
    expect(getConsultationFieldValue(consultation, "smoker")).toBe("yes");
  });

  it("falls back to details JSONB when top-level key is undefined", () => {
    const consultation = makeConsultationMGF({ details: { custom_field: 42 } });
    expect(getConsultationFieldValue(consultation, "custom_field")).toBe(42);
  });

  it("returns null when the field is not found at top-level or in details", () => {
    const consultation = makeConsultationMGF({ details: {} });
    expect(getConsultationFieldValue(consultation, "nonexistent")).toBeNull();
  });

  it("returns null when details is null and top-level is absent", () => {
    const consultation = makeConsultationMGF({ details: null as unknown as Record<string, unknown> });
    expect(getConsultationFieldValue(consultation, "nonexistent")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// buildFiltersSummary
// ---------------------------------------------------------------------------

describe("buildFiltersSummary", () => {
  it("returns 'Nenhum filtro aplicado' for empty filters", () => {
    expect(buildFiltersSummary({})).toBe("Nenhum filtro aplicado");
  });

  it("includes year filter", () => {
    expect(buildFiltersSummary({ year: 2 })).toBe("Ano: 2");
  });

  it("includes location filter", () => {
    expect(buildFiltersSummary({ location: "unidade" })).toBe("Local: unidade");
  });

  it("includes internship filter", () => {
    expect(buildFiltersSummary({ internship: "HFF" })).toBe("Estágio: HFF");
  });

  it("includes sex filter", () => {
    expect(buildFiltersSummary({ sex: "m" })).toBe("Sexo: m");
  });

  it("includes autonomy filter", () => {
    expect(buildFiltersSummary({ autonomy: "total" })).toBe("Autonomia: total");
  });

  it("includes type filter", () => {
    expect(buildFiltersSummary({ type: "DM" })).toBe("Tipologia: DM");
  });

  // Age range variants
  it("includes age range with only ageMin", () => {
    expect(buildFiltersSummary({ ageMin: 18 })).toBe("Idade: 18 - ");
  });

  it("includes age range with only ageMax", () => {
    expect(buildFiltersSummary({ ageMax: 65 })).toBe("Idade:  - 65");
  });

  it("includes age range with both ageMin and ageMax", () => {
    expect(buildFiltersSummary({ ageMin: 18, ageMax: 65 })).toBe("Idade: 18 - 65");
  });

  // Date range variants
  it("includes date range with only dateFrom", () => {
    expect(buildFiltersSummary({ dateFrom: "2024-01-01" })).toBe("Período: 2024-01-01 - ");
  });

  it("includes date range with only dateTo", () => {
    expect(buildFiltersSummary({ dateTo: "2024-12-31" })).toBe("Período:  - 2024-12-31");
  });

  it("includes date range with both dateFrom and dateTo", () => {
    expect(buildFiltersSummary({ dateFrom: "2024-01-01", dateTo: "2024-12-31" })).toBe(
      "Período: 2024-01-01 - 2024-12-31"
    );
  });

  // Boolean filters
  it("renders presential true as 'Sim'", () => {
    expect(buildFiltersSummary({ presential: true })).toBe("Presencial: Sim");
  });

  it("renders presential false as 'Não'", () => {
    expect(buildFiltersSummary({ presential: false })).toBe("Presencial: Não");
  });

  it("includes smoker filter", () => {
    expect(buildFiltersSummary({ smoker: "yes" })).toBe("Fumador: yes");
  });

  it("includes contraceptive filter", () => {
    expect(buildFiltersSummary({ contraceptive: "pill" })).toBe("Contraceptivo: pill");
  });

  it("includes new_contraceptive filter", () => {
    expect(buildFiltersSummary({ new_contraceptive: "implant" })).toBe(
      "Novo Contraceptivo: implant"
    );
  });

  it("joins multiple active filters with ' | '", () => {
    const result = buildFiltersSummary({ year: 1, sex: "f", type: "SA" });
    expect(result).toBe("Ano: 1 | Sexo: f | Tipologia: SA");
  });
});

// ---------------------------------------------------------------------------
// makeConsultationKey
// ---------------------------------------------------------------------------

describe("makeConsultationKey", () => {
  it("produces '{ISO-date}::{processNumber}' format", () => {
    expect(makeConsultationKey({ date: "2024-06-17", processNumber: 12345 })).toBe(
      "2024-06-17::12345"
    );
  });

  it("normalises an ISO datetime to date-only (YYYY-MM-DD)", () => {
    expect(makeConsultationKey({ date: "2024-06-17T10:30:00Z", processNumber: 1 })).toBe(
      "2024-06-17::1"
    );
  });

  it("trims string process numbers", () => {
    expect(makeConsultationKey({ date: "2024-06-17", processNumber: "  99  " })).toBe(
      "2024-06-17::99"
    );
  });

  it("converts number process numbers to string", () => {
    const key = makeConsultationKey({ date: "2024-06-17", processNumber: 42 });
    expect(key).toBe("2024-06-17::42");
  });
});

// ---------------------------------------------------------------------------
// makeConsultationKeyFromInsert
// ---------------------------------------------------------------------------

describe("makeConsultationKeyFromInsert", () => {
  it("returns null when date is missing", () => {
    const insert: Partial<ConsultationInsert> = { process_number: 1 };
    expect(makeConsultationKeyFromInsert(insert)).toBeNull();
  });

  it("returns null when process_number is undefined", () => {
    const insert: Partial<ConsultationInsert> = { date: "2024-06-17" };
    expect(makeConsultationKeyFromInsert(insert)).toBeNull();
  });

  it("returns the correct key when both date and process_number are present", () => {
    const insert: Partial<ConsultationInsert> = {
      date: "2024-06-17",
      process_number: 99,
    };
    expect(makeConsultationKeyFromInsert(insert)).toBe("2024-06-17::99");
  });
});

// ---------------------------------------------------------------------------
// areConsultationsSameIdentity
// ---------------------------------------------------------------------------

describe("areConsultationsSameIdentity", () => {
  it("returns true for consultations with the same date and process_number", () => {
    const a = makeConsultationMGF({ date: "2024-06-17", process_number: 100 });
    const b = makeConsultationMGF({ date: "2024-06-17", process_number: 100 });
    expect(areConsultationsSameIdentity(a, b)).toBe(true);
  });

  it("returns false for different dates with same process_number", () => {
    const a = makeConsultationMGF({ date: "2024-06-17", process_number: 100 });
    const b = makeConsultationMGF({ date: "2024-06-18", process_number: 100 });
    expect(areConsultationsSameIdentity(a, b)).toBe(false);
  });

  it("returns false for same date with different process_number", () => {
    const a = makeConsultationMGF({ date: "2024-06-17", process_number: 100 });
    const b = makeConsultationMGF({ date: "2024-06-17", process_number: 200 });
    expect(areConsultationsSameIdentity(a, b)).toBe(false);
  });

  it("normalises datetime vs date-only correctly", () => {
    const a = makeConsultationMGF({ date: "2024-06-17T08:00:00Z", process_number: 5 });
    const b = makeConsultationMGF({ date: "2024-06-17", process_number: 5 });
    expect(areConsultationsSameIdentity(a, b)).toBe(true);
  });
});
