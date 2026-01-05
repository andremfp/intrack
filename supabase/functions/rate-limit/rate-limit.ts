/**
 * Core rate limiting logic
 */

import type {
  DatabaseRateLimitRecord,
  RateLimitRequest,
  RateLimitResponse,
  RateLimitOperation,
} from "./types.ts";
import {
  getRateLimitConfig,
  getCurrentWindowStart,
  getNextWindowReset,
  getSecondsUntilReset,
} from "./utils.ts";

type RateLimitTableUpsertData = Pick<
  DatabaseRateLimitRecord,
  "user_id" | "operation_type" | "window_start" | "request_count" | "updated_at"
>;

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
  upsert(
    values: RateLimitTableUpsertData,
    options: { onConflict: string }
  ): {
    select(): {
      single(): Promise<{ data: DatabaseRateLimitRecord | null; error: null }>;
    };
  };
};

type SupabaseClient = {
  from(table: "rate_limits"): RateLimitTable;
};

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
    // Check current request count in the database
    const { data: existingRecord, error: selectError } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("user_id", userId)
      .eq("operation_type", operationType)
      .eq("window_start", windowStartStr)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw selectError;
    }

    const currentCount = existingRecord?.request_count ?? 0;
    const newCount = currentCount + 1;

    // Check if limit exceeded
    if (currentCount >= config.maxRequests) {
      const nextReset = getNextWindowReset(windowStart, config.windowMs);
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: nextReset.toISOString(),
        retryAfter: getSecondsUntilReset(nextReset),
      };
    }

    // Update or insert the rate limit record
    const upsertData: RateLimitTableUpsertData = {
      user_id: userId,
      operation_type: operationType,
      window_start: windowStartStr,
      request_count: newCount,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("rate_limits")
      // IMPORTANT: PostgREST upserts match on the table's primary key by default.
      // Our table uses a surrogate `id` PK plus a composite UNIQUE constraint on
      // (user_id, operation_type, window_start). Without onConflict, repeated requests
      // will try to INSERT again and violate the unique constraint.
      .upsert(upsertData, {
        onConflict: "user_id,operation_type,window_start",
      })
      .select()
      .single();

    if (upsertError) {
      throw upsertError;
    }

    const nextReset = getNextWindowReset(windowStart, config.windowMs);

    return {
      allowed: true,
      remainingRequests: Math.max(0, config.maxRequests - newCount),
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
