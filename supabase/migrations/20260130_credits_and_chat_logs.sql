-- Credits + chat logging policies
-- Apply with: supabase db push (or run in SQL editor)

-- -----------------------------
-- user_credits
-- -----------------------------

create table if not exists public.user_credits (
  user_id uuid not null,
  balance integer not null default 0,
  alert_20_sent boolean null default false,
  alert_5_sent boolean null default false,
  updated_at timestamp with time zone null default now(),
  constraint user_credits_pkey primary key (user_id),
  constraint user_credits_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

alter table public.user_credits enable row level security;

drop policy if exists "user_credits_select_own" on public.user_credits;
create policy "user_credits_select_own"
on public.user_credits
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_credits_insert_own" on public.user_credits;
create policy "user_credits_insert_own"
on public.user_credits
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_credits_update_own" on public.user_credits;
create policy "user_credits_update_own"
on public.user_credits
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Trial credits on signup
create or replace function public.handle_new_user_credits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_credits (user_id, balance)
  values (new.id, 50)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_credits on auth.users;
create trigger on_auth_user_created_credits
after insert on auth.users
for each row execute function public.handle_new_user_credits();

-- -----------------------------
-- chat_logs
-- -----------------------------

alter table public.chat_logs enable row level security;

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

-- -----------------------------
-- chat_sessions (optional, but recommended)
-- -----------------------------

alter table public.chat_sessions enable row level security;

drop policy if exists "chat_sessions_insert_anon" on public.chat_sessions;
create policy "chat_sessions_insert_anon"
on public.chat_sessions
for insert
to anon
with check (is_anonymous = true and user_id is null);

drop policy if exists "chat_sessions_insert_auth" on public.chat_sessions;
create policy "chat_sessions_insert_auth"
on public.chat_sessions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "chat_sessions_select_owner" on public.chat_sessions;
create policy "chat_sessions_select_owner"
on public.chat_sessions
for select
to authenticated
using (
  exists (
    select 1
    from public.bots b
    where b.id = bot_id
      and b.owner_id = auth.uid()
  )
);
