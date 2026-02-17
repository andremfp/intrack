# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InTrack is a Portuguese medical residency consultation tracking app for Family Medicine (MGF) residents. **The UI is intentionally in Portuguese** — all user-facing strings use official Portuguese health terminology.

## Commands

```bash
npm run dev                # Start Vite dev server
npm run build              # TypeScript check + Vite build
npm run lint               # ESLint
npm run test:unit          # Vitest (tests in tests/)
npm run test               # All tests (Deno rate-limit + Vitest)

# Supabase local dev (requires Docker)
npm run sb:local:start     # Start local Supabase (runs migrations automatically)
npm run sb:local:stop      # Stop local Supabase
npm run sb:local:db:redeploy              # Reset DB & replay all migrations
npm run sb:local:db:seed:users            # Seed test users
npm run sb:local:generate:schema          # Regenerate src/schema.ts from local DB
npm run sb:local:db:migration:new         # Create new migration file
npm run sb:local:functions:deploy         # Serve edge functions locally
```

Run a single test file: `npx vitest run tests/<file>.test.ts --config vitest.config.ts`

## Architecture

**Stack:** React 19 + TypeScript + Vite (frontend), Supabase/PostgreSQL (backend), Vercel (hosting)

**Key directories:**
- `src/app/` — Page components (landing, login, register, dashboard, etc.)
- `src/components/` — UI components; `components/ui/` contains shadcn/ui primitives
- `src/hooks/` — Custom hooks organized by domain (consultations, filters, metrics, modals, reports, user)
- `src/lib/api/` — Supabase API client functions (consultations CRUD, users, specialties, reports, rate limiting)
- `src/lib/query/` — React Query configuration
- `src/imports/` and `src/exports/` — Excel/CSV import and PDF/Excel export logic
- `src/reports/` — Report generation, with `reports/mgf/` for MGF-specific reports
- `supabase/migrations/` — PostgreSQL migration files
- `supabase/functions/` — Supabase Edge Functions (Deno-based)
- `tests/` — Vitest unit tests

**Database design:**
- `consultations` table stores all consultation data; specialty-specific fields live in a `details` JSONB column
- `consultations_mgf` is a Postgres view that denormalizes MGF-specific fields from the JSONB
- Row-Level Security (RLS) policies enforce per-user data isolation
- `rate_limits` table tracks API usage per user/operation with time windows

**Data flow:** React components → custom hooks → `src/lib/api/` functions → Supabase client (`src/supabase.ts`) → PostgreSQL

**Path alias:** `@/*` maps to `src/*`

**Key data files:** `src/constants.ts` (app-wide constants and field definitions), `src/icpc2-codes.ts` (ICPC-2 medical classification codes), `src/professions.ts` (professions list), `src/schema.ts` (auto-generated Supabase types — do not edit manually)

## Git Workflow

- **Branches:** `main` (production), `staging` (staging). Feature branches are created from `staging`.
- **PR flow:** feature branch → PR to `staging` → merge → bump version in `package.json` → PR from `staging` to `main`
- Merging to `main` triggers production deployment and creates a GitHub Release.
- CI runs build, lint, and tests on PRs to both `staging` and `main`.

## Conventions

- UI component library: shadcn/ui (New York style) with Radix UI primitives and Tailwind CSS
- State management: TanStack React Query for server state, React hooks for local state
- Table management: TanStack React Table
- Icons: Tabler Icons (`@tabler/icons-react`)
- Validation: Zod schemas
- Notifications: Sonner toasts
- TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters` enabled
