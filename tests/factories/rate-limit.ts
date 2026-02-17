import type { Session } from "@supabase/supabase-js";
import type { RateLimitStatus } from "@/lib/api/rate-limit";

// DatabaseRateLimitRecord shape (mirrors the Deno type without importing Deno modules)
export interface DatabaseRateLimitRecord {
  id: string;
  user_id: string;
  operation_type: "import" | "export" | "report" | "bulk_delete";
  window_start: string;
  request_count: number;
  created_at: string;
  updated_at: string;
}

export function makeRateLimitStatus(
  overrides: Partial<RateLimitStatus> = {}
): RateLimitStatus {
  return {
    allowed: true,
    remainingRequests: 9,
    resetTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

export function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    access_token: "test-access-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: "test-refresh-token",
    user: {
      id: "test-user-id",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      email: "test@example.com",
      role: "authenticated",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    ...overrides,
  };
}

export function makeDatabaseRecord(
  overrides: Partial<DatabaseRateLimitRecord> = {}
): DatabaseRateLimitRecord {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    user_id: "test-user-id",
    operation_type: "import",
    window_start: new Date(
      Math.floor(now.getTime() / (60 * 60 * 1000)) * (60 * 60 * 1000)
    ).toISOString(),
    request_count: 1,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    ...overrides,
  };
}
