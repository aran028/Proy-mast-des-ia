# Plan: Chatbot RAG para proy-mast-des-ia

## Contexto

El proyecto es un monolito modular en Next.js 16 con Clean Architecture que cataloga **playlists**, **tools** (más una tabla `videos` con clasificación IA). El objetivo es implantar un **chatbot RAG** que ayude a los usuarios autenticados a:
1. Descubrir/consultar el contenido del catálogo (tools, playlists, videos) en lenguaje natural.
2. Hacer Q&A sobre **documentos externos** subidos por admin (PDF/MD/texto).

### Decisiones cerradas
- **Embeddings**: OpenAI `text-embedding-3-small` (1536 dims, ~$0.02/1M tokens).
- **Generación**: Anthropic Claude (reutilizar `@anthropic-ai/sdk@0.65.0` ya instalado).
- **Vector store**: Supabase + `pgvector` (no infra externa nueva).
- **UI**: widget flotante global en páginas autenticadas.
- **Acceso**: sólo usuarios autenticados (verificar sesión Supabase en el route handler).
- **Streaming**: SSE vía Vercel AI SDK (`ai` package + `@ai-sdk/anthropic`) — integración nativa con Next.js App Router y React 19.

### Lo que ya existe a favor
- `@anthropic-ai/sdk@0.65.0` integrado en [src/infrastructure/external/anthropic/AnthropicPromptGeneratorService.ts](src/infrastructure/external/anthropic/AnthropicPromptGeneratorService.ts) con prompt caching — patrón a replicar.
- Patrón Repository → UseCase → API route consolidado. Factory en [src/infrastructure/config/repository.factory.ts](src/infrastructure/config/repository.factory.ts).
- Guard de admin en [src/infrastructure/config/admin.guard.ts](src/infrastructure/config/admin.guard.ts) — reutilizable para endpoints de indexación.
- shadcn/ui ya disponible (`input`, `scroll-area`, `button`, etc.).

## Implementación por fases

### Fase A — Infraestructura SQL (Supabase)

Crear `supabase/migrations/<timestamp>_chatbot_rag.sql`:

```sql
create extension if not exists vector;

-- Tabla principal de chunks indexados
create table document_embeddings (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('tool','playlist','video','document')),
  source_id text,                       -- id en tabla origen, null para 'document'
  document_id uuid references documents(id) on delete cascade,
  chunk_index int not null default 0,
  content text not null,
  embedding vector(1536) not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index on document_embeddings using hnsw (embedding vector_cosine_ops);
create index on document_embeddings (source_type, source_id);

-- Catálogo de documentos externos subidos por admin
create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  filename text not null,
  mime_type text not null,
  size_bytes int not null,
  uploaded_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Función de retrieval
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5
) returns table (
  id uuid, source_type text, source_id text, content text,
  metadata jsonb, similarity float
) language sql stable as $$
  select id, source_type, source_id, content, metadata,
         1 - (embedding <=> query_embedding) as similarity
  from document_embeddings
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- RLS: lectura sólo para autenticados; escritura sólo admin (vía service role en backend)
alter table document_embeddings enable row level security;
alter table documents enable row level security;
create policy "auth read embeddings" on document_embeddings for select to authenticated using (true);
create policy "auth read documents" on documents for select to authenticated using (true);
```

Tras aplicar, regenerar tipos: `pnpm db:types`.

### Fase B — Domain + Application (Clean Architecture)

**Domain** (`src/domain/`):
- `value-objects/chat-message.vo.ts` — `ChatMessage` con `role: 'user'|'assistant'|'system'` + `content: string`. Validación en `create()`.
- `value-objects/retrieved-chunk.vo.ts` — `RetrievedChunk { content, sourceType, sourceId, similarity, metadata }`.
- `exceptions/chat.exceptions.ts` — `EmbeddingFailedException`, `RetrievalFailedException`, `ChatGenerationException` extendiendo `DomainException`.

**Application — Ports** (`src/application/ports/`):
- `services/embedding.service.ts` — `IEmbeddingService { embed(text: string): Promise<number[]>; embedBatch(texts: string[]): Promise<number[][]> }`.
- `repositories/vector.repository.ts` — `IVectorRepository { search(embedding, threshold, count): Promise<RetrievedChunk[]>; upsert(rows: VectorRow[]): Promise<void>; deleteBySource(type, id): Promise<void> }`.
- `services/chat.service.ts` — `IChatService { stream(messages: ChatMessage[], context: string): AsyncIterable<string> }`.
- `repositories/document.repository.ts` — CRUD sobre tabla `documents`.

**Application — Use cases** (`src/application/use-cases/chat/`):
- `AskChatbotUseCase.ts` — orquesta: validar mensajes → embeber última pregunta → `vectorRepo.search()` → construir context block → `chatService.stream()`.
- `IndexCatalogUseCase.ts` — re-indexa todo el catálogo: lee tools/playlists/videos, genera texto canónico (`name + summary + tags` para tools, etc.), llama `embedBatch`, hace upsert.
- `IndexDocumentUseCase.ts` — recibe documento (texto extraído), lo trocea en chunks (~500 tokens, overlap 50), embebe, guarda en `document_embeddings` con `document_id`.
- `DeleteDocumentUseCase.ts` — borra documento y sus chunks (cascade SQL).

Tests unitarios siguiendo el patrón existente: mocks con `vi.fn()` por método, `vi.spyOn(ChatMessage, 'create')` para validar delegación, `vi.useFakeTimers()` si hace falta timestamp.

### Fase C — Infrastructure

- `src/infrastructure/external/openai/OpenAIEmbeddingService.ts` — implementa `IEmbeddingService` con SDK oficial `openai`. Modelo: `text-embedding-3-small`. Maneja rate limits con retries.
- `src/infrastructure/external/anthropic/AnthropicChatService.ts` — implementa `IChatService`. Reutiliza la configuración del modelo y prompt caching de `AnthropicPromptGeneratorService`. System prompt incluye instrucciones de citar fuentes y rechazar preguntas sin contexto.
- `src/infrastructure/database/repositories/Vector.repository.ts` — usa `supabase.rpc('match_documents', {...})` para search; `upsert` directo a `document_embeddings`.
- `src/infrastructure/database/repositories/Document.repository.ts` — CRUD sobre `documents`.
- `src/infrastructure/external/parsers/document-parser.ts` — extrae texto de PDF (lib `pdf-parse`) y MD/TXT (nativo). Pequeño, sin clase; función pura `extractText(buffer, mime)`.
- Registrar todo en [src/infrastructure/config/repository.factory.ts](src/infrastructure/config/repository.factory.ts) extendiendo el patrón de `getPromptGeneratorService()`.

### Fase D — API Routes

- `app/api/chat/route.ts` (POST) — verificar sesión Supabase → llamar `AskChatbotUseCase` → devolver `Response` con stream SSE compatible con Vercel AI SDK (`toDataStreamResponse()` o equivalente). Body: `{ messages: ChatMessage[] }`.
- `app/api/admin/documents/route.ts` (POST) — `verifyAdmin()` → recibe `multipart/form-data` → guarda metadata en `documents` → invoca `IndexDocumentUseCase`. GET lista documentos.
- `app/api/admin/documents/[id]/route.ts` (DELETE) — `verifyAdmin()` → `DeleteDocumentUseCase`.
- `app/api/admin/chat/reindex-catalog/route.ts` (POST) — `verifyAdmin()` → `IndexCatalogUseCase`. Operación pesada: ejecutar en background o con timeout extendido.

### Fase E — UI

- `src/presentation/hooks/useChat.ts` — wrapper sobre `useChat` de `@ai-sdk/react` apuntando a `/api/chat`. Expone `messages`, `input`, `handleSubmit`, `isLoading`, `error`.
- `src/presentation/components/features/chat/chat-widget.tsx` — burbuja flotante (bottom-right, `fixed`), expansible. Estado abierto/cerrado en localStorage.
- `src/presentation/components/features/chat/chat-message-list.tsx` — usa `ScrollArea` shadcn, muestra mensajes con avatar + markdown.
- `src/presentation/components/features/chat/chat-input.tsx` — textarea + botón enviar, Enter para enviar, Shift+Enter para nueva línea.
- Montar `<ChatWidget />` en el layout de páginas autenticadas (probablemente `app/(pages)/layout.tsx` o `app/dashboard/layout.tsx` — confirmar al implementar).
- Página admin `app/admin/documents/page.tsx` — UI para subir/listar/eliminar documentos + botón "Re-indexar catálogo".

### Fase F — Tests

- Unit: `AskChatbotUseCase`, `IndexCatalogUseCase`, `IndexDocumentUseCase` con mocks de los tres puertos. Verificar:
  - Errores se propagan como excepciones de dominio tipadas.
  - El contexto recuperado se incluye en el prompt.
  - Chunking respeta tamaño + overlap.
- Integración: API route `/api/chat` con Supabase auth mockeado.
- E2E (Playwright, opcional en este PR): widget abre, envía mensaje, recibe stream.

## Archivos críticos

**Nuevos**:
- `supabase/migrations/<timestamp>_chatbot_rag.sql`
- `src/domain/value-objects/chat-message.vo.ts`
- `src/domain/value-objects/retrieved-chunk.vo.ts`
- `src/domain/exceptions/chat.exceptions.ts`
- `src/application/ports/services/embedding.service.ts`
- `src/application/ports/services/chat.service.ts`
- `src/application/ports/repositories/vector.repository.ts`
- `src/application/ports/repositories/document.repository.ts`
- `src/application/use-cases/chat/{AskChatbotUseCase,IndexCatalogUseCase,IndexDocumentUseCase,DeleteDocumentUseCase}.ts` + tests
- `src/infrastructure/external/openai/OpenAIEmbeddingService.ts`
- `src/infrastructure/external/anthropic/AnthropicChatService.ts`
- `src/infrastructure/external/parsers/document-parser.ts`
- `src/infrastructure/database/repositories/{Vector,Document}.repository.ts`
- `app/api/chat/route.ts`
- `app/api/admin/documents/route.ts` + `[id]/route.ts`
- `app/api/admin/chat/reindex-catalog/route.ts`
- `app/admin/documents/page.tsx`
- `src/presentation/hooks/useChat.ts`
- `src/presentation/components/features/chat/{chat-widget,chat-message-list,chat-input}.tsx`

**Modificados**:
- [src/infrastructure/config/repository.factory.ts](src/infrastructure/config/repository.factory.ts) — registrar embedding service, chat service, vector repo, document repo.
- [package.json](package.json) — añadir `openai`, `ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`, `pdf-parse`.
- `app/(pages)/layout.tsx` (o equivalente autenticado) — montar `<ChatWidget />`.
- `.env.local` y `.env.example` — añadir `OPENAI_API_KEY` (ya existe `ANTHROPIC_API_KEY`).
- [src/shared/types/database.types.ts](src/shared/types/database.types.ts) — regenerado con `pnpm db:types` tras la migración.

## Orden de ejecución sugerido

1. Migración SQL + `pnpm db:types`.
2. Domain (VOs + excepciones).
3. Ports en application.
4. Infrastructure: `OpenAIEmbeddingService`, `Vector.repository`, `AnthropicChatService`, parsers.
5. Use cases + tests unitarios.
6. Registrar en factory.
7. API routes (`/api/chat` primero, luego admin).
8. UI: hook + widget.
9. Página admin de documentos.
10. Verificación end-to-end.

## Verificación end-to-end

1. `pnpm tsc --noEmit && pnpm lint && pnpm test:run` pasan en local.
2. Migración aplicada en Supabase: `select * from pg_extension where extname='vector';` devuelve fila.
3. POST `/api/admin/chat/reindex-catalog` → `select count(*) from document_embeddings where source_type='tool';` > 0.
4. Subir un PDF de prueba en `/admin/documents` → verificar fila en `documents` y chunks en `document_embeddings`.
5. `pnpm dev` → login → abrir widget flotante → preguntar "¿qué herramientas hay para diseño?" → respuesta cita tools reales.
6. Pregunta sobre el PDF subido → respuesta cita el documento.
7. Pregunta fuera de dominio ("¿quién ganó el mundial 2022?") → el bot responde que no tiene contexto.
8. DevTools → Network → `/api/chat` aparece como `text/event-stream` con chunks progresivos.
9. Logout → widget no aparece; intento directo a `/api/chat` devuelve 401.
