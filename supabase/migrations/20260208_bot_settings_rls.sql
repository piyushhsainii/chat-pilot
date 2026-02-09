-- bot_settings RLS policies
-- Allow authenticated bot owners to read/write their own bot settings.

alter table if exists public.bot_settings enable row level security;

drop policy if exists "bot_settings_select_owner" on public.bot_settings;
create policy "bot_settings_select_owner"
on public.bot_settings
for select
to authenticated
using (
  bot_id is not null
  and exists (
    select 1
    from public.bots b
    where b.id = bot_settings.bot_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "bot_settings_insert_owner" on public.bot_settings;
create policy "bot_settings_insert_owner"
on public.bot_settings
for insert
to authenticated
with check (
  bot_id is not null
  and exists (
    select 1
    from public.bots b
    where b.id = bot_settings.bot_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "bot_settings_update_owner" on public.bot_settings;
create policy "bot_settings_update_owner"
on public.bot_settings
for update
to authenticated
using (
  bot_id is not null
  and exists (
    select 1
    from public.bots b
    where b.id = bot_settings.bot_id
      and b.owner_id = auth.uid()
  )
)
with check (
  bot_id is not null
  and exists (
    select 1
    from public.bots b
    where b.id = bot_settings.bot_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "bot_settings_delete_owner" on public.bot_settings;
create policy "bot_settings_delete_owner"
on public.bot_settings
for delete
to authenticated
using (
  bot_id is not null
  and exists (
    select 1
    from public.bots b
    where b.id = bot_settings.bot_id
      and b.owner_id = auth.uid()
  )
);
