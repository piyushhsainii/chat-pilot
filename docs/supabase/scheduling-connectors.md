# Scheduling connectors (Supabase)

This app stores scheduling credentials (Google Calendar OAuth refresh token OR Calendly API token + scheduling URL) in a Supabase table keyed by `workspace_id`.

## 1) Create table

Run this SQL in Supabase SQL editor:

```sql
create table if not exists public.workspace_connectors (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  provider text not null check (provider in ('google_calendar', 'calendly')),

  -- Google Calendar (OAuth)
  google_refresh_token text,
  google_access_token text,
  google_access_token_expires_at timestamptz,
  google_scopes text[],

  -- Calendly
  calendly_api_token text,
  calendly_scheduling_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint workspace_connectors_workspace_provider_unique unique (workspace_id, provider)
);

create index if not exists workspace_connectors_workspace_id_idx
  on public.workspace_connectors (workspace_id);

create index if not exists workspace_connectors_provider_idx
  on public.workspace_connectors (provider);
```

Notes:
- The Google Calendar connector primarily needs `google_refresh_token`. Access tokens are short-lived and can be rotated when needed.
- Calendly requires both `calendly_api_token` and `calendly_scheduling_url`.

## 2) Enable RLS + policies

Enable RLS:

```sql
alter table public.workspace_connectors enable row level security;
```

Policy: members of a workspace can read/write its connector rows.

```sql
create policy "workspace members can read connectors"
on public.workspace_connectors
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_users wu
    where wu.workspace_id = workspace_connectors.workspace_id
      and wu.auth_user_id = auth.uid()
  )
);

create policy "workspace members can upsert connectors"
on public.workspace_connectors
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspace_users wu
    where wu.workspace_id = workspace_connectors.workspace_id
      and wu.auth_user_id = auth.uid()
  )
);

create policy "workspace members can update connectors"
on public.workspace_connectors
for update
to authenticated
using (
  exists (
    select 1
    from public.workspace_users wu
    where wu.workspace_id = workspace_connectors.workspace_id
      and wu.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workspace_users wu
    where wu.workspace_id = workspace_connectors.workspace_id
      and wu.auth_user_id = auth.uid()
  )
);

create policy "workspace members can delete connectors"
on public.workspace_connectors
for delete
to authenticated
using (
  exists (
    select 1
    from public.workspace_users wu
    where wu.workspace_id = workspace_connectors.workspace_id
      and wu.auth_user_id = auth.uid()
  )
);
```

## 3) Google OAuth env vars

Add these env vars:

```bash
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=https://<your-domain>/api/connectors/google-calendar/callback
```

In Google Cloud Console:
- Create an OAuth 2.0 Client ID (Web application)
- Add `GOOGLE_OAUTH_REDIRECT_URI` as an authorized redirect URI
- Enable Google Calendar API for the project

## 4) (Optional) Update Supabase types

If you use typed tables, regenerate types:

```bash
npm run update:types
```
