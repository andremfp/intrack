/**
 * Rate Limiting Edge Function
 *
 * This function provides rate limiting for high-risk operations in the Intrack application.
 * It uses a database-backed fixed-window counter approach for reliable distributed rate limiting.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  checkRateLimit,
  getRateLimitStatus,
  type SupabaseClient,
} from "./rate-limit.ts";
import {
  isValidOperationType,
  corsHeaders,
  createErrorResponse,
  createSuccessResponse,
} from "./utils.ts";
import type { RateLimitRequest } from "./types.ts";

function getRequiredEnv(name: string): string | undefined {
  const v = Deno.env.get(name);
  return v && v.length > 0 ? v : undefined;
}

export default {
  async fetch(request: Request): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // Only allow POST and GET methods
      if (request.method !== "POST" && request.method !== "GET") {
        return createErrorResponse(
          "METHOD_NOT_ALLOWED",
          "Method not allowed",
          405
        );
      }

      // Supabase injects these automatically for `supabase functions serve` and for deployed functions.
      const supabaseUrl = getRequiredEnv("SUPABASE_URL");
      const supabaseAnonKey = getRequiredEnv("SUPABASE_ANON_KEY");
      const supabaseServiceKey =
        getRequiredEnv("SERVICE_ROLE_KEY") ??
        getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

      console.log(
        "Environment check:",
        JSON.stringify({
          supabaseUrl: supabaseUrl ?? "MISSING",
          supabaseAnonKey: supabaseAnonKey ? "SET" : "MISSING",
          supabaseServiceKey: supabaseServiceKey ? "SET" : "MISSING",
          testUserId: Deno.env.get("TEST_USER_ID") ? "SET" : "MISSING",
        })
      );

      if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
        return createErrorResponse(
          "CONFIG_ERROR",
          "Missing required Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY). For local dev, Supabase injects `SUPABASE_SERVICE_ROLE_KEY`, so set whichever name you rely on via `supabase secrets set` or your shell.",
          500
        );
      }

      // Common local-dev pitfall: inside the Edge Runtime container, 127.0.0.1/localhost points
      // to the container itself (not your host machine), which will cause connection refused.
      if (
        supabaseUrl.includes("127.0.0.1") ||
        supabaseUrl.includes("localhost")
      ) {
        console.warn(
          "SUPABASE_URL points to localhost. If you're running `supabase functions serve`, the Edge Runtime runs in Docker; use `http://host.docker.internal:54321` (macOS/Windows) or an internal Docker hostname (e.g. `http://kong:8000`) instead."
        );
      }

      // Initialize two Supabase clients:
      // 1. Auth client for JWT validation
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // 2. Service client for database operations
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // Get user ID from authorization header
      const authHeader = request.headers.get("Authorization");

      let userId: string;

      if (!authHeader) {
        // For testing: allow requests without auth header by using a test user ID
        const testUserId = Deno.env.get("TEST_USER_ID");
        if (testUserId) {
          userId = testUserId;
        } else {
          return createErrorResponse(
            "UNAUTHORIZED",
            "Authorization header required",
            401
          );
        }
      } else {
        // Verify the JWT token and get user info
        const {
          data: { user },
          error: authError,
        } = await supabaseAuth.auth.getUser(authHeader.replace("Bearer ", ""));

        if (authError || !user) {
          console.warn("Auth getUser failed:", authError);
          return createErrorResponse(
            "UNAUTHORIZED",
            "Invalid or expired token",
            401
          );
        }

        userId = user.id;
      }

      if (request.method === "GET") {
        // GET request: Check rate limit status without incrementing counter
        const url = new URL(request.url);
        const operationType = url.searchParams.get("operation_type");

        if (!operationType || !isValidOperationType(operationType)) {
          return createErrorResponse(
            "INVALID_OPERATION",
            "Valid operation_type parameter required",
            400,
            { validOperations: ["import", "export", "report", "bulk_delete"] }
          );
        }

        const rateLimitSupabase = supabase as unknown as SupabaseClient;
        const status = await getRateLimitStatus(
          rateLimitSupabase,
          userId,
          operationType
        );
        console.log(
          "rate_limit.status",
          JSON.stringify({
            userId,
            operationType,
            remainingRequests: status.remainingRequests,
            resetTime: status.resetTime,
            allowed: status.allowed,
            source: "edge_function",
          })
        );
        return createSuccessResponse(status);
      } else if (request.method === "POST") {
        // POST request: Check and increment rate limit counter
        let requestBody: RateLimitRequest;

        try {
          requestBody = await request.json();
        } catch {
          return createErrorResponse(
            "INVALID_JSON",
            "Invalid JSON in request body",
            400
          );
        }

        // Validate request body
        const { operationType } = requestBody;

        if (!operationType || !isValidOperationType(operationType)) {
          return createErrorResponse(
            "INVALID_OPERATION",
            "Valid operation_type required in request body",
            400,
            { validOperations: ["import", "export", "report", "bulk_delete"] }
          );
        }

        // Check rate limit
        const rateLimitRequest = {
          userId,
          operationType,
          windowStart: requestBody.windowStart,
        };

        console.log(
          "rate_limit.check_request",
          JSON.stringify({
            userId,
            operationType,
            windowStart: requestBody.windowStart,
            method: "POST",
          })
        );

        const rateLimitSupabase = supabase as unknown as SupabaseClient;
        const result = await checkRateLimit(
          rateLimitSupabase,
          rateLimitRequest
        );

        console.log(
          "rate_limit.check_response",
          JSON.stringify({
            userId,
            operationType,
            allowed: result.allowed,
            remainingRequests: result.remainingRequests,
            resetTime: result.resetTime,
            retryAfter: result.retryAfter,
            source: "edge_function",
          })
        );

        if (!result.allowed) {
          // Rate limit exceeded
          console.warn(
            "rate_limit.block",
            JSON.stringify({
              userId,
              operationType,
              remainingRequests: result.remainingRequests,
              resetTime: result.resetTime,
              retryAfter: result.retryAfter,
              source: "edge_function",
            })
          );
          return createErrorResponse(
            "RATE_LIMIT_EXCEEDED",
            `Rate limit exceeded for ${operationType} operation`,
            429,
            {
              operationType,
              remainingRequests: result.remainingRequests,
              resetTime: result.resetTime,
              retryAfter: result.retryAfter,
            }
          );
        }

        // Rate limit check passed
        // The frontend expects `{ allowed, remainingRequests, resetTime, retryAfter? }`.
        return createSuccessResponse({
          allowed: true,
          remainingRequests: result.remainingRequests,
          resetTime: result.resetTime,
        });
      }

      // Should not reach here
      return createErrorResponse(
        "INTERNAL_ERROR",
        "Unexpected request handling",
        500
      );
    } catch (error) {
      console.error(
        "rate_limit.error",
        JSON.stringify({
          message: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : "Unknown",
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        })
      );

      return createErrorResponse(
        "INTERNAL_ERROR",
        "An unexpected error occurred",
        500,
        {
          error: error instanceof Error ? error.message : String(error),
          errorType: error instanceof Error ? error.name : typeof error,
          timestamp: new Date().toISOString(),
        }
      );
    }
  },
};

export { corsHeaders };
