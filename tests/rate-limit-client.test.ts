import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { supabase } from "@/supabase";
import { ErrorMessages } from "@/errors";
import type { AuthError, Session } from "@supabase/supabase-js";
import type { RateLimitErrorDetails } from "@/lib/api/rate-limit";
import {
  checkRateLimit,
  getRateLimitStatus,
  clearRateLimitCache,
} from "@/lib/api/rate-limit";

import type { MockInstance } from "vitest";

type SupabaseAuthGetSessionResult = Promise<
  | { data: { session: Session }; error: null }
  | { data: { session: null }; error: AuthError }
  | { data: { session: null }; error: null }
>;

let mockGetSession: MockInstance<[], SupabaseAuthGetSessionResult>;

describe("rate-limit client", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.VITE_LOCAL_SUPABASE_URL = "http://localhost:54321";
    mockGetSession = vi.spyOn(supabase.auth, "getSession");
    const fakeSession: Session = {
      access_token: "token-123",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: "refresh-token",
      user: {
        id: "user-123",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        email: "test@example.com",
        role: "authenticated",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    mockGetSession = vi.spyOn(supabase.auth, "getSession") as MockInstance<
      [],
      SupabaseAuthGetSessionResult
    >;
    mockGetSession.mockResolvedValue({
      data: { session: fakeSession },
      error: null,
    });

    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    clearRateLimitCache();
  });

  afterEach(() => {
    mockGetSession.mockRestore();
    vi.restoreAllMocks();
    delete process.env.VITE_LOCAL_SUPABASE_URL;
  });

  it("calls the functions endpoint with POST and the access token", async () => {
    const payload = {
      allowed: true,
      remainingRequests: 9,
      resetTime: new Date().toISOString(),
    };
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    });

    const result = await checkRateLimit("import");

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0];
    expect(options?.method).toBe("POST");
    expect(options?.headers?.Authorization).toBe("Bearer token-123");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.remainingRequests).toBe(payload.remainingRequests);
    }
  });

  it("uses GET for status checks", async () => {
    const payload = {
      allowed: true,
      remainingRequests: 2,
      resetTime: new Date().toISOString(),
    };
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    });

    const result = await getRateLimitStatus("report");

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect((url as string).includes("operation_type=report")).toBe(true);
    expect(options?.method).toBe("GET");
  });

  it("surfaces rate limit errors from the edge function", async () => {
    const errorDetails: RateLimitErrorDetails = {
      operationType: "import",
      remainingRequests: 0,
      resetTime: new Date().toISOString(),
      retryAfter: 60,
    };
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          details: errorDetails,
        },
      }),
    });

    const result = await checkRateLimit("import");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.userMessage).toBe(ErrorMessages.TOO_MANY_REQUESTS);
      expect(result.error.details).toMatchObject({
        operationType: "import",
        remainingRequests: 0,
        retryAfter: 60,
      });
    } else {
      throw new Error("Expected rate limit check to fail");
    }
  });

  it("caches successful rate-limit responses", async () => {
    const payload = {
      allowed: true,
      remainingRequests: 2,
      resetTime: new Date().toISOString(),
    };
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    });

    await checkRateLimit("import");
    await checkRateLimit("import");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("resets the cached status when requested", async () => {
    const payload = {
      allowed: true,
      remainingRequests: 2,
      resetTime: new Date().toISOString(),
    };
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    });

    await checkRateLimit("import");
    clearRateLimitCache("import");

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    });

    await checkRateLimit("import");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("uses generic message for unexpected statuses", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => null,
    });

    const result = await checkRateLimit("export");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.userMessage).toBe(
        "Erro ao validar o limite de utilização."
      );
    } else {
      throw new Error("Expected server failure");
    }
  });

  it("fails when the user session is missing", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const result = await checkRateLimit("export");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.userMessage).toBe(ErrorMessages.AUTH_FAILED);
    } else {
      throw new Error("Expected auth failure");
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
