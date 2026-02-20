import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError, ErrorMessages } from "@/errors";
import { getSpecialties, getSpecialty } from "@/lib/api/specialties";
import type { Specialty } from "@/lib/api/specialties";

// ---------------------------------------------------------------------------
// Hoisted mocks — created before any module is imported
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    then: vi.fn(), // PromiseLike — lets `await <chain>` resolve via resolveQuery()
  };
  (Object.keys(query) as (keyof typeof query)[])
    .filter((k) => k !== "then")
    .forEach((k) => {
      (query[k] as ReturnType<typeof vi.fn>).mockReturnValue(query);
    });

  const from = vi.fn(() => query);
  return { query, from };
});

vi.mock("@/supabase", () => ({
  supabase: { from: hoisted.from },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Queue one resolution for the next awaited Supabase chain call. */
function resolveQuery(data: unknown, error: unknown = null): void {
  (hoisted.query.then as ReturnType<typeof vi.fn>).mockImplementationOnce(
    (resolve: (v: unknown) => void) => resolve({ data, error })
  );
}

const DB_ERROR = { message: "DB error", code: "500", details: null, hint: null };

// Partial fixture — double-cast because schema type requires all columns
const mockSpecialty = { id: "sp1", name: "MGF" } as unknown as Specialty;

// ---------------------------------------------------------------------------
// Global reset between tests
// ---------------------------------------------------------------------------
beforeEach(() => {
  hoisted.from.mockClear();
  (Object.keys(hoisted.query) as (keyof typeof hoisted.query)[])
    .filter((k) => k !== "then")
    .forEach((k) => {
      (hoisted.query[k] as ReturnType<typeof vi.fn>).mockClear();
    });
  // mockReset clears queued mockImplementationOnce calls, preventing bleed
  hoisted.query.then.mockReset();
});

// ---------------------------------------------------------------------------
// getSpecialties
// ---------------------------------------------------------------------------
describe("getSpecialties", () => {
  it("returns failure on DB error", async () => {
    resolveQuery(null, DB_ERROR);
    const result = await getSpecialties();
    expect(result.success).toBe(false);
  });

  it("returns SPECIALTY_NOT_FOUND when data is null", async () => {
    resolveQuery(null, null);
    const result = await getSpecialties();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(AppError);
      expect(result.error.userMessage).toBe(ErrorMessages.SPECIALTY_NOT_FOUND);
    }
  });

  it("returns success with empty array when data is [] (array is truthy)", async () => {
    resolveQuery([], null);
    const result = await getSpecialties();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it("returns success with the DB data and orders by name ascending", async () => {
    resolveQuery([mockSpecialty], null);
    const result = await getSpecialties();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([mockSpecialty]);
    }
    expect(hoisted.query.order).toHaveBeenCalledWith("name", { ascending: true });
  });
});

// ---------------------------------------------------------------------------
// getSpecialty
// ---------------------------------------------------------------------------
describe("getSpecialty", () => {
  it("returns failure on DB error", async () => {
    resolveQuery(null, DB_ERROR);
    const result = await getSpecialty("sp1");
    expect(result.success).toBe(false);
  });

  it("returns SPECIALTY_NOT_FOUND when data is null", async () => {
    resolveQuery(null, null);
    const result = await getSpecialty("sp1");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(AppError);
      expect(result.error.userMessage).toBe(ErrorMessages.SPECIALTY_NOT_FOUND);
    }
  });

  it("returns success with the specialty record and filters by id", async () => {
    resolveQuery(mockSpecialty, null);
    const result = await getSpecialty("sp1");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(mockSpecialty);
    }
    expect(hoisted.query.eq).toHaveBeenCalledWith("id", "sp1");
  });
});
