/**
 * Utility functions for rate limiting
 */

import type { RateLimitConfig, RateLimitOperation } from "./types.ts";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

/**
 * Get rate limit configuration for an operation type
 */
export function getRateLimitConfig(
  operationType: RateLimitOperation
): RateLimitConfig {
  const configs: Record<RateLimitOperation, RateLimitConfig> = {
    import: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
    export: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
    report: { maxRequests: 40, windowMs: 60 * 60 * 1000 }, // 40 per hour
    bulk_delete: { maxRequests: 10, windowMs: 5 * 60 * 1000 }, // 10 per 5 minutes
  };

  return configs[operationType];
}

/**
 * Calculate the start of the current rate limit window
 */
export function getCurrentWindowStart(windowMs: number): Date {
  const now = new Date();
  const windowStartMs = Math.floor(now.getTime() / windowMs) * windowMs;
  return new Date(windowStartMs);
}

/**
 * Calculate the next window reset time
 */
export function getNextWindowReset(windowStart: Date, windowMs: number): Date {
  return new Date(windowStart.getTime() + windowMs);
}

/**
 * Calculate seconds until next window reset
 */
export function getSecondsUntilReset(nextReset: Date): number {
  const now = new Date();
  return Math.ceil((nextReset.getTime() - now.getTime()) / 1000);
}

/**
 * Validate operation type
 */
export function isValidOperationType(
  operationType: string
): operationType is RateLimitOperation {
  const validOperations: RateLimitOperation[] = [
    "import",
    "export",
    "report",
    "bulk_delete",
  ];
  return validOperations.includes(operationType as RateLimitOperation);
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
) {
  return new Response(
    JSON.stringify({
      error: { code, message, details },
    }),
    {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

/**
 * Create standardized success response
 */
export function createSuccessResponse(data: unknown, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
