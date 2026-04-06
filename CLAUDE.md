# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Key Architectural Details

### Path alias
`@/*` maps to `./src/*` (configured in tsconfig.json).

### App Router pages
Pages live in `app/` (project root, NOT `src/app/`). The `src/` directory contains only the Clean Architecture layers, not Next.js routing files.

### Repository pattern with factory
`src/infrastructure/config/repository.factory.ts` — `createRepositories()` creates a server-side Supabase client and returns all repository instances. Use this in server components and API routes instead of instantiating repositories directly.

### Admin guard
`src/infrastructure/config/admin.guard.ts` — `verifyAdmin()` checks Supabase auth + `profiles.role === 'admin'`. Used by all `/api/admin/*` routes.

### API routes
- Public: `app/api/playlists/`, `app/api/tools/`, `app/api/practices/`
- Admin CRUD: `app/api/admin/playlists/`, `app/api/admin/tools/`, `app/api/admin/practices/` (each with `[id]/route.ts` for single-resource operations)
- Auth: `app/api/auth/` (login, admin check/set), `app/auth/callback/` (OAuth callback)

### Port interfaces
Repository ports in `src/application/ports/repositories/` use Supabase's generated types (`Tables<'...'>`, `TablesInsert<'...'>`, `TablesUpdate<'...'>`) directly — they don't wrap them in domain entities for queries.

### Domain entities
Entities (`PlaylistEntity`, `ToolEntity`, `PracticeEntity`) use `create()` for validation of new data and constructor for hydrating persisted data. `DomainException` hierarchy in `src/domain/exceptions/`.

### Presentation hooks
Custom hooks (`usePlaylists`, `useTools`, `usePractices`, `useAuth`, `useIsAdmin`) in `src/presentation/hooks/` handle client-side data fetching and state.

## CI Pipeline

Runs on push/PR to `main`. Two parallel jobs:
1. **Lint & Type-check**: `pnpm tsc --noEmit` + `pnpm lint` + security audit
2. **Test**: `pnpm test:run`

Verify locally before pushing: `pnpm tsc --noEmit && pnpm lint && pnpm test:run`
