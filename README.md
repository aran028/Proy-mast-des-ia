# Tools de IA - Proyecto final del Máster de Desarrollo de Aplicaciones con IA

Plataforma web para descubrir herramientas o tools de Inteligencia Artificial agrupadas por categorias o playlists. Los usuarios pueden explorar las herramientas y encontrar vídeos de youtube sobre muchas de ellas. Cada una de las herramientas cuentan con un enlace a la web oficial y una descripción.
Además la página dispone de un chatbot para resolver dudas sobre las herramientas. El administrador puede gestionar las playlists, tools y vídeos asociados a cada categoría a través de un panel de administración protegido por autenticación y autorización.


Proyecto desarrollado como trabajo final del Máster en Desarrollo de Aplicaciones con IA, aplicando **Clean Architecture**, **React Server Components** y buenas prácticas de ingeniería de software.

---

## Características principales

- **Exploración de herramientas**: búsqueda y filtrado de tools de IA organizadas por playlists.
- **Prácticas**: colección de guías y ejercicios prácticos asociados a herramientas y playlists.
- **Autenticación**: login y registro con Supabase Auth (email/contraseña + OAuth).
- **Panel de administración**: CRUD completo de playlists, tools y prácticas, protegido por rol `admin`.
- **Dashboard personal**: vista del contenido guardado por el usuario autenticado.

---

## Stack tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| Framework | Next.js 16 (App Router, RSC) |
| UI | React 19, Tailwind CSS v4, shadcn/ui, Lucide React |
| Base de datos | Supabase (PostgreSQL) con `@supabase/ssr` |
| Validación | Zod v4 |
| Package manager | pnpm 9 |
| Tests unitarios | Vitest v4 |
| Tests e2e | Playwright |
| CI | GitHub Actions |

---

## Arquitectura

El proyecto implementa **Clean Architecture** en un monolito modular. Las dependencias fluyen siempre hacia adentro:

```
presentation → application → domain
                    ↑
             infrastructure
```

```
src/
├── domain/           # Entidades, value objects, excepciones — sin dependencias externas
├── application/      # Use cases y puertos (interfaces de repositorios y servicios)
├── infrastructure/   # Implementaciones concretas: Supabase, factory de repositorios
├── presentation/     # Componentes React, hooks, páginas
└── shared/           # Tipos generados, constantes y utilidades transversales

app/                  # Rutas Next.js (App Router) — fuera de src/
├── (pages)/          # Páginas públicas: home, login, register,prompt-generator
├── dashboard/        # Dashboard del usuario autenticado
├── admin/            # Panel de administración (protegido por rol)
├── api/              # Route handlers REST
└── auth/callback/    # Callback OAuth de Supabase
```

### Decisiones de diseño destacadas

- **Repository pattern**: los use cases dependen de interfaces (`IPlaylistRepository`, `IToolRepository`, `IPracticeRepository`) definidas en `application/ports/`. La implementación concreta de Supabase vive en `infrastructure/`.
- **Factory de repositorios**: `src/infrastructure/config/repository.factory.ts` centraliza la instanciación del cliente Supabase y todos los repositorios para uso en server components y API routes.
- **Admin guard**: `src/infrastructure/config/admin.guard.ts` verifica la sesión activa y el rol `admin` en `profiles` antes de procesar cualquier ruta `/api/admin/*`.
- **Value Objects**: `Email`, `Url` y `Tag` encapsulan validación e invariantes del dominio en objetos inmutables.

---

## Instalación y puesta en marcha

### Prerrequisitos

- Node.js ≥ 20
- pnpm ≥ 9

### 1. Clonar el repositorio

```bash
git clone https://github.com/aran028/Proy-mast-des-ia.git
cd Proy-mast-des-ia
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crea un fichero `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=<tu-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-supabase-anon-key>
SUPABASE_PROJECT_ID=<tu-project-id>   # solo necesario para regenerar tipos
```

> Las credenciales se obtienen desde el panel de tu proyecto en [supabase.com](https://supabase.com).

### 4. Arrancar en desarrollo

```bash
pnpm dev
```

Accede a [http://localhost:3000](http://localhost:3000).

---

## Comandos disponibles

```bash
pnpm dev          # Servidor de desarrollo con hot-reload
pnpm build        # Build de producción
pnpm start        # Servidor de producción (requiere build previo)
pnpm lint         # Análisis estático con ESLint
pnpm tsc --noEmit # Verificación de tipos sin emitir ficheros
pnpm test:run     # Tests unitarios (ejecución única)
pnpm test         # Tests unitarios en modo watch
pnpm test:e2e     # Tests end-to-end con Playwright
pnpm db:types     # Regenerar tipos TypeScript desde el esquema de Supabase
```

Ejecutar un único fichero de test:

```bash
pnpm vitest run src/application/use-cases/playlist/__tests__/CreatePlaylistUseCase.test.ts
```

---

## Tests

El proyecto cuenta con **tests unitarios** para todos los use cases de la capa de aplicación y para las entidades de dominio, siguiendo el patrón de mock de interfaces:

```
src/
├── domain/entities/__tests__/          # Tests de entidades y validaciones
├── domain/value-objects/__tests__/     # Tests de value objects
└── application/use-cases/
    ├── playlist/__tests__/             # 5 use cases cubiertos
    ├── tool/__tests__/                 # 6 use cases cubiertos
    
```

---

## CI/CD

El pipeline de GitHub Actions se ejecuta en cada push y pull request a `main` con dos jobs en paralelo:

| Job | Pasos |
|-----|-------|
| **Lint & Type-check** | `tsc --noEmit`, `eslint`, `pnpm audit` |
| **Test** | `vitest run` |

