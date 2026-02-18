import { beforeEach, describe, expect, it, vi } from "vitest";
import { getReportData } from "@/lib/api/reports";
import { getSpecialtyReportConfig } from "@/reports/helpers";
import { checkRateLimit, clearRateLimitCache } from "@/lib/api/rate-limit";
import type { SpecialtyReportConfig } from "@/reports/report-types";
import type { MGFReportData } from "@/reports/report-types";

// ---------------------------------------------------------------------------
// Hoisted mocks — created before any module is imported
// ---------------------------------------------------------------------------
const hoisted = vi.hoisted(() => {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
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

vi.mock("@/reports/helpers", () => ({
  getSpecialtyReportConfig: vi.fn(),
}));

vi.mock("@/lib/api/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  clearRateLimitCache: vi.fn(),
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

const MOCK_REPORT_DATA: MGFReportData = {
  summary: {
    totalConsultations: 5,
    typeCounts: {},
    autonomyCounts: {},
    presentialCounts: { presential: 3, remote: 2 },
  },
};

/** Creates a minimal SpecialtyReportConfig with a spied buildReport. */
function makeConfig(specialtyYears: number[]): SpecialtyReportConfig {
  return {
    specialtyCode: "mgf",
    reportKey: "r1",
    specialtyYears,
    buildReport: vi.fn().mockReturnValue(MOCK_REPORT_DATA),
  };
}

const RATE_LIMIT_OK = { success: true, data: { allowed: true } };
const RATE_LIMIT_BLOCKED = { success: true, data: { allowed: false } };
const RATE_LIMIT_NETWORK_ERROR = { success: false, error: new Error("network") };

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
  vi.mocked(getSpecialtyReportConfig).mockReset();
  vi.mocked(checkRateLimit).mockReset();
  vi.mocked(clearRateLimitCache).mockReset();
});

// ---------------------------------------------------------------------------
// getReportData
// ---------------------------------------------------------------------------
describe("getReportData", () => {
  it("returns failure when reportKey is invalid, before rate limit or DB call", async () => {
    vi.mocked(getSpecialtyReportConfig).mockReturnValueOnce(null);
    const result = await getReportData({
      userId: "u1",
      specialtyCode: "mgf",
      reportKey: "invalid",
    });
    expect(result.success).toBe(false);
    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(hoisted.from).not.toHaveBeenCalled();
  });

  it("returns failure when rate limit check has a network error, cache not cleared", async () => {
    vi.mocked(getSpecialtyReportConfig).mockReturnValueOnce(makeConfig([1]));
    vi.mocked(checkRateLimit).mockResolvedValueOnce(RATE_LIMIT_NETWORK_ERROR);
    const result = await getReportData({
      userId: "u1",
      specialtyCode: "mgf",
      reportKey: "r1",
    });
    expect(result.success).toBe(false);
    expect(clearRateLimitCache).not.toHaveBeenCalled();
    // from() is called to build the query, but the DB is never awaited
    expect(hoisted.query.then).not.toHaveBeenCalled();
  });

  it("returns failure when rate limit is not allowed, cache not cleared", async () => {
    vi.mocked(getSpecialtyReportConfig).mockReturnValueOnce(makeConfig([1]));
    vi.mocked(checkRateLimit).mockResolvedValueOnce(RATE_LIMIT_BLOCKED);
    const result = await getReportData({
      userId: "u1",
      specialtyCode: "mgf",
      reportKey: "r1",
    });
    expect(result.success).toBe(false);
    expect(clearRateLimitCache).not.toHaveBeenCalled();
    expect(hoisted.query.then).not.toHaveBeenCalled();
  });

  it("uses eq for a single specialtyYear", async () => {
    const config = makeConfig([2]);
    vi.mocked(getSpecialtyReportConfig).mockReturnValueOnce(config);
    vi.mocked(checkRateLimit).mockResolvedValueOnce(RATE_LIMIT_OK);
    resolveQuery([], null);
    await getReportData({ userId: "u1", specialtyCode: "mgf", reportKey: "r1" });
    expect(hoisted.query.eq).toHaveBeenCalledWith("specialty_year", 2);
    expect(hoisted.query.in).not.toHaveBeenCalled();
  });

  it("uses in for multiple specialtyYears", async () => {
    const config = makeConfig([1, 2]);
    vi.mocked(getSpecialtyReportConfig).mockReturnValueOnce(config);
    vi.mocked(checkRateLimit).mockResolvedValueOnce(RATE_LIMIT_OK);
    resolveQuery([], null);
    await getReportData({ userId: "u1", specialtyCode: "mgf", reportKey: "r1" });
    expect(hoisted.query.in).toHaveBeenCalledWith("specialty_year", [1, 2]);
    expect(hoisted.query.eq).not.toHaveBeenCalledWith(
      "specialty_year",
      expect.anything()
    );
  });

  it("orders results by date ascending", async () => {
    vi.mocked(getSpecialtyReportConfig).mockReturnValueOnce(makeConfig([1]));
    vi.mocked(checkRateLimit).mockResolvedValueOnce(RATE_LIMIT_OK);
    resolveQuery([], null);
    await getReportData({ userId: "u1", specialtyCode: "mgf", reportKey: "r1" });
    expect(hoisted.query.order).toHaveBeenCalledWith("date", { ascending: true });
  });

  it("returns failure when DB query fails, cache not cleared", async () => {
    vi.mocked(getSpecialtyReportConfig).mockReturnValueOnce(makeConfig([1]));
    vi.mocked(checkRateLimit).mockResolvedValueOnce(RATE_LIMIT_OK);
    resolveQuery(null, DB_ERROR);
    const result = await getReportData({
      userId: "u1",
      specialtyCode: "mgf",
      reportKey: "r1",
    });
    expect(result.success).toBe(false);
    expect(clearRateLimitCache).not.toHaveBeenCalled();
  });

  it("calls clearRateLimitCache and returns buildReport result on success", async () => {
    const config = makeConfig([1]);
    vi.mocked(getSpecialtyReportConfig).mockReturnValueOnce(config);
    vi.mocked(checkRateLimit).mockResolvedValueOnce(RATE_LIMIT_OK);
    const mockRecords = [{ id: "c1" }];
    resolveQuery(mockRecords, null);
    const result = await getReportData({
      userId: "u1",
      specialtyCode: "mgf",
      reportKey: "r1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(MOCK_REPORT_DATA);
    }
    expect(config.buildReport).toHaveBeenCalledWith(mockRecords);
    expect(clearRateLimitCache).toHaveBeenCalledWith("report");
  });
});
