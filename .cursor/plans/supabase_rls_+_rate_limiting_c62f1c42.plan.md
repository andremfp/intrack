---
name: Supabase RLS + Rate Limiting
overview: Implement the simplest Supabase hardening fixes for the flagged security issues (RLS, invoker view, hardened function) and then add a minimal, Free-tier-friendly rate limiting layer focused on high-risk operations.
todos:
  - id: rls-specialties
    content: Create migration enabling RLS on `public.specialties`, add authenticated-only SELECT policy, and tighten grants (no anon access).
    status: pending
  - id: view-security-invoker
    content: Create migration recreating `public.consultations_mgf` as SECURITY INVOKER (`WITH (security_invoker=true)`) and reduce grants to SELECT only where needed.
    status: pending
    dependencies:
      - rls-specialties
  - id: delete-user-search-path
    content: Create migration updating `public.delete_user()` to set a fixed `search_path` and restrict EXECUTE to authenticated users only.
    status: pending
  - id: rate-limit-high-risk
    content: Implement minimal rate limiting for high-risk operations (imports/exports/reports) using a DB-backed counter and an Edge Function wrapper.
    status: pending
    dependencies:
      - rls-specialties
      - view-security-invoker
      - delete-user-search-path
---

# Supabase RLS hardening + rate limiting (Free tier-first)

## Scope

- Address Supabase security warnings:
- `public.consultations_mgf` view flagged for definer-like behavior
- `public.specialties` exposed without RLS
- `public.delete_user()` `SECURITY DEFINER` function without fixed `search_path`
- Implement a minimal, layered rate limiting approach that keeps costs predictable on Supabase Free tier.

## Decisions (confirmed)

- `public.specialties` should be **authenticated-only** readable.
- Your project is **Postgres 15+**, so we can use the simplest view fix: **`security_invoker`**.

## Implementation plan

### 1) Fix `public.specialties` exposure (enable RLS + auth-only read)

- Update schema via a new migration under [`supabase/migrations/`](supabase/migrations/):
- `ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;`
- Add a minimal SELECT policy for authenticated users.
- Tighten grants:
    - Revoke all from `anon` (simplest, aligns with “auth-only”).
    - Ensure `authenticated` has `SELECT` only.

Files:

- [`supabase/migrations/`](supabase/migrations/)

### 2) Fix `public.consultations_mgf` view “SECURITY DEFINER” risk (make it SECURITY INVOKER)

- Create a migration to recreate the view with invoker behavior:
- `CREATE OR REPLACE VIEW ... WITH (security_invoker = true) AS ...`
- Ensure the view does **not** become a bypass around the base table’s RLS:
- Prefer `GRANT SELECT` only (avoid `GRANT ALL`).
- Confirm the frontend uses authenticated queries only.

Notes / doubt boundary:

- The exact behavior depends on Postgres/view settings and ownership; the safest standard approach on PG15+ is explicitly setting `security_invoker`. If anything in your project depends on the old behavior (unlikely for an app view), we’ll catch it by testing the main queries after the migration.

Files:

- [`supabase/migrations/`](supabase/migrations/)

### 3) Harden `public.delete_user()` (fixed `search_path` + least privilege execution)

- Create a migration that:
- Replaces the function with:
    - `SECURITY DEFINER`
    - `SET search_path = pg_catalog`
    - Fully-qualified references preserved (`auth.users`, `auth.uid()`)
- Tightens permissions:
    - `REVOKE ALL ON FUNCTION public.delete_user() FROM anon;`
    - `GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;`

Notes / doubt boundary:

- `pg_catalog` is appropriate because the function already schema-qualifies non-builtins; if the function later adds unqualified references (e.g. `delete from users`), the `search_path` choice must be revisited.

Files:

- [`supabase/migrations/`](supabase/migrations/)

### 4) Rate limiting: implement the smallest layered defense aligned with Free tier

#### 4.1 Frontend controls (cheap and immediate)

- Add/confirm:
- Debounce search inputs (300–500ms)
- Disable buttons while requests are in flight
- Throttle spammy actions (imports, exports, deletes)
- Cache read-heavy endpoints (if you already use a cache layer, keep it simple)

Files (likely):

- [`src/hooks/filters/use-data-fetching.ts`](src/hooks/filters/use-data-fetching.ts)
- [`src/hooks/consultations/use-consultations.ts`](src/hooks/consultations/use-consultations.ts)
- [`src/lib/api/`](src/lib/api/)

#### 4.2 Database-first “guardrails” (avoid accidental unbounded queries)

- Ensure queries always apply:
- `LIMIT`
- indexed filters where applicable
- “scoped by user” predicates (already true for `consultations` via RLS)

#### 4.3 Edge Function rate limit (only for high-risk operations)

- Add a small Edge Function wrapper for the most expensive / abusable operations (keep surface area small):
- bulk import
- report generation / exports
- any heavy aggregation queries
- Implement a simple DB-backed counter table (token bucket or fixed window) keyed by:
- `auth.uid()` primarily
- fallback: hashed IP for unauthenticated endpoints (you’re minimizing anon access, so this is likely rarely needed)

Notes / doubt boundary:

- Supabase has multiple ways to implement rate limiting; simplest + most portable is a DB-backed fixed-window counter. Token bucket is nicer, but fixed-window is easier to reason about and ship first.

Files:

- (New) `supabase/functions/<name>/index.ts` (exact naming depends on your conventions)
- (New) migration for rate limit table

### 5) Monitoring + success criteria

- Log / track:
- 429 counts (rate limit hits)
- Edge Function errors
- slow queries (where visible)
- Validate:
- authenticated reads still work
- `anon` can’t read `specialties`
- view respects base RLS
- `delete_user()` callable only by authenticated users

## Rollout order (lowest risk first)

1. `specialties` RLS + permissions
2. `delete_user()` hardening
3. `consultations_mgf` security_invoker + grants
4. Add rate limiting only to high-risk operations (avoid broad changes)