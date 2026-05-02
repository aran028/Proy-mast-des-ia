-- Chatbot RAG: pgvector + document catalog + embeddings store + retrieval function
-- Embedding dim 1536 (OpenAI text-embedding-3-small)

create extension if not exists vector;

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  filename text not null,
  mime_type text not null,
  size_bytes integer not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists document_embeddings (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('tool','playlist','video','document')),
  source_id text,
  document_id uuid references public.documents(id) on delete cascade,
  chunk_index integer not null default 0,
  content text not null,
  embedding vector(1536) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists document_embeddings_embedding_idx
  on document_embeddings using hnsw (embedding vector_cosine_ops);

create index if not exists document_embeddings_source_idx
  on document_embeddings (source_type, source_id);

create index if not exists document_embeddings_document_idx
  on document_embeddings (document_id);

create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  source_type text,
  source_id text,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    de.id,
    de.source_type,
    de.source_id,
    de.document_id,
    de.content,
    de.metadata,
    1 - (de.embedding <=> query_embedding) as similarity
  from document_embeddings de
  where 1 - (de.embedding <=> query_embedding) > match_threshold
  order by de.embedding <=> query_embedding
  limit match_count;
$$;

alter table documents enable row level security;
alter table document_embeddings enable row level security;

create policy "authenticated read documents"
  on documents for select
  to authenticated
  using (true);

create policy "authenticated read embeddings"
  on document_embeddings for select
  to authenticated
  using (true);
