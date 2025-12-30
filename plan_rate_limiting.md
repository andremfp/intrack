# PLAN A --- Rate Limiting & Abuse Control

React frontend + Supabase (Free tier)

## 0. Goals & Constraints

### Goals

- Prevent abuse of database, auth, and expensive queries
- Keep costs predictable on Supabase Free tier
- Avoid blocking legitimate users
- Keep the solution evolvable

### Constraints

- Supabase Free tier
- Public React SPA
- No custom WAF
- Edge Functions allowed

## 1. Threat Model

- Button spamming
- Excessive search queries
- Data scraping
- Accidental frontend loops

## 2. Layered Defense Strategy

1.  Frontend controls
2.  Supabase Auth + RLS
3.  Edge Functions
4.  Database safeguards
5.  Monitoring

## 3. Frontend-Level Controls

- Debounce searches (300--500ms)
- Throttle actions
- Cache reads (React Query)
- Disable UI during in-flight requests

## 4. Supabase Auth + RLS

- Require authentication by default
- Scope all queries by auth.uid()
- No unrestricted public tables

### 4.1 Security scanner findings (address these early)

The Supabase security lints you’re seeing are worth treating as “baseline hygiene” before adding more rate limiting layers.

#### 4.1.1 View `public.consultations_mgf` flagged as SECURITY DEFINER

**Why it matters**

- In newer Postgres versions, views can run with the **view owner’s privileges** by default (often summarized as “security definer-like” behavior). That can cause the view to enforce permissions/RLS of the **view owner** (e.g. `postgres`) rather than the querying user, which can unintentionally bypass RLS.

**Simplest standard fix (preferred): make the view SECURITY INVOKER**

- Recreate the view with a `security_invoker` option so it applies the querying user’s privileges/RLS.
- I’m not 100% certain which Postgres major version your Supabase project is on (this option requires **Postgres 15+**). If you’re on an older version, skip this and use the fallback below.

Example:

```sql
-- Postgres 15+ only
create or replace view public.consultations_mgf
with (security_invoker = true) as
select ...
;
```

**Fallback (if SECURITY INVOKER is not available)**

- **Don’t expose the view** through the public API surface. Options, from simplest to more involved:
  - Query the underlying table(s) with RLS directly (often simplest if it’s just a filter).
  - Move the view to a non-exposed schema (so PostgREST doesn’t serve it), and only access it from server-side code/Edge Functions using a trusted role.
  - Replace the view with an RPC/Edge Function that explicitly enforces auth + RLS-safe filters (more work).

**Also do**

- Avoid `GRANT ALL` on views; prefer `GRANT SELECT` only for the roles that need it.

#### 4.1.2 Table `public.specialties` is public, but RLS is not enabled

**Why it matters**

- Anything in `public` exposed via PostgREST without RLS is easy to accidentally over-expose.

**Simplest standard fix**

- Enable RLS on `public.specialties`.
- Add a minimal SELECT policy.
- Remove write privileges for client roles (even if your UI never calls writes, this is cheap defense-in-depth).

Decision point (pick one)

- If your unauthenticated flows need to read specialties (e.g. signup screens): allow `anon` SELECT.
- If not: restrict to `authenticated` only.

Example:

```sql
alter table public.specialties enable row level security;

-- Option A (public read): allow everyone to read, nobody to write
create policy specialties_read_all
on public.specialties
for select
using (true);

revoke insert, update, delete on table public.specialties from anon, authenticated;
grant select on table public.specialties to anon, authenticated;

-- Option B (auth-only read):
-- grant select on table public.specialties to authenticated;
-- revoke all on table public.specialties from anon;
```

#### 4.1.3 Function `public.delete_user` has a role-mutable `search_path`

**Why it matters**

- `SECURITY DEFINER` functions are sensitive: if `search_path` is not fixed, a caller might be able to influence name resolution (e.g. by shadowing objects in another schema). This is a common Postgres hardening rule.

**Simplest standard fix**

- Set a safe, explicit `search_path` on the function.
- Keep all object references schema-qualified (you already reference `auth.users` / `auth.uid()`).
- Restrict who can execute it (typically **authenticated only**, never `anon`).

Example:

```sql
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_user() from anon;
grant execute on function public.delete_user() to authenticated;
```

Notes / uncertainty

- The safest `search_path` value depends on what the function references. Because this function uses fully-qualified names, `pg_catalog` is usually sufficient; if you later add unqualified references, you must revisit this.

## 5. Edge Functions

### Responsibilities

- Authenticate
- Rate limit
- Validate input
- Execute DB logic

### Rate Limiting Options

- DB-backed counters (recommended)
- Token bucket
- IP-based fallback

## 6. Database Safeguards

- Enforce LIMITs
- Add defensive indexes
- Avoid unbounded queries

## 7. Monitoring & Escalation

- Observe logs and 429s
- Escalate via caching, tighter RLS, Edge Functions, or plan upgrade

## 8. Success Criteria

- Predictable request volume
- Graceful 429 handling
- No accidental floods
