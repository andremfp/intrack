import { describe, it, expect, vi } from "vitest";
import {
  keyValueStateReducer,
  loadPersistedState,
  mergeFilters,
  getFiltersKey,
} from "@/hooks/filters/helpers";
import type { ConsultationsFilters } from "@/lib/api/consultations";

// ---------------------------------------------------------------------------
// keyValueStateReducer
// ---------------------------------------------------------------------------

type SimpleState = { a: string; b: number; c?: string };

describe("keyValueStateReducer", () => {
  const initial: SimpleState = { a: "hello", b: 42 };

  it("SET_FIELD: sets a single key and preserves the rest", () => {
    const result = keyValueStateReducer(initial, {
      type: "SET_FIELD",
      payload: { key: "a", value: "world" },
    });
    expect(result).toEqual({ a: "world", b: 42 });
  });

  it("SET_FIELD: does not mutate the original state", () => {
    keyValueStateReducer(initial, {
      type: "SET_FIELD",
      payload: { key: "a", value: "world" },
    });
    expect(initial.a).toBe("hello");
  });

  it("SET_FIELDS: merges multiple keys", () => {
    const result = keyValueStateReducer(initial, {
      type: "SET_FIELDS",
      payload: { a: "new", b: 99 },
    });
    expect(result).toEqual({ a: "new", b: 99 });
  });

  it("SET_FIELDS: preserves keys not present in payload", () => {
    const state: SimpleState = { a: "hello", b: 42, c: "keep" };
    const result = keyValueStateReducer(state, {
      type: "SET_FIELDS",
      payload: { a: "changed" },
    });
    expect(result.c).toBe("keep");
  });

  it("RESET_FIELD: sets the specified key to undefined", () => {
    const result = keyValueStateReducer(initial, {
      type: "RESET_FIELD",
      payload: "a",
    });
    expect(result.a).toBeUndefined();
    expect(result.b).toBe(42);
  });

  it("RESET_ALL: with payload returns the payload", () => {
    const payload: SimpleState = { a: "reset", b: 0 };
    const result = keyValueStateReducer(initial, {
      type: "RESET_ALL",
      payload,
    });
    expect(result).toEqual(payload);
  });

  it("RESET_ALL: without payload returns state unchanged", () => {
    const result = keyValueStateReducer(initial, { type: "RESET_ALL" });
    expect(result).toEqual(initial);
  });

  it("RESET: returns the payload object", () => {
    const payload: SimpleState = { a: "fresh", b: 1 };
    const result = keyValueStateReducer(initial, {
      type: "RESET",
      payload,
    });
    expect(result).toEqual(payload);
  });

  it("unknown action type: returns state unchanged", () => {
    // Cast to bypass TypeScript so we can test the default branch
    const result = keyValueStateReducer(initial, {
      type: "UNKNOWN_ACTION" as never,
    } as never);
    expect(result).toEqual(initial);
  });
});

// ---------------------------------------------------------------------------
// loadPersistedState
// ---------------------------------------------------------------------------

describe("loadPersistedState", () => {
  const defaults: ConsultationsFilters = { year: 1, type: undefined };

  it("returns defaultValue when the key is absent in storage", () => {
    const storage = { getItem: vi.fn().mockReturnValue(null) };
    const result = loadPersistedState("missing-key", defaults, storage);
    expect(result).toEqual(defaults);
  });

  it("returns merged object when the key exists (cached values take precedence)", () => {
    const cached = JSON.stringify({ year: 3 });
    const storage = { getItem: vi.fn().mockReturnValue(cached) };
    const result = loadPersistedState("my-key", defaults, storage);
    expect(result).toEqual({ year: 3, type: undefined });
  });

  it("falls back to default for keys absent in cached object", () => {
    // Cache only has 'year', 'type' should come from defaults
    const cached = JSON.stringify({ year: 2 });
    const storage = { getItem: vi.fn().mockReturnValue(cached) };
    const result = loadPersistedState("my-key", { year: 1, type: "DM" }, storage);
    expect(result.type).toBe("DM");
  });

  it("returns defaultValue when stored JSON is malformed", () => {
    const storage = { getItem: vi.fn().mockReturnValue("{ bad json :::") };
    const result = loadPersistedState("bad-key", defaults, storage);
    expect(result).toEqual(defaults);
  });
});

// ---------------------------------------------------------------------------
// mergeFilters
// ---------------------------------------------------------------------------

describe("mergeFilters", () => {
  const base: ConsultationsFilters = { year: 1, sex: "m", type: "DM" };

  it("returns base unchanged when no override is provided", () => {
    const result = mergeFilters(base);
    expect(result).toBe(base);
  });

  it("returns base unchanged when override is undefined", () => {
    const result = mergeFilters(base, undefined);
    expect(result).toBe(base);
  });

  it("returns merged object with override taking precedence", () => {
    const result = mergeFilters(base, { sex: "f" });
    expect(result).toEqual({ year: 1, sex: "f", type: "DM" });
  });

  it("preserves base keys not present in override", () => {
    const result = mergeFilters(base, { type: "HTA" });
    expect(result.year).toBe(1);
    expect(result.sex).toBe("m");
  });

  it("does not mutate the base object", () => {
    mergeFilters(base, { year: 99 });
    expect(base.year).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// getFiltersKey
// ---------------------------------------------------------------------------

describe("getFiltersKey", () => {
  it('"Consultas" tab with year returns "consultations-filters-{year}"', () => {
    expect(getFiltersKey("Consultas", 2)).toBe("consultations-filters-2");
  });

  it('"Consultas" tab without year falls back to 1', () => {
    expect(getFiltersKey("Consultas")).toBe("consultations-filters-1");
  });

  it('"Métricas" tab with subTab returns "metrics-filters-{subTab}"', () => {
    expect(getFiltersKey("Métricas", undefined, "ICPC-2")).toBe("metrics-filters-ICPC-2");
  });

  it('"Métricas" tab without subTab falls back to "Geral"', () => {
    expect(getFiltersKey("Métricas")).toBe("metrics-filters-Geral");
  });

  it('"Métricas" tab with "Consultas" subTab returns "metrics-filters-Consultas"', () => {
    expect(getFiltersKey("Métricas", undefined, "Consultas")).toBe(
      "metrics-filters-Consultas"
    );
  });
});
