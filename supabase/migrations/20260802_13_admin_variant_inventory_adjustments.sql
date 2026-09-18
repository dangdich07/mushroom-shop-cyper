-- Audited inventory adjustments for the admin product interface.
-- This migration never invents or backfills stock and does not alter existing rows.

begin;

create table if not exists public.inventory_adjustments (
  id uuid primary key default extensions.gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  product_id text not null references public.products(id) on delete restrict,
  previous_stock_quantity integer not null check (previous_stock_quantity >= 0),
  new_stock_quantity integer not null check (new_stock_quantity >= 0),
  quantity_delta integer not null,
  reserved_quantity_at_change integer not null check (reserved_quantity_at_change >= 0),
  reason text not null check (char_length(btrim(reason)) between 3 and 500),
  actor_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists inventory_adjustments_variant_created_idx
  on public.inventory_adjustments(variant_id, created_at desc);
create index if not exists inventory_adjustments_product_created_idx
  on public.inventory_adjustments(product_id, created_at desc);

alter table public.inventory_adjustments enable row level security;
revoke all on table public.inventory_adjustments from public, anon, authenticated;
grant select, insert on table public.inventory_adjustments to service_role;

create or replace function public.adjust_product_variant_inventory(
  p_variant_id uuid,
  p_new_stock_quantity integer,
  p_reason text,
  p_actor_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_variant public.product_variants%rowtype;
begin
  if p_new_stock_quantity is null or p_new_stock_quantity < 0
     or char_length(btrim(coalesce(p_reason, ''))) not between 3 and 500 then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_INVENTORY_ADJUSTMENT');
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = p_actor_id and p.role in ('admin', 'super_admin')
  ) then
    return jsonb_build_object('success', false, 'error_code', 'ADMIN_ACCESS_FORBIDDEN');
  end if;

  select * into v_variant
  from public.product_variants
  where id = p_variant_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error_code', 'VARIANT_NOT_FOUND');
  end if;
  if p_new_stock_quantity < v_variant.reserved_quantity then
    return jsonb_build_object('success', false, 'error_code', 'STOCK_BELOW_RESERVED');
  end if;
  if p_new_stock_quantity = v_variant.stock_quantity then
    return jsonb_build_object(
      'success', true,
      'idempotent', true,
      'stock_quantity', v_variant.stock_quantity,
      'reserved_quantity', v_variant.reserved_quantity
    );
  end if;

  update public.product_variants
  set stock_quantity = p_new_stock_quantity,
      updated_at = now()
  where id = p_variant_id;

  insert into public.inventory_adjustments(
    variant_id,
    product_id,
    previous_stock_quantity,
    new_stock_quantity,
    quantity_delta,
    reserved_quantity_at_change,
    reason,
    actor_id
  ) values (
    v_variant.id,
    v_variant.product_id,
    v_variant.stock_quantity,
    p_new_stock_quantity,
    p_new_stock_quantity - v_variant.stock_quantity,
    v_variant.reserved_quantity,
    btrim(p_reason),
    p_actor_id
  );

  return jsonb_build_object(
    'success', true,
    'stock_quantity', p_new_stock_quantity,
    'reserved_quantity', v_variant.reserved_quantity,
    'available_quantity', p_new_stock_quantity - v_variant.reserved_quantity
  );
end;
$$;

revoke execute on function public.adjust_product_variant_inventory(uuid, integer, text, uuid)
  from public, anon, authenticated;
grant execute on function public.adjust_product_variant_inventory(uuid, integer, text, uuid)
  to service_role;

commit;

-- Verification after running on the intended project:
-- select
--   has_function_privilege('anon', 'public.adjust_product_variant_inventory(uuid,integer,text,uuid)', 'EXECUTE') as anon_execute,
--   has_function_privilege('authenticated', 'public.adjust_product_variant_inventory(uuid,integer,text,uuid)', 'EXECUTE') as authenticated_execute,
--   has_function_privilege('service_role', 'public.adjust_product_variant_inventory(uuid,integer,text,uuid)', 'EXECUTE') as service_role_execute;
-- Expected: false, false, true.

-- Rollback only before this feature is used:
-- revoke execute on function public.adjust_product_variant_inventory(uuid,integer,text,uuid) from service_role;
-- drop function public.adjust_product_variant_inventory(uuid,integer,text,uuid);
-- drop table public.inventory_adjustments;
-- After adjustments exist, preserve the audit table and deploy a forward fix.
