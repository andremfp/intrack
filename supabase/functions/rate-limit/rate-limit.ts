/**
 * Core rate limiting logic
 */

import type {
  DatabaseRateLimitRecord,
  RateLimitRequest,
  RateLimitResponse,
  RateLimitOperation,
  RpcCheckRateLimitResult,
} from "./types.ts";
import {
  getRateLimitConfig,
  getCurrentWindowStart,
  getNextWindowReset,
  getSecondsUntilReset,
} from "./utils.ts";

type RateLimitQuery = {
  select(columns?: string): RateLimitQuery;
  eq(
    column: "user_id" | "operation_type" | "window_start",
    value: string
  ): RateLimitQuery;
  single(): Promise<{
    data: DatabaseRateLimitRecord | null;
    error: { code: string } | null;
  }>;
};

type RateLimitTable = {
  select(columns?: string): RateLimitQuery;
};

export interface SupabaseClient {
  from(table: "rate_limits"): RateLimitTable;
  rpc(
    fn: "check_and_increment_rate_limit",
    args: {
      p_user_id: string;
      p_operation_type: string;
      p_window_start: string;
      p_max_requests: number;
    }
  ): Promise<{ data: RpcCheckRateLimitResult[] | null; error: { code: string } | null }>;
}

/**
 * Check and update rate limit for a user operation
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  request: RateLimitRequest
): Promise<RateLimitResponse> {
  const { userId, operationType } = request;

  // Get configuration for this operation type
  const config = getRateLimitConfig(operationType);
  const windowStart =
    request.windowStart != null
      ? new Date(request.windowStart)
      : getCurrentWindowStart(config.windowMs);
  const windowStartStr = windowStart.toISOString();

  try {
    // Atomically increment the counter and check the limit in one DB round-trip,
    // eliminating the race condition of the old SELECT + UPSERT two-step.
    const { data, error } = await supabase.rpc(
      "check_and_increment_rate_limit",
      {
        p_user_id: userId,
        p_operation_type: operationType,
        p_window_start: windowStartStr,
        p_max_requests: config.maxRequests,
      }
    );

    if (error) {
      throw error;
    }

    // RPC returns a single-row TABLE result
    const result = data![0];
    const nextReset = getNextWindowReset(windowStart, config.windowMs);

    if (!result.allowed) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: nextReset.toISOString(),
        retryAfter: getSecondsUntilReset(nextReset),
      };
    }

    return {
      allowed: true,
      remainingRequests: Math.max(0, config.maxRequests - result.request_count),
      resetTime: nextReset.toISOString(),
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    throw error;
  }
}

/**
 * Get current rate limit status without incrementing the counter
 */
export async function getRateLimitStatus(
  supabase: SupabaseClient,
  userId: string,
  operationType: RateLimitOperation
): Promise<RateLimitResponse> {
  const config = getRateLimitConfig(operationType);
  const windowStart = getCurrentWindowStart(config.windowMs);
  const windowStartStr = windowStart.toISOString();

  try {
    const { data: existingRecord, error: selectError } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("user_id", userId)
      .eq("operation_type", operationType)
      .eq("window_start", windowStartStr)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      throw selectError;
    }

    const currentCount = existingRecord?.request_count ?? 0;
    const nextReset = getNextWindowReset(windowStart, config.windowMs);

    return {
      allowed: currentCount < config.maxRequests,
      remainingRequests: Math.max(0, config.maxRequests - currentCount),
      resetTime: nextReset.toISOString(),
    };
  } catch (error) {
    console.error("Rate limit status check error:", error);
    throw error;
  }
}
