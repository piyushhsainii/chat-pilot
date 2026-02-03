-- Documents table for vector-search knowledge.
-- Run this in your Supabase SQL editor if it's not already present.

create table public.documents (
  id uuid not null default gen_random_uuid (),
  bot_id uuid null,
  source_id uuid null,
  content text not null,
  embedding public.vector null,
  metadata jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  constraint documents_pkey primary key (id),
  constraint documents_bot_id_fkey foreign KEY (bot_id) references bots (id) on delete CASCADE,
  constraint documents_source_id_fkey foreign KEY (source_id) references knowledge_sources (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists documents_embedding_idx on public.documents using ivfflat (embedding vector_cosine_ops)
with
  (lists = '100') TABLESPACE pg_default;
