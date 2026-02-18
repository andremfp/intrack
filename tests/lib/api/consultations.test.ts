import { beforeEach, describe, expect, it, vi } from "vitest";

import { success } from "@/errors";
import type { RateLimitStatus } from "@/lib/api/rate-limit";
import { checkRateLimit, clearRateLimitCache } from "@/lib/api/rate-limit";
import {
  calculateMetrics,
  getEmptyMetrics,
} from "@/lib/api/consultation-metrics";
import { applyMGFFilters } from "@/lib/api/consultation-filters";
import {
  prepareConsultationDetails,
  getConsultation,
  createConsultation,
  updateConsultation,
  deleteConsultation,
  getUserConsultationsInDateRange,
  getConsultationByDateAndProcessNumber,
  createConsultationsBatch,
  getMGFConsultations,
  getMGFConsultationsForExport,
  getConsultationMetrics,
  getConsultationTimeSeries,
} from "@/lib/api/consultations";
import type {
  Consultation,
  ConsultationMGF,
  ConsultationInsert,
} from "@/lib/api/consultations";

// ---------------------------------------------------------------------------
// Supabase mock — thenable query chain
//
// All chain methods return `query` itself for fluent chaining.
// `then` (PromiseLike) controls what `await <chain>` resolves to; each test
// sets exactly one resolution via resolveQuery() so results never bleed.
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    or: vi.fn(),
    neq: vi.fn(),
    ilike: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(),
    // PromiseLike — `await <chain>` calls this; each test wires it via mockImplementationOnce
    then: vi.fn(),
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

vi.mock("@/lib/api/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  clearRateLimitCache: vi.fn(),
}));

// Filter and metrics modules are tested in isolation — mock them here so
// this file focuses on consultations.ts orchestration logic only.
vi.mock("@/lib/api/consultation-filters", () => ({
  applyMGFFilters: vi.fn((q) => q),
}));

vi.mock("@/lib/api/consultation-metrics", () => ({
  calculateMetrics: vi.fn(() => ({})),
  getEmptyMetrics: vi.fn(() => ({})),
}));

// Partial mock: override only getDefaultSpecialtyDetails so we can control
// what "defaults" look like in prepareConsultationDetails tests without losing
// PAGINATION_CONSTANTS or any other runtime export that consultations.ts needs.
vi.mock("@/constants", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/constants")>();
  return {
    ...original,
    getDefaultSpecialtyDetails: vi.fn(() => ({
      defaultField: "defaultValue",
      sharedField: "defaultShared",
    })),
  };
});

// ---------------------------------------------------------------------------
// Typed mock references
// ---------------------------------------------------------------------------
const mockCheckRateLimit = vi.mocked(checkRateLimit);
const mockClearRateLimitCache = vi.mocked(clearRateLimitCache);
const mockApplyMGFFilters = vi.mocked(applyMGFFilters);
const mockCalculateMetrics = vi.mocked(calculateMetrics);
const mockGetEmptyMetrics = vi.mocked(getEmptyMetrics);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Queues one resolution for the next `await <supabase chain>` call. */
function resolveQuery(
  data: unknown,
  error: unknown = null,
  count?: number
): void {
  (hoisted.query.then as ReturnType<typeof vi.fn>).mockImplementationOnce(
    (resolve: (v: unknown) => void) =>
      resolve({ data, error, ...(count !== undefined ? { count } : {}) })
  );
}

const allowedStatus = (): ReturnType<typeof success<RateLimitStatus>> =>
  success({ allowed: true, remainingRequests: 5, resetTime: "" });

const notAllowedStatus = (): ReturnType<typeof success<RateLimitStatus>> =>
  success({ allowed: false, remainingRequests: 0, resetTime: "" });

const DB_ERROR = {
  message: "DB error",
  code: "500",
  details: null,
  hint: null,
};

// Minimal fixture — double-cast because the literal only covers a subset of the
// generated schema type (all other columns default to null in the real DB).
const mockConsultation = {
  id: "c1",
  user_id: "u1",
  date: "2024-01-15",
  process_number: 123,
  sex: "f",
  age: 30,
  age_unit: "years",
} as unknown as Consultation;

// ---------------------------------------------------------------------------
// beforeEach — reset all mocks to a clean baseline
// ---------------------------------------------------------------------------
beforeEach(() => {
  // Clear call records; chain method return values are preserved by mockClear
  hoisted.from.mockClear();
  (Object.keys(hoisted.query) as (keyof typeof hoisted.query)[])
    .filter((k) => k !== "then")
    .forEach((k) => {
      (hoisted.query[k] as ReturnType<typeof vi.fn>).mockClear();
    });

  // Full reset on `then` so leftover once-implementations never bleed between tests
  hoisted.query.then.mockReset();

  // Full reset on rate-limit mocks (each test provides its own setup)
  mockCheckRateLimit.mockReset();
  mockClearRateLimitCache.mockReset();

  // Clear call records only; factory implementations (q => q, () => {}) are preserved
  mockApplyMGFFilters.mockClear();
  mockCalculateMetrics.mockClear();
  mockGetEmptyMetrics.mockClear();
});

// ===========================================================================
describe("consultations API", () => {
  // -------------------------------------------------------------------------
  describe("prepareConsultationDetails", () => {
    it("provided values override matching default fields", () => {
      // The mock returns { defaultField: "defaultValue", sharedField: "defaultShared" }.
      // Providing sharedField should win; non-provided defaultField should be preserved.
      const result = prepareConsultationDetails("any-code", {
        sharedField: "override",
        extraField: "new",
      });
      expect(result).toEqual({
        defaultField: "defaultValue", // from defaults, not provided
        sharedField: "override", // provided wins over default
        extraField: "new", // provided-only key
      });
    });
  });

  // -------------------------------------------------------------------------
  describe("getConsultation", () => {
    it("returns success with the consultation on success", async () => {
      resolveQuery(mockConsultation);
      const result = await getConsultation("c1");
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual(mockConsultation);
    });

    it("returns failure on DB error", async () => {
      resolveQuery(null, DB_ERROR);
      const result = await getConsultation("c1");
      expect(result.success).toBe(false);
    });

    it("returns failure with the correct message when data is null", async () => {
      resolveQuery(null);
      const result = await getConsultation("c1");
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.userMessage).toBe("Consulta não encontrada.");
    });
  });

  // -------------------------------------------------------------------------
  describe("createConsultation", () => {
    it("returns success with the created record", async () => {
      resolveQuery(mockConsultation);
      const result = await createConsultation(
        { user_id: "u1" } as ConsultationInsert
      );
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual(mockConsultation);
    });

    it("returns failure on DB error", async () => {
      resolveQuery(null, DB_ERROR);
      const result = await createConsultation(
        { user_id: "u1" } as ConsultationInsert
      );
      expect(result.success).toBe(false);
    });

    it("returns failure with the correct message when data is null", async () => {
      resolveQuery(null);
      const result = await createConsultation(
        { user_id: "u1" } as ConsultationInsert
      );
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.userMessage).toBe("Erro ao criar consulta.");
    });
  });

  // -------------------------------------------------------------------------
  describe("updateConsultation", () => {
    it("returns success with the updated record", async () => {
      resolveQuery(mockConsultation);
      const result = await updateConsultation("c1", { sex: "f" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual(mockConsultation);
    });

    it("returns failure on DB error", async () => {
      resolveQuery(null, DB_ERROR);
      const result = await updateConsultation("c1", { sex: "f" });
      expect(result.success).toBe(false);
    });

    it("returns failure with the correct message when data is null", async () => {
      resolveQuery(null);
      const result = await updateConsultation("c1", { sex: "f" });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.userMessage).toBe("Erro ao atualizar consulta.");
    });
  });

  // -------------------------------------------------------------------------
  describe("deleteConsultation", () => {
    it("returns success on deletion", async () => {
      resolveQuery(null);
      const result = await deleteConsultation("c1");
      expect(result.success).toBe(true);
    });

    it("returns failure on DB error", async () => {
      resolveQuery(null, DB_ERROR);
      const result = await deleteConsultation("c1");
      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  describe("getUserConsultationsInDateRange", () => {
    it("returns consultations within the date range", async () => {
      resolveQuery([mockConsultation]);
      const result = await getUserConsultationsInDateRange(
        "u1",
        "2024-01-01",
        "2024-12-31"
      );
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toHaveLength(1);
    });

    it("returns failure on DB error", async () => {
      resolveQuery(null, DB_ERROR);
      const result = await getUserConsultationsInDateRange(
        "u1",
        "2024-01-01",
        "2024-12-31"
      );
      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  describe("getConsultationByDateAndProcessNumber", () => {
    it("returns the consultation when found", async () => {
      resolveQuery([mockConsultation]);
      const result = await getConsultationByDateAndProcessNumber({
        userId: "u1",
        date: "2024-01-15",
        processNumber: 123,
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual(mockConsultation);
    });

    it("returns null when not found (empty array)", async () => {
      resolveQuery([]);
      const result = await getConsultationByDateAndProcessNumber({
        userId: "u1",
        date: "2024-01-15",
        processNumber: 999,
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBeNull();
    });

    it("returns failure on DB error", async () => {
      resolveQuery(null, DB_ERROR);
      const result = await getConsultationByDateAndProcessNumber({
        userId: "u1",
        date: "2024-01-15",
        processNumber: 123,
      });
      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  describe("createConsultationsBatch", () => {
    // Note: "checkRateLimit returns a failure response" is already covered by
    // guarded-api-flows.test.ts; here we cover the complementary "allowed:false" branch.

    it("returns failure when rate limit is not allowed (allowed: false)", async () => {
      mockCheckRateLimit.mockResolvedValueOnce(notAllowedStatus());
      const result = await createConsultationsBatch([
        {} as ConsultationInsert,
      ]);
      expect(result.success).toBe(false);
      expect(hoisted.from).not.toHaveBeenCalled();
      expect(mockClearRateLimitCache).not.toHaveBeenCalled();
    });

    it("returns empty result without DB calls for an empty input array", async () => {
      // Rate limit is still checked before the empty-array guard
      mockCheckRateLimit.mockResolvedValueOnce(allowedStatus());
      const result = await createConsultationsBatch([]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.created).toBe(0);
        expect(result.data.errors).toHaveLength(0);
      }
      expect(hoisted.from).not.toHaveBeenCalled();
      // Early return skips successWithClear, so cache is NOT cleared
      expect(mockClearRateLimitCache).not.toHaveBeenCalled();
    });

    it("returns total created count and clears cache on chunk success", async () => {
      mockCheckRateLimit.mockResolvedValueOnce(allowedStatus());
      const rows = [{} as ConsultationInsert, {} as ConsultationInsert];
      resolveQuery(rows); // batch insert succeeds; data.length = 2
      const result = await createConsultationsBatch(rows);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.created).toBe(2);
        expect(result.data.errors).toHaveLength(0);
      }
      expect(mockClearRateLimitCache).toHaveBeenCalledWith("import");
    });

    it("falls back to per-row inserts on batch error and still clears cache", async () => {
      mockCheckRateLimit.mockResolvedValueOnce(allowedStatus());
      // Batch insert fails
      resolveQuery(null, DB_ERROR);
      // Row 0 succeeds; row 1 fails
      resolveQuery({});
      resolveQuery(null, { message: "row 1 failed", code: "400", details: null, hint: null });

      const rows = [{} as ConsultationInsert, {} as ConsultationInsert];
      const result = await createConsultationsBatch(rows);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.created).toBe(1);
        expect(result.data.errors).toHaveLength(1);
        expect(result.data.errors[0]).toMatchObject({
          index: 1,
          error: "row 1 failed",
        });
      }
      expect(mockClearRateLimitCache).toHaveBeenCalledWith("import");
    });
  });

  // -------------------------------------------------------------------------
  describe("getMGFConsultations", () => {
    it("returns paginated data with total count using DB-level sorting", async () => {
      const consultations = [
        mockConsultation,
      ] as unknown as ConsultationMGF[];
      resolveQuery(consultations, null, 10);
      // page=1, pageSize=1 → from=0, to=0
      const result = await getMGFConsultations("u1", 1, 1, 1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.consultations).toEqual(consultations);
        expect(result.data.totalCount).toBe(10);
      }
      // Default sort: favorites first, then date descending
      expect(hoisted.query.order).toHaveBeenCalledWith("favorite", {
        ascending: false,
        nullsFirst: false,
      });
      expect(hoisted.query.order).toHaveBeenCalledWith("date", {
        ascending: false,
      });
      expect(hoisted.query.range).toHaveBeenCalledWith(0, 0);
    });

    it("sorts in memory and paginates manually for age sort — no DB order or range", async () => {
      const unsorted = [
        { id: "a", age: 30, age_unit: "years", favorite: false },
        { id: "b", age: 20, age_unit: "years", favorite: false },
        { id: "c", age: 40, age_unit: "years", favorite: false },
      ] as ConsultationMGF[];
      resolveQuery(unsorted, null, 3);

      // page=1, pageSize=2, sort by age descending
      const result = await getMGFConsultations(
        "u1",
        undefined,
        1,
        2,
        undefined,
        { field: "age", order: "desc" }
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalCount).toBe(3);
        expect(result.data.consultations).toHaveLength(2);
        // Age desc: c(40) → a(30) → b(20); first page = [c, a]
        expect(result.data.consultations[0].id).toBe("c");
        expect(result.data.consultations[1].id).toBe("a");
      }
      // No DB-level ordering or range for the age sort path
      expect(hoisted.query.order).not.toHaveBeenCalled();
      expect(hoisted.query.range).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  describe("getMGFConsultationsForExport", () => {
    // Note: "checkRateLimit returns a failure response" for export is already
    // covered by guarded-api-flows.test.ts.

    it("returns empty array immediately when userId is empty (skips rate limit)", async () => {
      const result = await getMGFConsultationsForExport("");
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toHaveLength(0);
      expect(mockCheckRateLimit).not.toHaveBeenCalled();
      expect(hoisted.from).not.toHaveBeenCalled();
    });

    it("returns failure when rate limit is not allowed (allowed: false)", async () => {
      mockCheckRateLimit.mockResolvedValueOnce(notAllowedStatus());
      const result = await getMGFConsultationsForExport("u1");
      expect(result.success).toBe(false);
      expect(hoisted.from).not.toHaveBeenCalled();
      expect(mockClearRateLimitCache).not.toHaveBeenCalled();
    });

    it("returns all records and clears cache on success", async () => {
      mockCheckRateLimit.mockResolvedValueOnce(allowedStatus());
      const consultations = [
        mockConsultation,
      ] as unknown as ConsultationMGF[];
      resolveQuery(consultations);
      const result = await getMGFConsultationsForExport("u1");
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual(consultations);
      expect(mockClearRateLimitCache).toHaveBeenCalledWith("export");
    });

    it("returns failure on DB error without clearing cache", async () => {
      mockCheckRateLimit.mockResolvedValueOnce(allowedStatus());
      resolveQuery(null, DB_ERROR);
      const result = await getMGFConsultationsForExport("u1");
      expect(result.success).toBe(false);
      expect(mockClearRateLimitCache).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  describe("getConsultationMetrics", () => {
    it("passes filters and excludeType to applyMGFFilters and returns calculateMetrics result", async () => {
      const data = [mockConsultation] as unknown as ConsultationMGF[];
      const mockMetrics = { totalConsultations: 1 };
      mockCalculateMetrics.mockReturnValueOnce(
        mockMetrics as ReturnType<typeof calculateMetrics>
      );
      resolveQuery(data);

      const filters = { year: 1 };
      const result = await getConsultationMetrics("u1", filters, "mgf", "AM");
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual(mockMetrics);
      // applyMGFFilters must receive the live query object, the filters, and the excludeType
      expect(mockApplyMGFFilters).toHaveBeenCalledWith(
        hoisted.query,
        filters,
        "AM"
      );
      expect(mockCalculateMetrics).toHaveBeenCalledWith(data);
    });

    it("returns empty metrics via getEmptyMetrics when data is null", async () => {
      const emptyMetrics = { totalConsultations: 0 };
      mockGetEmptyMetrics.mockReturnValueOnce(
        emptyMetrics as ReturnType<typeof getEmptyMetrics>
      );
      resolveQuery(null);
      const result = await getConsultationMetrics("u1");
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toEqual(emptyMetrics);
      expect(mockGetEmptyMetrics).toHaveBeenCalled();
      expect(mockCalculateMetrics).not.toHaveBeenCalled();
    });

    it("returns failure on DB error", async () => {
      resolveQuery(null, DB_ERROR);
      const result = await getConsultationMetrics("u1");
      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  describe("getConsultationTimeSeries", () => {
    it("aggregates consultations by day and sorts ascending", async () => {
      resolveQuery([
        { date: "2024-01-10" },
        { date: "2024-01-15" },
        { date: "2024-01-10" },
      ]);
      const result = await getConsultationTimeSeries("u1");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([
          { date: "2024-01-10", count: 2 },
          { date: "2024-01-15", count: 1 },
        ]);
      }
    });

    it("normalizes ISO datetime strings to date-only keys before aggregating", async () => {
      resolveQuery([
        { date: "2024-01-15T10:30:00Z" },
        { date: "2024-01-15T14:00:00Z" },
      ]);
      const result = await getConsultationTimeSeries("u1");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([{ date: "2024-01-15", count: 2 }]);
      }
    });

    it("returns empty array when data is null", async () => {
      resolveQuery(null);
      const result = await getConsultationTimeSeries("u1");
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toHaveLength(0);
    });

    it("returns failure on DB error", async () => {
      resolveQuery(null, DB_ERROR);
      const result = await getConsultationTimeSeries("u1");
      expect(result.success).toBe(false);
    });
  });
});
