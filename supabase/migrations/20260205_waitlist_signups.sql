-- Waitlist signups
-- Apply with: supabase db push (or run in SQL editor)

create table if not exists public.waitlist_signups (
  email text not null,
  name text null,
  company text null,
  created_at timestamp with time zone not null default now(),
  constraint waitlist_signups_pkey primary key (email)
);

alter table public.waitlist_signups enable row level security;

-- Only allow server/admin writes (service role bypasses RLS). Prevent client-side updates/deletes.
drop policy if exists "waitlist_no_update" on public.waitlist_signups;
create policy "waitlist_no_update"
on public.waitlist_signups
for update
to anon, authenticated
using (false)
with check (false);

drop policy if exists "waitlist_no_delete" on public.waitlist_signups;
create policy "waitlist_no_delete"
on public.waitlist_signups
for delete
to anon, authenticated
using (false);
