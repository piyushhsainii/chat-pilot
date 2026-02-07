-- Add optional avatar URL for bots (used in dashboard selectors + previews).

alter table if exists public.bots
add column if not exists avatar_url text;
