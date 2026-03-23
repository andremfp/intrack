/**
 * Rate limit configuration per operation type.
 * Adjust limits here; changes take effect on next edge function deploy.
 */

import type { RateLimitConfig, RateLimitOperation } from "./types.ts";

export const RATE_LIMIT_CONFIGS: Record<RateLimitOperation, RateLimitConfig> =
  {
    import: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
    export: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
    report: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
    bulk_delete: { maxRequests: 10, windowMs: 5 * 60 * 1000 }, // 10 per 5 minutes
  };
