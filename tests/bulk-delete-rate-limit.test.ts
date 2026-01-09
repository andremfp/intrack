import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError, ErrorMessages, failure } from "@/errors";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { ensureBulkDeleteAllowed } from "@/lib/api/bulk-delete-rate-limit";
import { toasts } from "@/utils/toasts";

vi.mock("@/lib/api/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("@/utils/toasts", () => ({
  toasts: {
    error: vi.fn(),
  },
}));

const mockCheckRateLimit = vi.mocked(checkRateLimit);
const mockToastError = vi.mocked(toasts.error);

describe("bulk delete rate limit helper", () => {
  beforeEach(() => {
    mockCheckRateLimit.mockReset();
    mockToastError.mockReset();
  });

  it("prevents deletes when the service reports rate limiting", async () => {
    mockCheckRateLimit.mockResolvedValueOnce(
      failure(new AppError(ErrorMessages.TOO_MANY_REQUESTS))
    );

    await expect(ensureBulkDeleteAllowed()).resolves.toBe(false);
    expect(mockToastError).toHaveBeenCalledWith(
      "Erro",
      ErrorMessages.TOO_MANY_REQUESTS
    );
  });

  it("prevents deletes when the limit is exhausted", async () => {
    mockCheckRateLimit.mockResolvedValueOnce({
      success: true,
      data: {
        allowed: false,
        remainingRequests: 0,
        resetTime: new Date().toISOString(),
      },
    });

    await expect(ensureBulkDeleteAllowed()).resolves.toBe(false);
    expect(mockToastError).toHaveBeenCalled();
  });

  it("permits the delete when the guard allows it", async () => {
    mockCheckRateLimit.mockResolvedValueOnce({
      success: true,
      data: {
        allowed: true,
        remainingRequests: 2,
        resetTime: new Date().toISOString(),
      },
    });

    await expect(ensureBulkDeleteAllowed()).resolves.toBe(true);
    expect(mockToastError).not.toHaveBeenCalled();
  });
});
