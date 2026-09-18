-- Loyalty wallet and server-authoritative promotion wheel.
-- No production points are backfilled or invented. Existing delivered orders
-- remain unchanged; only future transitions to DELIVERED earn points.

begin;

create table if not exists public.loyalty_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  points integer not null default 0 check (points >= 0),
  lifetime_earned integer not null default 0 check (lifetime_earned >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.loyalty_point_ledger (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null check (delta <> 0),
  balance_after integer not null check (balance_after >= 0),
  reason text not null check (reason in ('ORDER_DELIVERED', 'PROMOTION_SPIN')),
  source_ref text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, reason, source_ref)
);

create index if not exists loyalty_point_ledger_user_created_idx
  on public.loyalty_point_ledger(user_id, created_at desc);

create table if not exists public.promotion_spin_events (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key uuid not null,
  random_seed uuid not null default extensions.gen_random_uuid(),
  cost integer not null default 50 check (cost > 0),
  status text not null default 'PROCESSING'
    check (status in ('PROCESSING', 'COMPLETED', 'FAILED')),
  prize_code text references public.vouchers(code) on update cascade on delete set null,
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, idempotency_key)
);

create index if not exists promotion_spin_events_user_created_idx
  on public.promotion_spin_events(user_id, created_at desc);

create table if not exists public.user_promotion_rewards (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Keep the awarded code as an immutable snapshot so an administrator can
  -- retire a global voucher without deleting the user's reward history.
  voucher_code text not null check (
    voucher_code = upper(btrim(voucher_code))
    and char_length(voucher_code) between 2 and 50
  ),
  spin_id uuid not null unique references public.promotion_spin_events(id)
    on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists user_promotion_rewards_user_created_idx
  on public.user_promotion_rewards(user_id, created_at desc);

alter table public.loyalty_wallets enable row level security;
alter table public.loyalty_point_ledger enable row level security;
alter table public.promotion_spin_events enable row level security;
alter table public.user_promotion_rewards enable row level security;

drop policy if exists loyalty_wallets_owner_select on public.loyalty_wallets;
create policy loyalty_wallets_owner_select
on public.loyalty_wallets
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists loyalty_point_ledger_owner_select on public.loyalty_point_ledger;
create policy loyalty_point_ledger_owner_select
on public.loyalty_point_ledger
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists promotion_spin_events_owner_select on public.promotion_spin_events;
create policy promotion_spin_events_owner_select
on public.promotion_spin_events
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists user_promotion_rewards_owner_select on public.user_promotion_rewards;
create policy user_promotion_rewards_owner_select
on public.user_promotion_rewards
for select
to authenticated
using (user_id = auth.uid());

revoke all on public.loyalty_wallets,
  public.loyalty_point_ledger,
  public.promotion_spin_events,
  public.user_promotion_rewards
from public, anon, authenticated;

grant select on public.loyalty_wallets,
  public.loyalty_point_ledger,
  public.promotion_spin_events,
  public.user_promotion_rewards
to authenticated;

grant all on public.loyalty_wallets,
  public.loyalty_point_ledger,
  public.promotion_spin_events,
  public.user_promotion_rewards
to service_role;

create or replace function public.award_loyalty_points_on_delivery()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_points integer;
  v_balance integer;
begin
  if new.status <> 'DELIVERED'
     or old.status is not distinct from new.status then
    return new;
  end if;

  v_points := floor(new.grand_total / 10000)::integer;
  if v_points <= 0 then
    return new;
  end if;

  insert into public.loyalty_wallets(user_id)
  values (new.user_id)
  on conflict (user_id) do nothing;

  select points
  into v_balance
  from public.loyalty_wallets
  where user_id = new.user_id
  for update;

  if exists (
    select 1
    from public.loyalty_point_ledger
    where user_id = new.user_id
      and reason = 'ORDER_DELIVERED'
      and source_ref = new.id
  ) then
    return new;
  end if;

  v_balance := v_balance + v_points;

  update public.loyalty_wallets
  set
    points = v_balance,
    lifetime_earned = lifetime_earned + v_points,
    updated_at = now()
  where user_id = new.user_id;

  insert into public.loyalty_point_ledger(
    user_id,
    delta,
    balance_after,
    reason,
    source_ref,
    description
  )
  values (
    new.user_id,
    v_points,
    v_balance,
    'ORDER_DELIVERED',
    new.id,
    'Tích điểm từ đơn hàng đã giao'
  );

  return new;
end;
$$;

drop trigger if exists orders_award_loyalty_points on public.orders;
create trigger orders_award_loyalty_points
after update of status on public.orders
for each row
execute function public.award_loyalty_points_on_delivery();

create or replace function public.spin_promotion_wheel(
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_spin public.promotion_spin_events%rowtype;
  v_wallet public.loyalty_wallets%rowtype;
  v_voucher public.vouchers%rowtype;
  v_cost constant integer := 50;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object(
      'success', false,
      'error_code', 'AUTH_REQUIRED'
    );
  end if;

  if p_idempotency_key is null then
    return jsonb_build_object(
      'success', false,
      'error_code', 'INVALID_IDEMPOTENCY_KEY'
    );
  end if;

  insert into public.promotion_spin_events(
    user_id,
    idempotency_key,
    cost
  )
  values (
    v_user_id,
    p_idempotency_key,
    v_cost
  )
  on conflict (user_id, idempotency_key) do nothing;

  select *
  into v_spin
  from public.promotion_spin_events
  where user_id = v_user_id
    and idempotency_key = p_idempotency_key
  for update;

  if v_spin.status = 'COMPLETED' then
    select *
    into v_voucher
    from public.vouchers
    where code = v_spin.prize_code;

    select *
    into v_wallet
    from public.loyalty_wallets
    where user_id = v_user_id;

    return jsonb_build_object(
      'success', true,
      'idempotent', true,
      'spin_id', v_spin.id,
      'voucher_code', v_voucher.code,
      'discount_type', v_voucher.discount_type,
      'discount_value', v_voucher.discount_value,
      'description', v_voucher.description,
      'expiry_date', v_voucher.expiry_date,
      'points_balance', coalesce(v_wallet.points, 0)
    );
  end if;

  if v_spin.status = 'FAILED' then
    return jsonb_build_object(
      'success', false,
      'error_code', v_spin.error_code
    );
  end if;

  insert into public.loyalty_wallets(user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  select *
  into v_wallet
  from public.loyalty_wallets
  where user_id = v_user_id
  for update;

  if v_wallet.points < v_cost then
    update public.promotion_spin_events
    set
      status = 'FAILED',
      error_code = 'INSUFFICIENT_LOYALTY_POINTS',
      completed_at = now()
    where id = v_spin.id;

    return jsonb_build_object(
      'success', false,
      'error_code', 'INSUFFICIENT_LOYALTY_POINTS',
      'required_points', v_cost,
      'points_balance', v_wallet.points
    );
  end if;

  select *
  into v_voucher
  from public.vouchers
  where is_active = true
    and expiry_date >= current_date
  order by extensions.digest(
    code || v_spin.random_seed::text,
    'sha256'
  )
  limit 1
  for share;

  if not found then
    update public.promotion_spin_events
    set
      status = 'FAILED',
      error_code = 'NO_ACTIVE_PROMOTION_PRIZES',
      completed_at = now()
    where id = v_spin.id;

    return jsonb_build_object(
      'success', false,
      'error_code', 'NO_ACTIVE_PROMOTION_PRIZES'
    );
  end if;

  update public.loyalty_wallets
  set
    points = points - v_cost,
    updated_at = now()
  where user_id = v_user_id
    and points >= v_cost
  returning *
  into v_wallet;

  if not found then
    raise exception 'LOYALTY_WALLET_DEBIT_INVARIANT';
  end if;

  update public.promotion_spin_events
  set
    status = 'COMPLETED',
    prize_code = v_voucher.code,
    completed_at = now()
  where id = v_spin.id;

  insert into public.user_promotion_rewards(
    user_id,
    voucher_code,
    spin_id
  )
  values (
    v_user_id,
    v_voucher.code,
    v_spin.id
  );

  insert into public.loyalty_point_ledger(
    user_id,
    delta,
    balance_after,
    reason,
    source_ref,
    description
  )
  values (
    v_user_id,
    -v_cost,
    v_wallet.points,
    'PROMOTION_SPIN',
    v_spin.id::text,
    'Chi phí vòng quay voucher'
  );

  return jsonb_build_object(
    'success', true,
    'idempotent', false,
    'spin_id', v_spin.id,
    'voucher_code', v_voucher.code,
    'discount_type', v_voucher.discount_type,
    'discount_value', v_voucher.discount_value,
    'description', v_voucher.description,
    'expiry_date', v_voucher.expiry_date,
    'points_balance', v_wallet.points
  );
end;
$$;

revoke execute on function public.award_loyalty_points_on_delivery()
from public, anon, authenticated, service_role;

revoke execute on function public.spin_promotion_wheel(uuid)
from public, anon, authenticated, service_role;

grant execute on function public.spin_promotion_wheel(uuid)
to authenticated;

commit;

-- Test-project verification:
-- select has_function_privilege('anon','public.spin_promotion_wheel(uuid)','EXECUTE');
-- select has_function_privilege('authenticated','public.spin_promotion_wheel(uuid)','EXECUTE');
-- select user_id, points, lifetime_earned from public.loyalty_wallets;
--
-- Never seed loyalty points on production. On a dedicated test project only,
-- a verified test user may be credited manually to exercise concurrency.
--
-- Rollback: stop the Promotions deployment first, revoke spin RPC execution,
-- drop the order trigger and functions, then retain ledger/reward tables for
-- reconciliation. Prefer a forward fix after any production spin exists.
