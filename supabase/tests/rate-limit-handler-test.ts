/**
 * Tests for the rate-limit Edge Function HTTP handler (index.ts).
 * Covers all branch points: OPTIONS, invalid method, missing env, auth failures,
 * invalid operations, invalid JSON, 429 contract, and internal errors.
 *
 * Uses createRateLimitHandler with injected mock deps — no real network or
 * Supabase instance required.
 */

import {
  assertEquals,
  assert,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { createRateLimitHandler } from "../functions/rate-limit/index.ts";
import type { HandlerDeps } from "../functions/rate-limit/index.ts";
import type { DatabaseRateLimitRecord } from "../functions/rate-limit/types.ts";

// ── Env helpers ────────────────────────────────────────────────────────────────

const VALID_ENV: Record<string, string> = {
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
};

/** Returns all valid env vars plus any extras (e.g. TEST_USER_ID). */
function makeGetEnv(
  extra: Record<string, string> = {}
): (key: string) => string | undefined {
  const env = { ...VALID_ENV, ...extra };
  return (key) => env[key];
}

// ── Mock DB query chain ────────────────────────────────────────────────────────

type QuerySingleResult = {
  data: DatabaseRateLimitRecord | null;
  error: { code: string } | null;
};

type QueryChain = {
  select: (cols?: string) => QueryChain;
  eq: (col: string, val: string) => QueryChain;
  single: () => Promise<QuerySingleResult>;
  upsert: (
    data: unknown
  ) => { select: () => { single: () => Promise<{ data: unknown; error: null }> } };
};

// Minimal shape that satisfies the rate-limit.ts SupabaseClient interface.
function makeDbChain(
  record: DatabaseRateLimitRecord | null,
  shouldThrow = false
): QueryChain {
  const chain: QueryChain = {
    select: () => chain,
    eq: () => chain,
    single: () => {
      if (shouldThrow) throw new Error("Simulated DB error");
      return Promise.resolve({
        data: record,
        error: record ? null : { code: "PGRST116" },
      });
    },
    upsert: (data: unknown) => ({
      select: () => ({
        single: () => Promise.resolve({ data, error: null }),
      }),
    }),
  };
  return chain;
}

// ── Mock createClient factory ──────────────────────────────────────────────────

type MockGetUserResult =
  | { data: { user: { id: string } }; error: null }
  | { data: { user: null }; error: { message: string } };

function makeMockCreateClient(opts: {
  getUserResult?: MockGetUserResult;
  dbRecord?: DatabaseRateLimitRecord | null;
  throwOnDb?: boolean;
}): HandlerDeps["createClient"] {
  const getUserResult: MockGetUserResult = opts.getUserResult ?? {
    data: { user: { id: "handler-test-user" } },
    error: null,
  };

  const mockFn = (_url: string, key: string) => {
    if (key === VALID_ENV.SUPABASE_ANON_KEY) {
      // Auth client — only auth.getUser is used by the handler
      return {
        auth: {
          getUser: () => Promise.resolve(getUserResult),
        },
      };
    }
    // Service client — only from("rate_limits") is used by the handler
    const chain = makeDbChain(opts.dbRecord ?? null, opts.throwOnDb ?? false);
    return { from: () => chain };
  };

  return mockFn as unknown as HandlerDeps["createClient"];
}

// ── Request builder ────────────────────────────────────────────────────────────

function makeRequest(
  method: string,
  path = "/",
  opts: { body?: unknown; headers?: Record<string, string> } = {}
): Request {
  const url = `https://test.supabase.co/functions/v1/rate-limit${path}`;
  return new Request(url, {
    method,
    headers: new Headers(opts.headers ?? {}),
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

function parseErrorBody(
  response: Response
): Promise<{ error: { code: string } }> {
  return response.json();
}

// ── Tests ──────────────────────────────────────────────────────────────────────

Deno.test("handler: OPTIONS returns 204 with CORS headers", async () => {
  const handler = createRateLimitHandler({});
  const response = await handler.fetch(makeRequest("OPTIONS"));

  assertEquals(response.status, 204);
  assert(response.headers.get("Access-Control-Allow-Origin") !== null);
  assert(response.headers.get("Access-Control-Allow-Methods") !== null);
});

Deno.test("handler: invalid method (DELETE) returns 405 METHOD_NOT_ALLOWED", async () => {
  // Method check fires before env reads — no valid env needed
  const handler = createRateLimitHandler({ getEnv: makeGetEnv() });
  const response = await handler.fetch(makeRequest("DELETE"));

  assertEquals(response.status, 405);
  const body = await parseErrorBody(response);
  assertEquals(body.error.code, "METHOD_NOT_ALLOWED");
});

Deno.test("handler: missing env vars returns 500 CONFIG_ERROR", async () => {
  const handler = createRateLimitHandler({ getEnv: () => undefined });
  const response = await handler.fetch(makeRequest("POST"));

  assertEquals(response.status, 500);
  const body = await parseErrorBody(response);
  assertEquals(body.error.code, "CONFIG_ERROR");
});

Deno.test(
  "handler: no auth header and no TEST_USER_ID returns 401 UNAUTHORIZED",
  async () => {
    const handler = createRateLimitHandler({
      getEnv: makeGetEnv(), // no TEST_USER_ID
      createClient: makeMockCreateClient({}),
    });
    const response = await handler.fetch(makeRequest("POST"));

    assertEquals(response.status, 401);
    const body = await parseErrorBody(response);
    assertEquals(body.error.code, "UNAUTHORIZED");
  }
);

Deno.test("handler: invalid JWT returns 401 UNAUTHORIZED", async () => {
  // Auth header present → handler always validates JWT (ignores TEST_USER_ID)
  const handler = createRateLimitHandler({
    getEnv: makeGetEnv(),
    createClient: makeMockCreateClient({
      getUserResult: {
        data: { user: null },
        error: { message: "invalid token" },
      },
    }),
  });
  const response = await handler.fetch(
    makeRequest("POST", "/", {
      headers: { Authorization: "Bearer bad-token" },
    })
  );

  assertEquals(response.status, 401);
  const body = await parseErrorBody(response);
  assertEquals(body.error.code, "UNAUTHORIZED");
});

Deno.test(
  "handler: GET with missing operation_type returns 400 INVALID_OPERATION",
  async () => {
    const handler = createRateLimitHandler({
      getEnv: makeGetEnv({ TEST_USER_ID: "test-user" }),
      createClient: makeMockCreateClient({}),
    });
    // Empty string → url.searchParams.get returns "" which is falsy
    const response = await handler.fetch(
      makeRequest("GET", "?operation_type=")
    );

    assertEquals(response.status, 400);
    const body = await parseErrorBody(response);
    assertEquals(body.error.code, "INVALID_OPERATION");
  }
);

Deno.test(
  "handler: GET with invalid operation_type returns 400 INVALID_OPERATION",
  async () => {
    const handler = createRateLimitHandler({
      getEnv: makeGetEnv({ TEST_USER_ID: "test-user" }),
      createClient: makeMockCreateClient({}),
    });
    const response = await handler.fetch(
      makeRequest("GET", "?operation_type=invalid_op")
    );

    assertEquals(response.status, 400);
    const body = await parseErrorBody(response);
    assertEquals(body.error.code, "INVALID_OPERATION");
  }
);

Deno.test("handler: POST with invalid JSON returns 400 INVALID_JSON", async () => {
  const handler = createRateLimitHandler({
    getEnv: makeGetEnv({ TEST_USER_ID: "test-user" }),
    createClient: makeMockCreateClient({}),
  });
  const request = new Request(
    "https://test.supabase.co/functions/v1/rate-limit",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json{{",
    }
  );
  const response = await handler.fetch(request);

  assertEquals(response.status, 400);
  const body = await parseErrorBody(response);
  assertEquals(body.error.code, "INVALID_JSON");
});

Deno.test(
  "handler: POST with invalid operation_type returns 400 INVALID_OPERATION",
  async () => {
    const handler = createRateLimitHandler({
      getEnv: makeGetEnv({ TEST_USER_ID: "test-user" }),
      createClient: makeMockCreateClient({}),
    });
    const response = await handler.fetch(
      makeRequest("POST", "/", { body: { operationType: "unknown_op" } })
    );

    assertEquals(response.status, 400);
    const body = await parseErrorBody(response);
    assertEquals(body.error.code, "INVALID_OPERATION");
  }
);

Deno.test(
  "handler: POST 429 — body includes remainingRequests, resetTime, retryAfter",
  async () => {
    // import limit is 10/hour. A record with request_count: 10 triggers the 429 path.
    const now = new Date();
    const windowStart = new Date(
      Math.floor(now.getTime() / (60 * 60 * 1000)) * (60 * 60 * 1000)
    ).toISOString();

    const exhaustedRecord: DatabaseRateLimitRecord = {
      id: crypto.randomUUID(),
      user_id: "test-user",
      operation_type: "import",
      window_start: windowStart,
      request_count: 10,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const handler = createRateLimitHandler({
      getEnv: makeGetEnv({ TEST_USER_ID: "test-user" }),
      createClient: makeMockCreateClient({ dbRecord: exhaustedRecord }),
    });
    const response = await handler.fetch(
      makeRequest("POST", "/", { body: { operationType: "import" } })
    );

    assertEquals(response.status, 429);

    const body = await response.json() as {
      error: {
        code: string;
        details: {
          remainingRequests: number;
          resetTime: string;
          retryAfter: number;
        };
      };
    };
    assertEquals(body.error.code, "RATE_LIMIT_EXCEEDED");
    assertEquals(body.error.details.remainingRequests, 0);
    assert(typeof body.error.details.resetTime === "string");
    assert(typeof body.error.details.retryAfter === "number");
    assert(body.error.details.retryAfter > 0);
  }
);

Deno.test(
  "handler: unexpected DB error returns 500 INTERNAL_ERROR",
  async () => {
    const handler = createRateLimitHandler({
      getEnv: makeGetEnv({ TEST_USER_ID: "test-user" }),
      createClient: makeMockCreateClient({ throwOnDb: true }),
    });
    const response = await handler.fetch(
      makeRequest("POST", "/", { body: { operationType: "import" } })
    );

    assertEquals(response.status, 500);
    const body = await parseErrorBody(response);
    assertEquals(body.error.code, "INTERNAL_ERROR");
  }
);
