-- Phase A: additive structures for secure checkout and inventory.
-- Safe for an existing database: no production stock quantity is invented here.
-- Sellable products intentionally retain stock_quantity = NULL until an operator
-- supplies a verified physical count before Phase B.

begin;

-- Preflight only: never move/drop/recreate an extension in a production migration.
do $$
declare
  v_schema text;
begin
  select n.nspname into v_schema
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pgcrypto';

  if v_schema is null then
    raise exception 'PGCRYPTO_PREFLIGHT_FAILED: pgcrypto is not installed';
  end if;
  if v_schema <> 'extensions' then
    raise exception 'PGCRYPTO_PREFLIGHT_FAILED: pgcrypto must be installed in schema extensions (found %)', v_schema;
  end if;
end
$$;

do $$
begin
  create type public.inventory_status as enum ('NONE', 'RESERVED', 'COMMITTED', 'RELEASED', 'RESTOCKED');
exception when duplicate_object then null;
end
$$;

do $$
begin
  create type public.idempotency_status as enum ('PROCESSING', 'COMPLETED', 'FAILED');
exception when duplicate_object then null;
end
$$;

alter table public.products
  add column if not exists stock_quantity integer,
  add column if not exists reserved_quantity integer not null default 0;

update public.products
set stock_quantity = 0
where in_stock = false and stock_quantity is null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_stock_nonnegative') then
    alter table public.products
      add constraint products_stock_nonnegative
      check (stock_quantity is null or stock_quantity >= 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_reserved_nonnegative') then
    alter table public.products
      add constraint products_reserved_nonnegative
      check (reserved_quantity >= 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_reserved_within_stock') then
    alter table public.products
      add constraint products_reserved_within_stock
      check (stock_quantity is null or reserved_quantity <= stock_quantity) not valid;
  end if;
end
$$;

alter table public.orders
  add column if not exists inventory_status public.inventory_status not null default 'NONE',
  add column if not exists inventory_expires_at timestamptz,
  add column if not exists idempotency_key uuid,
  add column if not exists request_hash text,
  add column if not exists tracking_token_hash bytea;

create unique index if not exists orders_user_idempotency_key_uidx
  on public.orders(user_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists orders_inventory_expiry_idx
  on public.orders(inventory_expires_at)
  where inventory_status = 'RESERVED';

alter table public.order_tracking
  add column if not exists is_public boolean not null default true;

create table if not exists public.checkout_idempotency (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key uuid not null,
  request_hash text not null check (request_hash ~ '^[a-f0-9]{64}$'),
  order_id text references public.orders(id) on delete set null,
  status public.idempotency_status not null default 'PROCESSING',
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, idempotency_key)
);

create index if not exists checkout_idempotency_cleanup_idx
  on public.checkout_idempotency(status, updated_at);

create table if not exists public.inventory_events (
  id uuid primary key default extensions.uuid_generate_v4(),
  order_id text not null references public.orders(id) on delete cascade,
  event_type text not null check (event_type in ('RESERVE', 'COMMIT', 'RELEASE', 'RESTOCK')),
  reason text,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (order_id, event_type)
);

create table if not exists public.payment_webhook_events (
  id uuid primary key default extensions.uuid_generate_v4(),
  provider_event_id text not null unique,
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  order_id text references public.orders(id) on delete set null,
  status text not null default 'PROCESSING' check (status in ('PROCESSING', 'COMPLETED', 'REJECTED')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.checkout_idempotency enable row level security;
alter table public.inventory_events enable row level security;
alter table public.payment_webhook_events enable row level security;

revoke all on public.checkout_idempotency, public.inventory_events, public.payment_webhook_events
  from public, anon, authenticated;
grant all on public.checkout_idempotency, public.inventory_events, public.payment_webhook_events
  to service_role;

grant usage on type public.inventory_status, public.idempotency_status to service_role;

commit;

-- Pre-Phase-B checks (must return zero rows before finalization):
-- select id, sku, name from public.products where stock_quantity is null;
-- select id, sku from public.products where stock_quantity < 0
--   or reserved_quantity < 0 or reserved_quantity > stock_quantity;

-- Rollback note: before Phase B and before any reservations exist, the new
-- tables/columns may be removed. Once orders use inventory events, prefer a
-- forward fix and retain event data for reconciliation.
