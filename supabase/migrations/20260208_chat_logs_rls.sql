-- chat_logs RLS policies
-- Goal:
-- - Allow anon/auth clients to insert logs (widget + API calls)
-- - Allow authenticated bot owners to read their own bots' logs

alter table if exists public.chat_logs enable row level security;

drop policy if exists "chat_logs_insert_any" on public.chat_logs;
create policy "chat_logs_insert_any"
on public.chat_logs
for insert
to anon, authenticated
with check (
  bot_id is not null
  and exists (select 1 from public.bots b where b.id = bot_id)
);

drop policy if exists "chat_logs_select_owner" on public.chat_logs;
create policy "chat_logs_select_owner"
on public.chat_logs
for select
to authenticated
using (
  bot_id is not null
  and exists (
    select 1
    from public.bots b
    where b.id = bot_id
      and b.owner_id = auth.uid()
  )
);
