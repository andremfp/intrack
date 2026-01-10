/**
 * Types for the rate limiting Edge Function
 */

export interface RateLimitRequest {
  userId: string;
  operationType: RateLimitOperation;
  windowStart?: string; // ISO date string, will default to current window
}

export interface RateLimitResponse {
  allowed: boolean;
  remainingRequests: number;
  resetTime: string; // ISO date string
  retryAfter?: number; // seconds until next window
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // window duration in milliseconds
}

export type RateLimitOperation =
  | 'import'
  | 'export'
  | 'report'
  | 'bulk_delete';

export interface DatabaseRateLimitRecord {
  id: string;
  user_id: string;
  operation_type: RateLimitOperation;
  window_start: string;
  request_count: number;
  created_at: string;
  updated_at: string;
}

export interface RateLimitError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
