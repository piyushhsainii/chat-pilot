-- Optional per-connector tool instructions used to guide tool-calling.
-- Run this in Supabase SQL editor.

alter table public.workspace_connectors
add column if not exists tool_instructions text null;
