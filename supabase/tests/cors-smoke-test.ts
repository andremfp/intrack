/**
 * CORS preflight smoke test for the *deployed* rate-limit Edge Function.
 *
 * Unlike the unit tests, this runs against a real deployed function, so it
 * verifies the actual CORS_ALLOWED_ORIGINS secret (managed in the Supabase
 * dashboard) against the origins the app is actually served from. It is the
 * only test that catches a wrong/incomplete deployed secret — the failure
 * mode that shipped the apex-vs-www CORS bug to production.
 *
 * Required env:
 *   RATE_LIMIT_FUNCTION_URL  full URL of the deployed function
 *   EXPECTED_CORS_ORIGINS    comma-separated origins that MUST be allowed
 *
 * Run: deno test --allow-net --allow-env supabase/tests/cors-smoke-test.ts
 */

import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const FUNCTION_URL = requireEnv("RATE_LIMIT_FUNCTION_URL");
const EXPECTED_ORIGINS = requireEnv("EXPECTED_CORS_ORIGINS")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// A freshly deployed function can take a moment to start serving; retry on
// transient network errors before declaring CORS broken. A wrong header is a
// real config error and fails immediately (no retry) so the signal stays sharp.
async function preflight(origin: string, attempts = 5): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const res = await fetch(FUNCTION_URL, {
        method: "OPTIONS",
        headers: {
          Origin: origin,
          "Access-Control-Request-Method": "POST",
        },
      });
      await res.body?.cancel();
      return res;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw lastError;
}

for (const origin of EXPECTED_ORIGINS) {
  Deno.test(`CORS preflight allows ${origin}`, async () => {
    const res = await preflight(origin);
    assertEquals(res.status, 204);
    assertEquals(res.headers.get("Access-Control-Allow-Origin"), origin);
  });
}
