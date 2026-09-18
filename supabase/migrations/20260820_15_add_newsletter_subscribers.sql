-- Store newsletter subscriptions without exposing subscriber data publicly.

begin;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default extensions.uuid_generate_v4(),
  email text not null unique,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'UNSUBSCRIBED')),
  source text not null default 'FOOTER' check (source in ('FOOTER')),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_email_normalized
    check (email = lower(btrim(email)) and char_length(email) between 3 and 254)
);

create index if not exists newsletter_subscribers_subscribed_at_idx
  on public.newsletter_subscribers(subscribed_at desc);

alter table public.newsletter_subscribers enable row level security;

revoke all on table public.newsletter_subscribers from public, anon, authenticated;
grant all on table public.newsletter_subscribers to service_role;

commit;

-- Rollback (only before newsletter data is needed):
-- drop table public.newsletter_subscribers;
