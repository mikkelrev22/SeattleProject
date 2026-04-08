-- ─────────────────────────────────────────────────
-- Seattle 2026 — RAG / pgvector Schema
-- Run this in your Supabase SQL Editor AFTER supabase-schema.sql
-- ─────────────────────────────────────────────────

-- Enable pgvector
create extension if not exists vector with schema extensions;

-- ── Knowledge chunks table ────────────────────────
-- Each row is one chunk of content from the knowledge base.
-- Three vector columns let us compare embedding providers side-by-side.
create table if not exists public.knowledge_chunks (
  id          uuid primary key default uuid_generate_v4(),

  -- Source metadata
  source      text not null,              -- e.g. "seattle-guide.pdf", "fifa-faq"
  category    text not null,              -- e.g. "transport", "food", "tickets", "weather"
  title       text not null,              -- human-readable chunk title
  content     text not null,              -- the raw text chunk
  metadata    jsonb not null default '{}', -- extra info (page number, URL, etc.)

  -- Embedding columns — one per provider
  embedding_openai      vector(1536),     -- OpenAI text-embedding-3-small
  embedding_hf          vector(384),      -- HuggingFace all-MiniLM-L6-v2
  embedding_gte         vector(384),      -- Supabase / gte-small

  created_at  timestamptz not null default now()
);

-- ── Indexes for fast similarity search ────────────
-- Using ivfflat for each column (switch to hnsw if > 100k rows)
-- lists = 100 is a good default for < 50k rows
create index if not exists idx_chunks_embedding_openai
  on public.knowledge_chunks
  using ivfflat (embedding_openai vector_cosine_ops)
  with (lists = 100);

create index if not exists idx_chunks_embedding_hf
  on public.knowledge_chunks
  using ivfflat (embedding_hf vector_cosine_ops)
  with (lists = 100);

create index if not exists idx_chunks_embedding_gte
  on public.knowledge_chunks
  using ivfflat (embedding_gte vector_cosine_ops)
  with (lists = 100);

-- ── Similarity search functions ───────────────────
-- One function per provider. Returns top-K most similar chunks.

create or replace function match_chunks_openai(
  query_embedding vector(1536),
  match_count int default 5,
  match_threshold float default 0.7
)
returns table (
  id uuid,
  source text,
  category text,
  title text,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
    select
      kc.id, kc.source, kc.category, kc.title, kc.content, kc.metadata,
      1 - (kc.embedding_openai <=> query_embedding) as similarity
    from public.knowledge_chunks kc
    where kc.embedding_openai is not null
      and 1 - (kc.embedding_openai <=> query_embedding) > match_threshold
    order by kc.embedding_openai <=> query_embedding
    limit match_count;
end;
$$;

create or replace function match_chunks_hf(
  query_embedding vector(384),
  match_count int default 5,
  match_threshold float default 0.7
)
returns table (
  id uuid,
  source text,
  category text,
  title text,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
    select
      kc.id, kc.source, kc.category, kc.title, kc.content, kc.metadata,
      1 - (kc.embedding_hf <=> query_embedding) as similarity
    from public.knowledge_chunks kc
    where kc.embedding_hf is not null
      and 1 - (kc.embedding_hf <=> query_embedding) > match_threshold
    order by kc.embedding_hf <=> query_embedding
    limit match_count;
end;
$$;

create or replace function match_chunks_gte(
  query_embedding vector(384),
  match_count int default 5,
  match_threshold float default 0.7
)
returns table (
  id uuid,
  source text,
  category text,
  title text,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
    select
      kc.id, kc.source, kc.category, kc.title, kc.content, kc.metadata,
      1 - (kc.embedding_gte <=> query_embedding) as similarity
    from public.knowledge_chunks kc
    where kc.embedding_gte is not null
      and 1 - (kc.embedding_gte <=> query_embedding) > match_threshold
    order by kc.embedding_gte <=> query_embedding
    limit match_count;
end;
$$;

-- ── RLS (open read, admin write) ──────────────────
alter table public.knowledge_chunks enable row level security;

-- Anyone can read knowledge chunks (public knowledge base)
create policy "Public read access to knowledge chunks"
  on public.knowledge_chunks for select
  using (true);

-- Only service role can insert/update/delete (via ingestion script)
-- No insert/update/delete policies = blocked by default for anon/authenticated
