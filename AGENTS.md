<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Overview

Monolito modular con Clean Architecture en Next.js 16 con React 19 y TypeScript.

## Stack

- **Framework**: Next.js 16 (App Router, RSC)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui (radix-nova), Lucide React
- **Base de datos**: Supabase (PostgreSQL) con `@supabase/ssr`
- **Validación**: Zod v4
- **Package manager**: pnpm
- **Tests unitarios**: Vitest v4 + Testing Library
- **Tests e2e**: Playwright
- **CI**: GitHub Actions (`.github/workflows/ci.yml`)

## Arquitectura

Clean Architecture en capas:

```
src/
├── domain/           # Entidades, value objects, eventos, excepciones (sin dependencias externas)
├── application/      # Use cases, puertos (interfaces), DTOs
├── infrastructure/   # Implementaciones concretas: Supabase, servicios externos
├── presentation/     # Componentes React, hooks, páginas
└── shared/           # Constantes, tipos y utilidades compartidas entre capas
```

La dependencia siempre fluye hacia adentro: `presentation → application → domain`. Infrastructure implementa los puertos definidos en application.

## Estructura de carpetas relevante

```
app/                            # Rutas Next.js (App Router) — fuera de src/
├── (pages)/                    # Páginas públicas: dashboard, login, register
├── admin/                      # Panel de administración (layout + subpáginas)
├── api/                        # Route handlers
│   ├── admin/                  # CRUD admin: playlists, tools, practices
│   ├── auth/                   # login, check-admin, set-admin
│   ├── playlists/
│   ├── tools/
│   ├── practices/
│   └── upload/
└── auth/callback/              # Callback OAuth de Supabase
```

```
src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── exceptions/
├── application/
│   ├── use-cases/
│   │   ├── playlist/
│   │   ├── practice/
│   │   └── tool/
│   ├── ports/
│   │   ├── repositories/
│   │   └── services/
│   └── dto/
├── infrastructure/
│   ├── database/
│   │   └── supabase/
│   │       ├── client.ts       # Cliente browser (@supabase/ssr)
│   │       ├── server.ts       # Cliente server (@supabase/ssr)
│   │       └── middleware.ts   # Refresh de sesión
│   ├── external/
│   └── config/
├── presentation/
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   ├── features/           # Componentes por feature
│   │   └── layout/
│   ├── hooks/
│   
└── shared/
    ├── types/
    │   └── database.types.ts   # Tipos generados por Supabase CLI (no editar manualmente)
    ├── constants/
    └── utils/
```

## Supabase

- Cliente browser: `src/infrastructure/database/supabase/client.ts`
- Cliente server: `src/infrastructure/database/supabase/server.ts`
- Middleware (refresh de sesión): `src/infrastructure/database/supabase/middleware.ts` — invocado desde `middleware.ts` en la raíz del proyecto
- Variables de entorno requeridas: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Regenerar tipos: `pnpm db:types` (requiere `SUPABASE_PROJECT_ID` en `.env.local`)

## Comandos

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm lint         # ESLint
pnpm tsc --noEmit # Type-check
pnpm test:run     # Tests unitarios (single run)
pnpm test:e2e     # Tests e2e con Playwright
pnpm db:types     # Regenerar tipos de Supabase
```

Ejecutar un único archivo de test: `pnpm vitest run src/domain/entities/__tests__/playlist.entity.test.ts`

## Convenciones

- Componentes shadcn en `src/presentation/components/ui/`
- Archivos generados automáticamente (como `database.types.ts`) no se editan manualmente
- Los use cases no importan directamente de infrastructure — usan puertos (interfaces)
- Nombrado en kebab-case para archivos, PascalCase para clases y componentes
- `.env.local` para variables de entorno locales (no commitear)
- Tests unitarios colocados en `__tests__/` dentro del mismo directorio del archivo bajo prueba
- Patrón de test para use cases:
  - El repositorio se mockea implementando su interfaz con `vi.fn()` para cada método
  - Usar `vi.useFakeTimers()` + `vi.setSystemTime()` en `beforeEach` cuando el use case genere `updated_at`; restaurar con `vi.useRealTimers()` en `afterEach`
  - Usar `vi.spyOn(Entity, 'create')` para verificar que la validación de entidad se delega correctamente
  - Siempre llamar `vi.clearAllMocks()` en `beforeEach`
- Las entidades de dominio exponen un método estático `create()` que valida los datos de entrada y lanza `Error` (o subclase de `DomainException`) ante datos inválidos; el constructor acepta datos ya validados/persistidos. **El constructor nunca debe llamarse directamente desde fuera del propio dominio.**
- Excepciones de dominio en `src/domain/exceptions/`: usar `DomainException` como base, con subclases tipadas (ej. `PlaylistNotFoundException`)
- Manejo de errores en presentación: los hooks cliente capturan errores de use cases/API y los exponen como estado local (`error: string | null`); los API routes responden con `NextResponse.json({ error: message }, { status: 4xx | 5xx })`; nunca dejar propagarse excepciones de dominio sin capturar hasta el cliente
