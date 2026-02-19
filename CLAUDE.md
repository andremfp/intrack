# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InTrack is a Portuguese medical residency consultation tracking app for Family Medicine (MGF) residents. **The UI is intentionally in Portuguese** — all user-facing strings use official Portuguese health terminology.

## Architecture

**Stack:** React 19 + TypeScript + Vite (frontend), Supabase/PostgreSQL (backend), Vercel (hosting)

**Key directories:**

- `src/app/` — Page components (landing, login, register, dashboard, etc.)
- `src/components/` — UI components; `components/ui/` contains shadcn/ui primitives
- `src/hooks/` — Custom hooks organized by domain (consultations, filters, metrics, modals, reports, user)
- `src/lib/api/` — Supabase API client functions: `consultations.ts` (CRUD), `consultation-filters.ts` (filter logic), `consultation-metrics.ts` (metrics/aggregations), `users.ts`, `specialties.ts`, `reports.ts`, `rate-limit.ts`, `bulk-delete-rate-limit.ts`
- `src/lib/query/` — React Query configuration
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
  - `tests/setup.ts` — shared Vitest setup

**Database design:**

- `consultations` table stores all consultation data; specialty-specific fields live in a `details` JSONB column
- `consultations_mgf` is a Postgres view that denormalizes MGF-specific fields from the JSONB
- Row-Level Security (RLS) policies enforce per-user data isolation
- `rate_limits` table tracks API usage per user/operation with time windows

**Data flow:** React components → custom hooks → `src/lib/api/` functions → Supabase client (`src/supabase.ts`) → PostgreSQL

**Path alias:** `@/*` maps to `src/*`

**Key data files:** `src/constants.ts` (app-wide constants and field definitions), `src/icpc2-codes.ts` (ICPC-2 medical classification codes), `src/professions.ts` (professions list), `src/schema.ts` (auto-generated Supabase types — do not edit manually)

**Never read these files in full — they are large and auto-generated or static data:** `src/schema.ts`, `src/icpc2-codes.ts`, `src/professions.ts`, `package-lock.json`

## Git Workflow

**Branch flow:** `feature → staging → main` (production). Bump `package.json` version before PRing staging → main. CI runs build, lint, and tests on all PRs.

## Conventions

shadcn/ui (New York) + Tailwind CSS, TanStack Query (server state) + Table, Tabler Icons, Zod validation, Sonner toasts, TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`).
