/**
 * Utility functions for rate limiting
 */

import type { RateLimitConfig, RateLimitOperation } from "./types.ts";
import { RATE_LIMIT_CONFIGS } from "./config.ts";

const PRODUCTION_ORIGIN = "https://intrack.pt";

export function getCorsHeaders(
  requestOrigin: string | null,
  allowedOrigins: string[]
): Record<string, string> {
  const origin =
    requestOrigin && allowedOrigins.includes(requestOrigin)
      ? requestOrigin
      : PRODUCTION_ORIGIN;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Vary": "Origin",
  };
}

/**
 * Get rate limit configuration for an operation type
 */
export function getRateLimitConfig(
  operationType: RateLimitOperation
): RateLimitConfig {
  return RATE_LIMIT_CONFIGS[operationType];
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
  corsHeaders: Record<string, string>,
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
export function createSuccessResponse(
  data: unknown,
  corsHeaders: Record<string, string>,
  status: number = 200
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
