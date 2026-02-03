-- Add per-bot connector scoping.
-- Run this in Supabase SQL editor.

alter table public.workspace_connectors
add column if not exists bot_ids uuid[] null;
