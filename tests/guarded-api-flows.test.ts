import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, ErrorMessages, failure } from "@/errors";
import { SPECIALTY_CODES } from "@/constants";
import { checkRateLimit, clearRateLimitCache } from "@/lib/api/rate-limit";
import type { RateLimitStatus } from "@/lib/api/rate-limit";

const hoisted = vi.hoisted(() => {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    in: vi.fn(),
    limit: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
  };
  const chain = Object.values(query) as ReturnType<typeof vi.fn>[];
  chain.forEach((fn) => fn.mockReturnValue(query));

  const from = vi.fn(() => query);
  return { query, chain, from };
});

vi.mock("@/lib/api/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  clearRateLimitCache: vi.fn(),
}));

vi.mock("@/supabase", () => ({
  supabase: {
    from: hoisted.from,
  },
}));

const mockCheckRateLimit = vi.mocked(checkRateLimit);
const mockClearRateLimitCache = vi.mocked(clearRateLimitCache);

describe("guarded consultations flows", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReset();
    mockClearRateLimitCache.mockReset();
    hoisted.from.mockClear();
    hoisted.chain.forEach((fn) => fn.mockClear());
  });

  const buildRateLimitFailure = () =>
    failure<RateLimitStatus>(new AppError(ErrorMessages.TOO_MANY_REQUESTS));

  it("blocks exports when the guard reports rate limit exceeded", async () => {
    mockCheckRateLimit.mockResolvedValueOnce(buildRateLimitFailure());

    const { getMGFConsultationsForExport } = await import(
      "@/lib/api/consultations"
    );
    const result = await getMGFConsultationsForExport("export-user");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.userMessage).toBe(ErrorMessages.TOO_MANY_REQUESTS);
    }

    expect(mockCheckRateLimit).toHaveBeenCalledWith("export", undefined, {
      force: true,
    });
    expect(mockClearRateLimitCache).not.toHaveBeenCalled();
    expect(hoisted.from).not.toHaveBeenCalled();
  });

  it("blocks imports when the guard reports rate limit exceeded", async () => {
    mockCheckRateLimit.mockResolvedValueOnce(buildRateLimitFailure());

    const { createConsultationsBatch } = await import(
      "@/lib/api/consultations"
    );
    const result = await createConsultationsBatch([{} as never]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.userMessage).toBe(ErrorMessages.TOO_MANY_REQUESTS);
    }

    expect(mockCheckRateLimit).toHaveBeenCalledWith("import", undefined, {
      force: true,
    });
    expect(mockClearRateLimitCache).not.toHaveBeenCalled();
    expect(hoisted.from).not.toHaveBeenCalled();
  });

  it("blocks reports when the guard reports rate limit exceeded", async () => {
    mockCheckRateLimit.mockResolvedValueOnce(buildRateLimitFailure());

    const { getReportData } = await import("@/lib/api/reports");
    const result = await getReportData({
      userId: "report-user",
      specialtyCode: SPECIALTY_CODES.MGF,
      reportKey: "year1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.userMessage).toBe(ErrorMessages.TOO_MANY_REQUESTS);
    }

    expect(mockCheckRateLimit).toHaveBeenCalledWith("report", undefined, {
      force: true,
    });
    expect(mockClearRateLimitCache).not.toHaveBeenCalled();
  });
});
