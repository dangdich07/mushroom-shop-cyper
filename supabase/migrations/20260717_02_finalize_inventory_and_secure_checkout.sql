-- Phase B: finalize verified inventory and install privileged checkout RPCs.
-- Run only after every sellable product has a confirmed stock_quantity.

begin;

do $$
begin
  if exists (select 1 from public.products where stock_quantity is null) then
    raise exception 'INVENTORY_NOT_VERIFIED: products with NULL stock_quantity remain';
  end if;
end
$$;

alter table public.products alter column stock_quantity set default 0;
alter table public.products alter column stock_quantity set not null;
alter table public.products validate constraint products_stock_nonnegative;
alter table public.products validate constraint products_reserved_nonnegative;
alter table public.products validate constraint products_reserved_within_stock;

update public.products
set in_stock = (stock_quantity - reserved_quantity > 0);

create or replace function public.sync_product_stock_flag()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.in_stock := new.stock_quantity - new.reserved_quantity > 0;
  return new;
end;
$$;

drop trigger if exists products_sync_stock_flag on public.products;
create trigger products_sync_stock_flag
before insert or update on public.products
for each row execute function public.sync_product_stock_flag();

create or replace function public.transition_order_inventory(
  p_order_id text,
  p_transition text,
  p_reason text default null,
  p_actor_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error_code', 'ORDER_NOT_FOUND');
  end if;
  if v_order.status = 'DELIVERED' and p_transition in ('RELEASE', 'RESTOCK') then
    return jsonb_build_object('success', false, 'error_code', 'DELIVERED_ORDER_IS_TERMINAL');
  end if;

  if p_transition = 'COMMIT' then
    if v_order.inventory_status = 'COMMITTED' then
      return jsonb_build_object('success', true, 'inventory_status', 'COMMITTED', 'idempotent', true);
    end if;
    if v_order.inventory_status <> 'RESERVED' then
      return jsonb_build_object('success', false, 'error_code', 'INVALID_INVENTORY_TRANSITION');
    end if;

    for v_item in select product_id, quantity from public.order_items where order_id = p_order_id order by product_id
    loop
      update public.products
      set stock_quantity = stock_quantity - v_item.quantity,
          reserved_quantity = reserved_quantity - v_item.quantity
      where id = v_item.product_id
        and stock_quantity >= v_item.quantity
        and reserved_quantity >= v_item.quantity;
      if not found then
        raise exception 'INVENTORY_COMMIT_INVARIANT';
      end if;
    end loop;

    update public.orders set inventory_status = 'COMMITTED', inventory_expires_at = null where id = p_order_id;
    insert into public.inventory_events(order_id, event_type, reason, actor_id)
    values (p_order_id, 'COMMIT', p_reason, p_actor_id) on conflict (order_id, event_type) do nothing;
    return jsonb_build_object('success', true, 'inventory_status', 'COMMITTED');
  end if;

  if p_transition = 'RELEASE' then
    if v_order.inventory_status = 'RELEASED' then
      return jsonb_build_object('success', true, 'inventory_status', 'RELEASED', 'idempotent', true);
    end if;
    if v_order.inventory_status <> 'RESERVED' then
      return jsonb_build_object('success', false, 'error_code', 'INVALID_INVENTORY_TRANSITION');
    end if;

    for v_item in select product_id, quantity from public.order_items where order_id = p_order_id order by product_id
    loop
      update public.products
      set reserved_quantity = reserved_quantity - v_item.quantity
      where id = v_item.product_id and reserved_quantity >= v_item.quantity;
      if not found then
        raise exception 'INVENTORY_RELEASE_INVARIANT';
      end if;
    end loop;

    update public.orders set inventory_status = 'RELEASED', inventory_expires_at = null where id = p_order_id;
    insert into public.inventory_events(order_id, event_type, reason, actor_id)
    values (p_order_id, 'RELEASE', p_reason, p_actor_id) on conflict (order_id, event_type) do nothing;
    return jsonb_build_object('success', true, 'inventory_status', 'RELEASED');
  end if;

  if p_transition = 'RESTOCK' then
    if v_order.inventory_status = 'RESTOCKED' then
      return jsonb_build_object('success', true, 'inventory_status', 'RESTOCKED', 'idempotent', true);
    end if;
    if v_order.inventory_status <> 'COMMITTED' then
      return jsonb_build_object('success', false, 'error_code', 'INVALID_INVENTORY_TRANSITION');
    end if;

    for v_item in select product_id, quantity from public.order_items where order_id = p_order_id order by product_id
    loop
      update public.products set stock_quantity = stock_quantity + v_item.quantity where id = v_item.product_id;
      if not found then
        raise exception 'INVENTORY_RESTOCK_INVARIANT';
      end if;
    end loop;

    update public.orders set inventory_status = 'RESTOCKED', inventory_expires_at = null where id = p_order_id;
    insert into public.inventory_events(order_id, event_type, reason, actor_id)
    values (p_order_id, 'RESTOCK', p_reason, p_actor_id) on conflict (order_id, event_type) do nothing;
    return jsonb_build_object('success', true, 'inventory_status', 'RESTOCKED');
  end if;

  return jsonb_build_object('success', false, 'error_code', 'UNKNOWN_INVENTORY_TRANSITION');
end;
$$;

create or replace function public.create_secure_checkout(
  p_user_id uuid,
  p_idempotency_key uuid,
  p_request_hash text,
  p_items_json jsonb,
  p_shipping_name text,
  p_shipping_phone text,
  p_shipping_detail text,
  p_shipping_area text,
  p_payment_method text,
  p_voucher_code text,
  p_tracking_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_idem public.checkout_idempotency%rowtype;
  v_item jsonb;
  v_product public.products%rowtype;
  v_product_id text;
  v_quantity integer;
  v_seen text[] := array[]::text[];
  v_subtotal numeric(12,2) := 0;
  v_shipping_fee numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_grand_total numeric(12,2) := 0;
  v_voucher public.vouchers%rowtype;
  v_items jsonb := '[]'::jsonb;
  v_order_id text;
  v_reference_code text;
  v_qr_url text;
  v_expires_at timestamptz;
begin
  if not exists (select 1 from auth.users where id = p_user_id) then
    return jsonb_build_object('success', false, 'error_code', 'AUTH_REQUIRED');
  end if;
  if p_request_hash !~ '^[a-f0-9]{64}$' or p_tracking_token_hash !~ '^[a-f0-9]{64}$' then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_SECURITY_INPUT');
  end if;
  if jsonb_typeof(p_items_json) <> 'array' or jsonb_array_length(p_items_json) < 1 then
    return jsonb_build_object('success', false, 'error_code', 'EMPTY_CART');
  end if;

  insert into public.checkout_idempotency(user_id, idempotency_key, request_hash)
  values (p_user_id, p_idempotency_key, p_request_hash)
  on conflict (user_id, idempotency_key) do nothing;

  select * into v_idem from public.checkout_idempotency
  where user_id = p_user_id and idempotency_key = p_idempotency_key
  for update;

  if v_idem.request_hash <> p_request_hash then
    return jsonb_build_object('success', false, 'error_code', 'IDEMPOTENCY_CONFLICT');
  end if;
  if v_idem.status = 'COMPLETED' and v_idem.order_id is not null then
    return jsonb_build_object('success', true, 'order_id', v_idem.order_id, 'created', false);
  end if;

  update public.checkout_idempotency
  set status = 'PROCESSING', last_error_code = null, updated_at = now()
  where id = v_idem.id;

  for v_item in select value from jsonb_array_elements(p_items_json) order by value ->> 'product_id'
  loop
    v_product_id := nullif(btrim(v_item ->> 'product_id'), '');
    if v_product_id is null or coalesce(v_item ->> 'quantity', '') !~ '^[1-9][0-9]*$' then
      update public.checkout_idempotency set status='FAILED', last_error_code='INVALID_ITEM', updated_at=now() where id=v_idem.id;
      return jsonb_build_object('success', false, 'error_code', 'INVALID_ITEM');
    end if;
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity > 99 or v_product_id = any(v_seen) then
      update public.checkout_idempotency set status='FAILED', last_error_code='INVALID_ITEM', updated_at=now() where id=v_idem.id;
      return jsonb_build_object('success', false, 'error_code', 'INVALID_ITEM');
    end if;
    v_seen := array_append(v_seen, v_product_id);

    select * into v_product from public.products where id = v_product_id for update;
    if not found then
      update public.checkout_idempotency set status='FAILED', last_error_code='PRODUCT_UNAVAILABLE', updated_at=now() where id=v_idem.id;
      return jsonb_build_object('success', false, 'error_code', 'PRODUCT_UNAVAILABLE');
    end if;
    if v_product.stock_quantity is null then
      update public.checkout_idempotency set status='FAILED', last_error_code='INVENTORY_NOT_VERIFIED', updated_at=now() where id=v_idem.id;
      return jsonb_build_object('success', false, 'error_code', 'INVENTORY_NOT_VERIFIED');
    end if;
    if v_product.stock_quantity - v_product.reserved_quantity < v_quantity then
      update public.checkout_idempotency set status='FAILED', last_error_code='INSUFFICIENT_STOCK', updated_at=now() where id=v_idem.id;
      return jsonb_build_object('success', false, 'error_code', 'INSUFFICIENT_STOCK');
    end if;

    v_subtotal := v_subtotal + v_product.price * v_quantity;
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id, 'productId', v_product.id, 'name', v_product.name,
      'price', v_product.price, 'quantity', v_quantity, 'image', v_product.image, 'sku', v_product.sku
    ));
  end loop;

  if nullif(upper(btrim(coalesce(p_voucher_code, ''))), '') is not null then
    select * into v_voucher from public.vouchers
    where code = upper(btrim(p_voucher_code)) for share;
    if not found or not v_voucher.is_active or v_voucher.expiry_date < current_date
       or v_subtotal < v_voucher.min_subtotal then
      update public.checkout_idempotency set status='FAILED', last_error_code='VOUCHER_INVALID', updated_at=now() where id=v_idem.id;
      return jsonb_build_object('success', false, 'error_code', 'VOUCHER_INVALID');
    end if;
    if v_voucher.discount_type = 'PERCENT' then
      if v_voucher.discount_value > 100 then
        return jsonb_build_object('success', false, 'error_code', 'VOUCHER_INVALID');
      end if;
      v_discount := round(v_subtotal * v_voucher.discount_value / 100, 2);
    else
      v_discount := v_voucher.discount_value;
    end if;
    v_discount := least(v_discount, v_subtotal);
  end if;

  v_shipping_fee := case when v_subtotal > 2000000 then 0 else 35000 end;
  v_grand_total := greatest(0, v_subtotal - v_discount + v_shipping_fee);
  v_order_id := 'MUSH-' || to_char(clock_timestamp() at time zone 'Asia/Ho_Chi_Minh', 'YYYYMMDD') || '-' || encode(extensions.gen_random_bytes(8), 'hex');
  v_reference_code := 'MUSH ' || v_order_id;
  v_expires_at := now() + case when upper(p_payment_method) = 'COD' then interval '24 hours' else interval '15 minutes' end;

  insert into public.orders(
    id, user_id, items, subtotal, shipping_fee, discount, grand_total, status,
    payment_method, voucher_code, shipping_name, shipping_phone, shipping_detail,
    shipping_area, inventory_status, inventory_expires_at, idempotency_key,
    request_hash, tracking_token_hash
  ) values (
    v_order_id, p_user_id, v_items, v_subtotal, v_shipping_fee, v_discount, v_grand_total, 'PENDING',
    upper(p_payment_method)::public.payment_method, nullif(upper(btrim(coalesce(p_voucher_code,''))),''),
    btrim(p_shipping_name), btrim(p_shipping_phone), btrim(p_shipping_detail), p_shipping_area,
    'RESERVED', v_expires_at, p_idempotency_key, p_request_hash, decode(p_tracking_token_hash, 'hex')
  );

  for v_item in select value from jsonb_array_elements(v_items)
  loop
    insert into public.order_items(order_id, product_id, product_name, unit_price, quantity, image, sku)
    values (v_order_id, v_item->>'product_id', v_item->>'name', (v_item->>'price')::numeric,
            (v_item->>'quantity')::integer, v_item->>'image', v_item->>'sku');
    update public.products set reserved_quantity = reserved_quantity + (v_item->>'quantity')::integer
    where id = v_item->>'product_id';
  end loop;

  if upper(p_payment_method) = 'VIETQR' then
    select 'https://img.vietqr.io/image/' || bank_id || '-' || account_no || '-' || template ||
      '.png?amount=' || trunc(v_grand_total)::bigint::text || '&addInfo=' || replace(v_reference_code, ' ', '%20')
    into v_qr_url from public.payment_settings where id=true and enabled=true;
  end if;

  insert into public.payments(order_id, amount, method, status, qr_url, reference_code, expires_at)
  values (v_order_id, v_grand_total, upper(p_payment_method)::public.payment_method, 'PENDING', v_qr_url, v_reference_code, v_expires_at);
  insert into public.inventory_events(order_id, event_type, reason) values (v_order_id, 'RESERVE', 'CHECKOUT');
  insert into public.order_tracking(order_id, title, description, is_public)
  values (v_order_id, 'KHỞI TẠO ĐƠN HÀNG', 'Đơn hàng đã được ghi nhận và đang chờ xử lý.', true);

  update public.checkout_idempotency
  set order_id=v_order_id, status='COMPLETED', completed_at=now(), updated_at=now()
  where id=v_idem.id;

  return jsonb_build_object('success', true, 'order_id', v_order_id, 'created', true,
    'subtotal', v_subtotal, 'shipping_fee', v_shipping_fee, 'discount', v_discount,
    'grand_total', v_grand_total, 'expires_at', v_expires_at);
end;
$$;

create or replace function public.mark_payment_paid_atomic(
  p_provider_event_id text,
  p_payload_hash text,
  p_order_id text,
  p_amount numeric,
  p_gateway_transaction_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.payment_webhook_events%rowtype;
  v_order public.orders%rowtype;
  v_payment public.payments%rowtype;
  v_transition jsonb;
begin
  insert into public.payment_webhook_events(provider_event_id, payload_hash)
  values (p_provider_event_id, p_payload_hash)
  on conflict (provider_event_id) do nothing;
  select * into v_event from public.payment_webhook_events where provider_event_id=p_provider_event_id for update;
  if v_event.payload_hash <> p_payload_hash then
    return jsonb_build_object('success', false, 'error_code', 'WEBHOOK_IDEMPOTENCY_CONFLICT');
  end if;
  if v_event.status='COMPLETED' then
    return jsonb_build_object('success', true, 'idempotent', true);
  end if;

  select * into v_order from public.orders where id=p_order_id for update;
  if not found then
    update public.payment_webhook_events set status='REJECTED' where id=v_event.id;
    return jsonb_build_object('success', false, 'error_code', 'PAYMENT_REJECTED');
  end if;
  update public.payment_webhook_events set order_id=p_order_id where id=v_event.id;
  select * into v_payment from public.payments where order_id=p_order_id for update;
  if not found or p_amount < v_payment.amount then
    update public.payment_webhook_events set status='REJECTED' where id=v_event.id;
    return jsonb_build_object('success', false, 'error_code', 'PAYMENT_REJECTED');
  end if;
  if v_payment.status='PAID' then
    update public.payment_webhook_events set status='COMPLETED', completed_at=now() where id=v_event.id;
    return jsonb_build_object('success', true, 'idempotent', true);
  end if;
  if v_payment.expires_at <= now() then
    update public.payment_webhook_events set status='REJECTED' where id=v_event.id;
    return jsonb_build_object('success', false, 'error_code', 'PAYMENT_EXPIRED');
  end if;

  v_transition := public.transition_order_inventory(p_order_id, 'COMMIT', 'PAYMENT_PAID', null);
  if coalesce((v_transition->>'success')::boolean, false) = false then
    raise exception 'PAYMENT_INVENTORY_COMMIT_FAILED';
  end if;
  update public.payments set status='PAID', paid_at=now(), gateway_transaction_id=coalesce(p_gateway_transaction_id,gateway_transaction_id)
  where order_id=p_order_id;
  update public.orders set status='PROCESSING' where id=p_order_id;
  insert into public.order_tracking(order_id,title,description,is_public)
  values(p_order_id,'ĐÃ XÁC NHẬN THANH TOÁN','Thanh toán đã được xác nhận và đơn hàng đang được xử lý.',true);
  update public.payment_webhook_events set status='COMPLETED', completed_at=now() where id=v_event.id;
  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.process_expired_reservations(
  p_payment_method text,
  p_limit integer default 100
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order record;
  v_result jsonb;
  v_count integer := 0;
begin
  if upper(p_payment_method) not in ('VIETQR','COD') then raise exception 'INVALID_PAYMENT_METHOD'; end if;
  for v_order in
    select o.id from public.orders o
    join public.payments p on p.order_id=o.id
    where o.inventory_status='RESERVED' and o.inventory_expires_at <= now()
      and o.payment_method=upper(p_payment_method)::public.payment_method and p.status <> 'PAID'
    order by o.inventory_expires_at limit greatest(1,least(p_limit,500)) for update of o skip locked
  loop
    v_result := public.transition_order_inventory(v_order.id,'RELEASE','RESERVATION_EXPIRED',null);
    if coalesce((v_result->>'success')::boolean,false) then
      update public.payments set status='FAILED'
      where order_id=v_order.id and status in ('PENDING','WAITING');
      update public.orders set status='CANCELLED' where id=v_order.id;
      insert into public.order_tracking(order_id,title,description,is_public)
      values(v_order.id,'ĐƠN HÀNG ĐÃ HẾT HẠN','Thời gian giữ hàng đã kết thúc và tồn kho đã được hoàn lại.',true);
      v_count := v_count + 1;
    end if;
  end loop;
  return v_count;
end;
$$;

create or replace function public.cleanup_checkout_idempotency(p_limit integer default 500)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare v_count integer;
begin
  with doomed as (
    select id from public.checkout_idempotency
    where order_id is null and (
      (status='FAILED' and updated_at < now()-interval '24 hours') or
      (status='PROCESSING' and updated_at < now()-interval '1 hour')
    ) order by updated_at limit greatest(1,least(p_limit,5000))
  )
  delete from public.checkout_idempotency c using doomed d where c.id=d.id;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.admin_transition_order(
  p_order_id text,
  p_new_status text,
  p_actor_id uuid,
  p_restock boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_result jsonb;
  v_is_legacy boolean;
begin
  select * into v_order from public.orders where id=p_order_id for update;
  if not found then return jsonb_build_object('success',false,'error_code','ORDER_NOT_FOUND'); end if;
  if p_new_status not in ('PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED') then
    return jsonb_build_object('success',false,'error_code','INVALID_ORDER_STATUS');
  end if;
  -- DELIVERED is terminal. Returns/refunds require a separate future workflow;
  -- reject before any payment, inventory, order, or tracking mutation.
  if v_order.status='DELIVERED' then
    return jsonb_build_object('success',false,'error_code','DELIVERED_ORDER_IS_TERMINAL');
  end if;
  if v_order.status='CANCELLED' and p_new_status='CANCELLED' then
    update public.payments set status='FAILED'
    where order_id=p_order_id and status in ('PENDING','WAITING');
    return jsonb_build_object('success',true,'idempotent',true,'inventory_status',v_order.inventory_status);
  end if;

  v_is_legacy := v_order.inventory_status='NONE';
  if v_is_legacy then
    if p_restock then
      return jsonb_build_object('success',false,'error_code','LEGACY_ORDER_RESTOCK_FORBIDDEN');
    end if;
    if not (
      (v_order.status='PENDING' and p_new_status='PROCESSING') or
      (v_order.status='PROCESSING' and p_new_status='SHIPPED') or
      (v_order.status='SHIPPED' and p_new_status='DELIVERED') or
      (p_new_status='CANCELLED' and v_order.status <> 'DELIVERED')
    ) then
      return jsonb_build_object('success',false,'error_code','INVALID_LEGACY_ORDER_TRANSITION');
    end if;
  else
    if p_restock and not (p_new_status='CANCELLED' and v_order.inventory_status='COMMITTED') then
      return jsonb_build_object('success',false,'error_code','INVALID_RESTOCK_REQUEST');
    end if;
    if p_new_status in ('SHIPPED','DELIVERED') and v_order.inventory_status <> 'COMMITTED' then
      return jsonb_build_object('success',false,'error_code','INVENTORY_NOT_COMMITTED');
    end if;
    if p_new_status='PROCESSING' and v_order.payment_method <> 'COD'
       and v_order.inventory_status <> 'COMMITTED' then
      return jsonb_build_object('success',false,'error_code','PAYMENT_NOT_CONFIRMED');
    end if;
    if p_new_status='PROCESSING' and v_order.payment_method='COD'
       and v_order.inventory_status not in ('RESERVED','COMMITTED') then
      return jsonb_build_object('success',false,'error_code','RESERVATION_NOT_ACTIVE');
    end if;
    if p_new_status='PROCESSING' and v_order.payment_method='COD' and v_order.inventory_status='RESERVED' then
      v_result := public.transition_order_inventory(p_order_id,'COMMIT','ADMIN_CONFIRMED_COD',p_actor_id);
    elsif p_new_status='CANCELLED' and v_order.inventory_status='RESERVED' then
      v_result := public.transition_order_inventory(p_order_id,'RELEASE','ADMIN_CANCELLED',p_actor_id);
    elsif p_new_status='CANCELLED' and v_order.inventory_status='COMMITTED' and p_restock then
      v_result := public.transition_order_inventory(p_order_id,'RESTOCK','ADMIN_CANCELLED_RESTOCK',p_actor_id);
    end if;
  end if;
  if v_result is not null and coalesce((v_result->>'success')::boolean,false)=false then
    return v_result;
  end if;
  if p_new_status='DELIVERED' and v_order.payment_method='COD' then
    update public.payments set status='PAID', paid_at=coalesce(paid_at,now()) where order_id=p_order_id;
  end if;
  if p_new_status='CANCELLED' then
    update public.payments set status='FAILED'
    where order_id=p_order_id and status in ('PENDING','WAITING');
  end if;
  update public.orders set status=p_new_status::public.order_status where id=p_order_id;
  insert into public.order_tracking(order_id,title,description,actor_id,is_public)
  values(p_order_id,'CẬP NHẬT TRẠNG THÁI','Đơn hàng chuyển sang trạng thái '||p_new_status||'.',p_actor_id,true);
  return jsonb_build_object('success',true);
end;
$$;

create or replace function public.get_public_order_tracking(p_order_id text, p_tracking_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_order public.orders%rowtype; v_logs jsonb;
begin
  if p_tracking_token is null or char_length(p_tracking_token) > 200 then
    return jsonb_build_object('success',false,'error_code','TRACKING_NOT_FOUND');
  end if;
  select * into v_order from public.orders
  where id=btrim(p_order_id)
    and tracking_token_hash=extensions.digest(p_tracking_token,'sha256');
  if not found then return jsonb_build_object('success',false,'error_code','TRACKING_NOT_FOUND'); end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title,'description',description,'created_at',created_at)
    order by created_at desc),'[]'::jsonb) into v_logs
  from public.order_tracking where order_id=v_order.id and is_public=true;
  return jsonb_build_object('success',true,'order_id',v_order.id,'status',v_order.status,'logs',v_logs);
end;
$$;

-- DEPRECATED rollback-only RPC. No application caller is allowed to execute it.
revoke execute on function public.deploy_secure_checkout_transaction(
  text, text, numeric, numeric, numeric, numeric,
  text, text, text, text, text, jsonb, text
) from public, anon, authenticated, service_role;

drop policy if exists order_tracking_public_select on public.order_tracking;
drop policy if exists order_tracking_owner_or_admin_select on public.order_tracking;
create policy order_tracking_owner_or_admin_select on public.order_tracking for select to authenticated
using (exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())));

revoke select on public.order_tracking from anon;

revoke execute on function public.transition_order_inventory(text,text,text,uuid) from public,anon,authenticated;
revoke execute on function public.create_secure_checkout(uuid,uuid,text,jsonb,text,text,text,text,text,text,text) from public,anon,authenticated;
revoke execute on function public.mark_payment_paid_atomic(text,text,text,numeric,text) from public,anon,authenticated;
revoke execute on function public.process_expired_reservations(text,integer) from public,anon,authenticated;
revoke execute on function public.cleanup_checkout_idempotency(integer) from public,anon,authenticated;
revoke execute on function public.admin_transition_order(text,text,uuid,boolean) from public,anon,authenticated;
revoke execute on function public.get_public_order_tracking(text,text) from public,anon,authenticated;

grant execute on function public.transition_order_inventory(text,text,text,uuid) to service_role;
grant execute on function public.create_secure_checkout(uuid,uuid,text,jsonb,text,text,text,text,text,text,text) to service_role;
grant execute on function public.mark_payment_paid_atomic(text,text,text,numeric,text) to service_role;
grant execute on function public.process_expired_reservations(text,integer) to service_role;
grant execute on function public.cleanup_checkout_idempotency(integer) to service_role;
grant execute on function public.admin_transition_order(text,text,uuid,boolean) to service_role;
grant execute on function public.get_public_order_tracking(text,text) to anon,authenticated,service_role;

commit;

-- Manual local/test checks when Cron is unavailable:
-- select public.process_expired_reservations('VIETQR', 100);
-- select public.process_expired_reservations('COD', 100);
-- select public.cleanup_checkout_idempotency(500);

-- Rollback: stop checkout and expiry workers first. Do not drop inventory/event
-- data after orders exist. Restore previous RPC grants/code, reconcile RESERVED
-- orders through transition_order_inventory, then deploy a forward-fix migration.
