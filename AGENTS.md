# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

InTrack is a Portuguese medical residency consultation tracking app for Family Medicine (MGF) residents. **The UI is intentionally in Portuguese** — all user-facing strings use official Portuguese health terminology.

## Architecture

**Stack:** React 19 + TypeScript + Vite (frontend), Supabase/PostgreSQL (backend), Vercel (hosting)

**Key directories:**

- `src/app/` — Page components (landing, login, register, dashboard, forgot-password, reset-password)
- `src/components/` — UI components; `components/ui/` contains shadcn/ui primitives
- `src/hooks/` — Custom hooks organized by domain (consultations, filters, metrics, modals, reports, user, theme)
- `src/lib/api/` — Supabase API client functions: `consultations.ts` (CRUD), `consultation-filters.ts` (filter logic), `consultation-metrics.ts` (metrics/aggregations), `users.ts`, `specialties.ts`, `reports.ts`, `rate-limit.ts`, `bulk-delete-rate-limit.ts`, `helpers.ts`
- `src/lib/query/` — React Query configuration
- `src/utils/` — Shared utilities (`utils.ts`, `toasts.ts`, `tab-parsing.ts`, `user-cache.ts`)
- `src/imports/` and `src/exports/` — Excel/CSV import and PDF/Excel export logic
- `src/reports/` — Report generation, with `reports/mgf/` for MGF-specific reports
- `supabase/migrations/` — PostgreSQL migration files
- `supabase/functions/` — Supabase Edge Functions (Deno-based)
- `tests/` — Vitest unit tests
  - `tests/lib/api/` — API layer tests (consultations, filters, metrics, reports, specialties, users)
  - `tests/lib/query/` — React Query key and serialization tests
  - `tests/imports/` and `tests/exports/` — import/export helper and mapping tests
  - `tests/reports/` — report generation tests (including MGF-specific)
  - `tests/factories/` — test data factories
  - `tests/components/` — component smoke tests
  - `tests/hooks/` — hook tests
  - `tests/setup.ts` — shared Vitest setup
- `e2e/` — Playwright end-to-end tests

**Database design:**

- `consultations` table stores all consultation data; specialty-specific fields live in a `details` JSONB column
- `consultations_mgf` is a Postgres view that denormalizes MGF-specific fields from the JSONB
- Row-Level Security (RLS) policies enforce per-user data isolation
- `rate_limits` table tracks API usage per user/operation with time windows

**Data flow:** React components → custom hooks → `src/lib/api/` functions → Supabase client (`src/supabase.ts`) → PostgreSQL

**Path alias:** `@/*` maps to `src/*`

**Key data files:** `src/constants.ts` (app-wide constants and field definitions), `src/errors.ts` (app error types), `src/icpc2-codes.ts` (ICPC-2 medical classification codes), `src/professions.ts` (professions list), `src/schema.ts` (auto-generated Supabase types — do not edit manually)

**Never read these files in full — they are large and auto-generated or static data:** `src/schema.ts`, `src/icpc2-codes.ts`, `src/professions.ts`, `package-lock.json`

## Commands

- `npm run build` — build for production
- `npm run lint` — run ESLint
- `npm run test:unit` — run Vitest unit tests
- `npm run test:e2e` — run Playwright e2e tests
- `npm run test` — run all tests
- `npm run test:quiet` — same as `test`, printing failures only (agents)

## Git Workflow

**Branch flow:** `feature → staging → main` (production). Feature and Dependabot PRs into `staging` are squash-merged; `staging → main` is promoted with a **merge commit** (never squash), so `staging` stays an ancestor of `main` and needs no back-merge, and release notes list each PR. Bump `package.json` version on `staging` (`npm version patch|minor|major --no-git-tag-version`) after the last merge and before PRing `staging → main`; CI fails unless it is newer than `main`'s. CI runs build, lint, and tests on all PRs. Required checks: `test` (both branches) and `deploy-staging` (`main`); keep those job ids.

**Dependabot:** PRs target `staging`. `.github/workflows/dependabot-ready.yml` adds a `ready-to-merge` label and pings once when all checks are green (it only takes effect from `main`, the default branch); it never checks out PR code.

**Node.js:** pinned to a single major (`26.x`) in `package.json` `engines` and `.nvmrc` (used by CI). Vercel prefers `engines` over the dashboard setting, so an open range like `>=22` resolves to the newest runtime. The `@types/node` major must match too, and Dependabot ignores `@types/node` major bumps. Bump all of them together (`tests/config/node-version.test.ts` enforces it).

**Install scripts:** npm 11.20+ (bundled with Node 26) skips dependency install scripts unless listed in `package.json` `allowScripts`. `esbuild` and `fsevents` are denied (not needed). A new dependency with an install script fails `tests/config/install-scripts.test.ts` until you decide with `npm install-scripts approve|deny <pkg>`.

**Supabase CLI:** pinned to the same version in `ci.yml`, `staging.yml` and `production.yml` (never `latest`); `supabase/config.toml` must stay valid for that version. Bump all three together with the `supabase` devDependency. `tests/config/ci-workflow.test.ts` enforces that the pins equal the locked version. The CLI emits unformatted types, so `sb:local:generate:schema` pipes `src/schema.ts` through `oxfmt` (config in `.oxfmtrc.json`); CI's Verify Types step diffs the result against the committed file, so regenerate it (with the local stack running) whenever the CLI or the schema changes.

## Conventions

shadcn/ui (New York) + Tailwind CSS, TanStack Query (server state) + Table, Tabler Icons, Zod validation, Sonner toasts, TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`).
