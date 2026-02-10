-- Store widget surface styles so the public embed can load them.

alter table if exists public.widgets
add column if not exists launcher_surface text;

alter table if exists public.widgets
add column if not exists panel_surface text;

-- Backfill defaults for existing rows.
update public.widgets
set launcher_surface = coalesce(launcher_surface, 'glass'),
    panel_surface = coalesce(panel_surface, 'solid')
where launcher_surface is null or panel_surface is null;
