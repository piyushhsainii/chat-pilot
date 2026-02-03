-- Vector search function used by the app at query-time.
-- Run this in Supabase SQL editor.

create or replace function public.match_documents (
  match_count int,
  match_threshold float,
  p_bot_id uuid,
  query_embedding public.vector
)
returns table (
  content text,
  id uuid,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    d.content,
    d.id,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.documents d
  where d.bot_id = p_bot_id
    and d.embedding is not null
    and (1 - (d.embedding <=> query_embedding)) >= match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
$$;
