-- P1 variant-aware inventory transitions and checkout.
-- Requires 20260725_06_product_variants.sql.
begin;

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
  select * into v_order
  from public.orders where id=p_order_id for update;
  if not found then
    return jsonb_build_object('success',false,'error_code','ORDER_NOT_FOUND');
  end if;
  if v_order.status='DELIVERED' and p_transition in ('RELEASE','RESTOCK') then
    return jsonb_build_object('success',false,'error_code','DELIVERED_ORDER_IS_TERMINAL');
  end if;

  if p_transition='COMMIT' then
    if v_order.inventory_status='COMMITTED' then
      return jsonb_build_object('success',true,'inventory_status','COMMITTED','idempotent',true);
    end if;
    if v_order.inventory_status<>'RESERVED' then
      return jsonb_build_object('success',false,'error_code','INVALID_INVENTORY_TRANSITION');
    end if;
    for v_item in
      select variant_id,quantity from public.order_items
      where order_id=p_order_id order by variant_id
    loop
      if v_item.variant_id is null then raise exception 'VARIANT_LINK_MISSING'; end if;
      update public.product_variants
      set stock_quantity=stock_quantity-v_item.quantity,
          reserved_quantity=reserved_quantity-v_item.quantity,
          updated_at=now()
      where id=v_item.variant_id
        and stock_quantity>=v_item.quantity
        and reserved_quantity>=v_item.quantity;
      if not found then raise exception 'INVENTORY_COMMIT_INVARIANT'; end if;
    end loop;
    update public.orders
    set inventory_status='COMMITTED',inventory_expires_at=null
    where id=p_order_id;
    insert into public.inventory_events(order_id,event_type,reason,actor_id)
    values(p_order_id,'COMMIT',p_reason,p_actor_id)
    on conflict(order_id,event_type) do nothing;
    return jsonb_build_object('success',true,'inventory_status','COMMITTED');
  end if;

  if p_transition='RELEASE' then
    if v_order.inventory_status='RELEASED' then
      return jsonb_build_object('success',true,'inventory_status','RELEASED','idempotent',true);
    end if;
    if v_order.inventory_status<>'RESERVED' then
      return jsonb_build_object('success',false,'error_code','INVALID_INVENTORY_TRANSITION');
    end if;
    for v_item in
      select variant_id,quantity from public.order_items
      where order_id=p_order_id order by variant_id
    loop
      if v_item.variant_id is null then raise exception 'VARIANT_LINK_MISSING'; end if;
      update public.product_variants
      set reserved_quantity=reserved_quantity-v_item.quantity,updated_at=now()
      where id=v_item.variant_id and reserved_quantity>=v_item.quantity;
      if not found then raise exception 'INVENTORY_RELEASE_INVARIANT'; end if;
    end loop;
    update public.orders
    set inventory_status='RELEASED',inventory_expires_at=null
    where id=p_order_id;
    insert into public.inventory_events(order_id,event_type,reason,actor_id)
    values(p_order_id,'RELEASE',p_reason,p_actor_id)
    on conflict(order_id,event_type) do nothing;
    return jsonb_build_object('success',true,'inventory_status','RELEASED');
  end if;

  if p_transition='RESTOCK' then
    if v_order.inventory_status='RESTOCKED' then
      return jsonb_build_object('success',true,'inventory_status','RESTOCKED','idempotent',true);
    end if;
    if v_order.inventory_status<>'COMMITTED' then
      return jsonb_build_object('success',false,'error_code','INVALID_INVENTORY_TRANSITION');
    end if;
    for v_item in
      select variant_id,quantity from public.order_items
      where order_id=p_order_id order by variant_id
    loop
      if v_item.variant_id is null then raise exception 'VARIANT_LINK_MISSING'; end if;
      update public.product_variants
      set stock_quantity=stock_quantity+v_item.quantity,updated_at=now()
      where id=v_item.variant_id;
      if not found then raise exception 'INVENTORY_RESTOCK_INVARIANT'; end if;
    end loop;
    update public.orders
    set inventory_status='RESTOCKED',inventory_expires_at=null
    where id=p_order_id;
    insert into public.inventory_events(order_id,event_type,reason,actor_id)
    values(p_order_id,'RESTOCK',p_reason,p_actor_id)
    on conflict(order_id,event_type) do nothing;
    return jsonb_build_object('success',true,'inventory_status','RESTOCKED');
  end if;
  return jsonb_build_object('success',false,'error_code','UNKNOWN_INVENTORY_TRANSITION');
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
  v_variant public.product_variants%rowtype;
  v_product public.products%rowtype;
  v_variant_id uuid;
  v_product_id text;
  v_quantity integer;
  v_seen uuid[]:=array[]::uuid[];
  v_subtotal numeric(12,2):=0;
  v_shipping_fee numeric(12,2):=0;
  v_discount numeric(12,2):=0;
  v_grand_total numeric(12,2):=0;
  v_voucher public.vouchers%rowtype;
  v_items jsonb:='[]'::jsonb;
  v_order_id text;
  v_reference_code text;
  v_qr_url text;
  v_expires_at timestamptz;
begin
  if not exists(select 1 from auth.users where id=p_user_id) then
    return jsonb_build_object('success',false,'error_code','AUTH_REQUIRED');
  end if;
  if p_request_hash!~'^[a-f0-9]{64}$' or p_tracking_token_hash!~'^[a-f0-9]{64}$' then
    return jsonb_build_object('success',false,'error_code','INVALID_SECURITY_INPUT');
  end if;
  if upper(p_payment_method) not in ('VIETQR','COD') then
    return jsonb_build_object('success',false,'error_code','INVALID_PAYMENT_METHOD');
  end if;
  if jsonb_typeof(p_items_json)<>'array' or jsonb_array_length(p_items_json)<1 then
    return jsonb_build_object('success',false,'error_code','EMPTY_CART');
  end if;

  insert into public.checkout_idempotency(user_id,idempotency_key,request_hash)
  values(p_user_id,p_idempotency_key,p_request_hash)
  on conflict(user_id,idempotency_key) do nothing;
  select * into v_idem from public.checkout_idempotency
  where user_id=p_user_id and idempotency_key=p_idempotency_key for update;
  if v_idem.request_hash<>p_request_hash then
    return jsonb_build_object('success',false,'error_code','IDEMPOTENCY_CONFLICT');
  end if;
  if v_idem.status='COMPLETED' and v_idem.order_id is not null then
    return jsonb_build_object('success',true,'order_id',v_idem.order_id,'created',false);
  end if;
  update public.checkout_idempotency
  set status='PROCESSING',last_error_code=null,updated_at=now()
  where id=v_idem.id;

  for v_item in
    select value from jsonb_array_elements(p_items_json)
    order by value->>'variant_id'
  loop
    v_product_id:=nullif(btrim(v_item->>'product_id'),'');
    begin
      v_variant_id:=(v_item->>'variant_id')::uuid;
    exception when others then
      update public.checkout_idempotency set status='FAILED',last_error_code='INVALID_ITEM',updated_at=now() where id=v_idem.id;
      return jsonb_build_object('success',false,'error_code','INVALID_ITEM');
    end;
    if v_product_id is null or coalesce(v_item->>'quantity','')!~'^[1-9][0-9]*$' then
      update public.checkout_idempotency set status='FAILED',last_error_code='INVALID_ITEM',updated_at=now() where id=v_idem.id;
      return jsonb_build_object('success',false,'error_code','INVALID_ITEM');
    end if;
    v_quantity:=(v_item->>'quantity')::integer;
    if v_quantity>99 or v_variant_id=any(v_seen) then
      update public.checkout_idempotency set status='FAILED',last_error_code='INVALID_ITEM',updated_at=now() where id=v_idem.id;
      return jsonb_build_object('success',false,'error_code','INVALID_ITEM');
    end if;
    v_seen:=array_append(v_seen,v_variant_id);

    select * into v_variant from public.product_variants
    where id=v_variant_id for update;
    if not found or not v_variant.is_active or v_variant.product_id<>v_product_id then
      update public.checkout_idempotency set status='FAILED',last_error_code='PRODUCT_UNAVAILABLE',updated_at=now() where id=v_idem.id;
      return jsonb_build_object('success',false,'error_code','PRODUCT_UNAVAILABLE');
    end if;
    if v_variant.stock_quantity-v_variant.reserved_quantity<v_quantity then
      update public.checkout_idempotency set status='FAILED',last_error_code='INSUFFICIENT_STOCK',updated_at=now() where id=v_idem.id;
      return jsonb_build_object('success',false,'error_code','INSUFFICIENT_STOCK');
    end if;
    select * into v_product from public.products where id=v_product_id;
    if not found or not v_product.in_stock then
      update public.checkout_idempotency set status='FAILED',last_error_code='PRODUCT_UNAVAILABLE',updated_at=now() where id=v_idem.id;
      return jsonb_build_object('success',false,'error_code','PRODUCT_UNAVAILABLE');
    end if;

    v_subtotal:=v_subtotal+v_variant.price*v_quantity;
    v_items:=v_items||jsonb_build_array(jsonb_build_object(
      'product_id',v_product.id,'productId',v_product.id,
      'variant_id',v_variant.id,'variantId',v_variant.id,
      'variantName',v_variant.name,'name',v_product.name,
      'price',v_variant.price,'quantity',v_quantity,
      'image',v_product.image,'sku',v_variant.sku
    ));
  end loop;

  if nullif(upper(btrim(coalesce(p_voucher_code,''))),'') is not null then
    select * into v_voucher from public.vouchers
    where code=upper(btrim(p_voucher_code)) for share;
    if not found or not v_voucher.is_active or v_voucher.expiry_date<current_date
       or v_subtotal<v_voucher.min_subtotal then
      update public.checkout_idempotency set status='FAILED',last_error_code='VOUCHER_INVALID',updated_at=now() where id=v_idem.id;
      return jsonb_build_object('success',false,'error_code','VOUCHER_INVALID');
    end if;
    if v_voucher.discount_type='PERCENT' then
      if v_voucher.discount_value>100 then
        update public.checkout_idempotency set status='FAILED',last_error_code='VOUCHER_INVALID',updated_at=now() where id=v_idem.id;
        return jsonb_build_object('success',false,'error_code','VOUCHER_INVALID');
      end if;
      v_discount:=round(v_subtotal*v_voucher.discount_value/100,2);
    else
      v_discount:=v_voucher.discount_value;
    end if;
    v_discount:=least(v_discount,v_subtotal);
  end if;

  v_shipping_fee:=case when v_subtotal>2000000 then 0 else 35000 end;
  v_grand_total:=greatest(0,v_subtotal-v_discount+v_shipping_fee);
  v_order_id:='MUSH-'||to_char(clock_timestamp() at time zone 'Asia/Ho_Chi_Minh','YYYYMMDD')||'-'||encode(extensions.gen_random_bytes(8),'hex');
  v_reference_code:='MUSH '||v_order_id;
  v_expires_at:=now()+case when upper(p_payment_method)='COD' then interval '24 hours' else interval '15 minutes' end;

  insert into public.orders(
    id,user_id,items,subtotal,shipping_fee,discount,grand_total,status,
    payment_method,voucher_code,shipping_name,shipping_phone,shipping_detail,
    shipping_area,inventory_status,inventory_expires_at,idempotency_key,
    request_hash,tracking_token_hash
  ) values (
    v_order_id,p_user_id,v_items,v_subtotal,v_shipping_fee,v_discount,v_grand_total,'PENDING',
    upper(p_payment_method)::public.payment_method,nullif(upper(btrim(coalesce(p_voucher_code,''))),''),
    btrim(p_shipping_name),btrim(p_shipping_phone),btrim(p_shipping_detail),p_shipping_area,
    'RESERVED',v_expires_at,p_idempotency_key,p_request_hash,decode(p_tracking_token_hash,'hex')
  );

  for v_item in select value from jsonb_array_elements(v_items)
  loop
    insert into public.order_items(
      order_id,product_id,variant_id,product_name,unit_price,quantity,image,sku
    ) values (
      v_order_id,v_item->>'product_id',(v_item->>'variant_id')::uuid,
      v_item->>'name',(v_item->>'price')::numeric,(v_item->>'quantity')::integer,
      v_item->>'image',v_item->>'sku'
    );
    update public.product_variants
    set reserved_quantity=reserved_quantity+(v_item->>'quantity')::integer,updated_at=now()
    where id=(v_item->>'variant_id')::uuid
      and stock_quantity-reserved_quantity>=(v_item->>'quantity')::integer;
    if not found then raise exception 'INVENTORY_RESERVE_INVARIANT'; end if;
  end loop;

  if upper(p_payment_method)='VIETQR' then
    select 'https://img.vietqr.io/image/'||bank_id||'-'||account_no||'-'||template||
      '.png?amount='||trunc(v_grand_total)::bigint::text||'&addInfo='||replace(v_reference_code,' ','%20')
    into v_qr_url from public.payment_settings where id=true and enabled=true;
  end if;
  insert into public.payments(order_id,amount,method,status,qr_url,reference_code,expires_at)
  values(v_order_id,v_grand_total,upper(p_payment_method)::public.payment_method,'PENDING',v_qr_url,v_reference_code,v_expires_at);
  insert into public.inventory_events(order_id,event_type,reason)
  values(v_order_id,'RESERVE','CHECKOUT');
  insert into public.order_tracking(order_id,title,description,is_public)
  values(v_order_id,'KHỞI TẠO ĐƠN HÀNG','Đơn hàng đã được ghi nhận và đang chờ xử lý.',true);
  update public.checkout_idempotency
  set order_id=v_order_id,status='COMPLETED',completed_at=now(),updated_at=now()
  where id=v_idem.id;
  return jsonb_build_object(
    'success',true,'order_id',v_order_id,'created',true,
    'subtotal',v_subtotal,'shipping_fee',v_shipping_fee,'discount',v_discount,
    'grand_total',v_grand_total,'expires_at',v_expires_at
  );
end;
$$;

revoke execute on function public.transition_order_inventory(text,text,text,uuid)
  from public,anon,authenticated;
revoke execute on function public.create_secure_checkout(uuid,uuid,text,jsonb,text,text,text,text,text,text,text)
  from public,anon,authenticated;
grant execute on function public.transition_order_inventory(text,text,text,uuid)
  to service_role;
grant execute on function public.create_secure_checkout(uuid,uuid,text,jsonb,text,text,text,text,text,text,text)
  to service_role;

commit;

-- Rollback: stop checkout/workers first. Restore the P0 function bodies only
-- after reconciling every RESERVED variant and retaining order_items.variant_id.
