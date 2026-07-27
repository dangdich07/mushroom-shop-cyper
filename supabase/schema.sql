-- CyberMushroom - complete Supabase database schema
-- Run this file once on a NEW/EMPTY Supabase project.

begin;

create extension if not exists "uuid-ossp" with schema extensions;

-- -----------------------------------------------------------------------------
-- Domain types
-- -----------------------------------------------------------------------------

do $$
begin
  create type public.mushroom_category as enum ('MEDICINAL', 'FOOD', 'EQUIPMENT');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.order_status as enum (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.payment_method as enum ('VIETQR', 'BANK_TRANSFER', 'COD');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.payment_status as enum (
    'PENDING',
    'WAITING',
    'PAID',
    'FAILED',
    'REFUNDED'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.voucher_discount_type as enum ('PERCENT', 'FIXED');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.user_role as enum ('super_admin', 'admin', 'staff', 'customer');
exception
  when duplicate_object then null;
end
$$;

-- -----------------------------------------------------------------------------
-- Core tables
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone_number text,
  lab_position text not null default 'VERIFIED CLIENT',
  avatar_url text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  -- TEXT keeps the current mock IDs (prod-1, prod-2...) compatible with Supabase.
  id text primary key default (extensions.uuid_generate_v4())::text,
  slug text not null unique,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  scientific_name text,
  category public.mushroom_category not null,
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price is null or compare_at_price >= 0),
  rating numeric(3, 2) not null default 5.00 check (rating between 0 and 5),
  total_reviews integer not null default 0 check (total_reviews >= 0),
  -- The product detail page currently reads rating_count, while the rest of the app
  -- reads total_reviews. Keep both names in sync without a second source of truth.
  rating_count integer generated always as (total_reviews) stored,
  image text not null,
  short_description text not null,
  sku text not null unique,
  tags text[] not null default '{}',
  in_stock boolean not null default true,
  pharmacological_effects text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id text primary key default (extensions.uuid_generate_v4())::text,
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  user_name text not null check (char_length(btrim(user_name)) between 1 and 120),
  user_avatar text,
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(btrim(comment)) between 1 and 4000),
  is_verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blogs (
  id text primary key default (extensions.uuid_generate_v4())::text,
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  cover_image text not null,
  author_name text not null,
  author_role text not null,
  tags text[] not null default '{}',
  read_time_minutes integer not null default 5 check (read_time_minutes > 0),
  view_count integer not null default 0 check (view_count >= 0),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vouchers (
  code text primary key check (code = upper(btrim(code)) and char_length(code) between 2 and 50),
  discount_type public.voucher_discount_type not null,
  discount_value numeric(12, 2) not null check (discount_value > 0),
  min_subtotal numeric(12, 2) not null default 0 check (min_subtotal >= 0),
  description text not null default '',
  expiry_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vouchers_percent_range check (
    discount_type <> 'PERCENT' or discount_value <= 100
  )
);

create table public.orders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete restrict,
  -- Snapshot used by the legacy service layer. Normalized rows also live in order_items.
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  shipping_fee numeric(12, 2) not null default 0 check (shipping_fee >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  grand_total numeric(12, 2) not null check (grand_total >= 0),
  status public.order_status not null default 'PENDING',
  payment_method public.payment_method not null,
  voucher_code text references public.vouchers(code) on update cascade on delete set null,
  shipping_name text not null,
  shipping_phone text not null,
  shipping_detail text not null,
  shipping_area text not null check (shipping_area in ('HANOI', 'DANANG', 'HCM')),
  tracking_logs jsonb not null default '[]'::jsonb check (jsonb_typeof(tracking_logs) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default extensions.uuid_generate_v4(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 99),
  image text,
  sku text,
  created_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create table public.payments (
  id uuid primary key default extensions.uuid_generate_v4(),
  order_id text not null unique references public.orders(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  method public.payment_method not null,
  status public.payment_status not null default 'PENDING',
  qr_url text,
  reference_code text not null unique,
  gateway_transaction_id text unique,
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_tracking (
  id uuid primary key default extensions.uuid_generate_v4(),
  order_id text not null references public.orders(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text not null check (char_length(btrim(description)) between 1 and 4000),
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.addresses (
  id text primary key default (extensions.uuid_generate_v4())::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  area text not null default 'HANOI' check (area in ('HANOI', 'DANANG', 'HCM')),
  detail text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id text primary key default (extensions.uuid_generate_v4())::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  time text default 'Vừa xong',
  title text not null,
  "desc" text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.payment_logs (
  id uuid primary key default extensions.uuid_generate_v4(),
  payment_id uuid references public.payments(id) on delete set null,
  event_type text not null,
  log_data jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

-- Optional singleton used to build VietQR image URLs inside the checkout RPC.
-- Leave it empty until real bank details are configured (see README.md).
create table public.payment_settings (
  id boolean primary key default true check (id),
  bank_id text not null check (bank_id ~ '^[A-Za-z0-9]+$'),
  account_no text not null check (account_no ~ '^[A-Za-z0-9]+$'),
  template text not null default 'compact2' check (template ~ '^[A-Za-z0-9]+$'),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index products_category_idx on public.products(category);
create index products_created_at_idx on public.products(created_at desc);
create index products_catalog_availability_idx
  on public.products(in_stock, category, price, created_at desc);
create index products_catalog_price_idx on public.products(price, id);
create index reviews_product_created_idx on public.reviews(product_id, created_at desc);
create index blogs_published_at_idx on public.blogs(published_at desc);
create index vouchers_expiry_date_idx on public.vouchers(expiry_date);
create index orders_user_created_idx on public.orders(user_id, created_at desc);
create index orders_status_created_idx on public.orders(status, created_at desc);
create index order_items_order_idx on public.order_items(order_id);
create index payments_status_idx on public.payments(status);
create index order_tracking_order_created_idx on public.order_tracking(order_id, created_at desc);
create index addresses_user_created_idx on public.addresses(user_id, created_at desc);
create index notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index payment_logs_created_at_idx on public.payment_logs(created_at desc);

-- -----------------------------------------------------------------------------
-- Shared trigger helpers
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create trigger blogs_set_updated_at
before update on public.blogs
for each row execute function public.set_updated_at();

create trigger vouchers_set_updated_at
before update on public.vouchers
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create trigger addresses_set_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

create trigger payment_settings_set_updated_at
before update on public.payment_settings
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Auth profile synchronization
-- -----------------------------------------------------------------------------

create or replace function public.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    phone_number,
    lab_position,
    avatar_url
  )
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone_number', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'lab_position', ''), 'VERIFIED CLIENT'),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    phone_number = excluded.phone_number,
    lab_position = excluded.lab_position,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$;

create trigger auth_user_profile_insert
after insert on auth.users
for each row execute function public.sync_profile_from_auth_user();

create trigger auth_user_profile_update
after update of email, raw_user_meta_data on auth.users
for each row execute function public.sync_profile_from_auth_user();

-- Backfill profiles if an Auth user was created before this schema was run.
insert into public.profiles (
  id,
  email,
  full_name,
  phone_number,
  lab_position,
  avatar_url
)
select
  u.id,
  u.email,
  nullif(u.raw_user_meta_data ->> 'full_name', ''),
  nullif(u.raw_user_meta_data ->> 'phone_number', ''),
  coalesce(nullif(u.raw_user_meta_data ->> 'lab_position', ''), 'VERIFIED CLIENT'),
  nullif(u.raw_user_meta_data ->> 'avatar_url', '')
from auth.users u
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Product rating aggregation
-- -----------------------------------------------------------------------------

create or replace function public.refresh_product_rating(p_product_id text)
returns void
language sql
set search_path = ''
as $$
  update public.products
  set
    rating = coalesce(
      (select round(avg(r.rating)::numeric, 2) from public.reviews r where r.product_id = p_product_id),
      5.00
    ),
    total_reviews = (select count(*)::integer from public.reviews r where r.product_id = p_product_id)
  where id = p_product_id;
$$;

create or replace function public.handle_review_rating_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_product_rating(old.product_id);
  elsif tg_op = 'INSERT' then
    perform public.refresh_product_rating(new.product_id);
  else
    perform public.refresh_product_rating(new.product_id);
    if old.product_id is distinct from new.product_id then
      perform public.refresh_product_rating(old.product_id);
    end if;
  end if;

  return null;
end;
$$;

create trigger reviews_refresh_product_rating
after insert or update or delete on public.reviews
for each row execute function public.handle_review_rating_change();

-- Keep the legacy orders.tracking_logs snapshot synchronized with the normalized
-- tracking table, and create the user notification consumed by the account page.
create or replace function public.handle_new_order_tracking()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.orders
  set tracking_logs = tracking_logs || jsonb_build_array(jsonb_build_object(
    'time', new.created_at,
    'title', new.title,
    'desc', new.description
  ))
  where id = new.order_id;

  insert into public.notifications (user_id, title, "desc")
  select o.user_id, new.title, new.description
  from public.orders o
  where o.id = new.order_id;

  return new;
end;
$$;

create trigger order_tracking_sync_order
after insert on public.order_tracking
for each row execute function public.handle_new_order_tracking();

create or replace function public.handle_payment_status_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'PAID' and old.status is distinct from 'PAID' then
    new.paid_at := coalesce(new.paid_at, now());
  end if;

  return new;
end;
$$;

create trigger payments_set_paid_at
before update of status on public.payments
for each row execute function public.handle_payment_status_change();

-- -----------------------------------------------------------------------------
-- Public blog view counter RPC
-- -----------------------------------------------------------------------------

create or replace function public.increment_blog_views(blog_slug text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.blogs
  set view_count = view_count + 1
  where slug = blog_slug;
$$;

-- -----------------------------------------------------------------------------
-- DEPRECATED rollback-only checkout RPC. P0 revokes EXECUTE from every API role;
-- application code must use public.create_secure_checkout through a verified Server Action.
-- -----------------------------------------------------------------------------

create or replace function public.deploy_secure_checkout_transaction(
  p_order_id text,
  p_user_id text,
  p_subtotal numeric,
  p_shipping_fee numeric,
  p_discount numeric,
  p_grand_total numeric,
  p_shipping_name text,
  p_shipping_phone text,
  p_shipping_detail text,
  p_shipping_area text,
  p_payment_method text,
  p_items_json jsonb,
  p_reference_code text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_item jsonb;
  v_product public.products%rowtype;
  v_product_id text;
  v_quantity integer;
  v_seen_product_ids text[] := array[]::text[];
  v_computed_subtotal numeric(12, 2) := 0;
  v_enriched_items jsonb := '[]'::jsonb;
  v_reference_code text;
  v_qr_url text;
  v_initial_title text := 'KHỞI TẠO ĐƠN HÀNG';
  v_initial_description text := 'Đơn hàng đã được ghi nhận và đang chờ phòng Lab xử lý.';
begin
  if p_order_id is null or upper(btrim(p_order_id)) !~ '^MUSH-[0-9]{8}-[0-9]+$' then
    return jsonb_build_object('success', false, 'message', 'Mã đơn hàng không đúng định dạng.');
  end if;

  begin
    v_user_id := p_user_id::uuid;
  exception
    when invalid_text_representation then
      return jsonb_build_object('success', false, 'message', 'Mã người dùng không phải UUID hợp lệ.');
  end;

  if not exists (select 1 from auth.users u where u.id = v_user_id) then
    return jsonb_build_object('success', false, 'message', 'Tài khoản không tồn tại trong Auth.');
  end if;

  if p_items_json is null
     or jsonb_typeof(p_items_json) <> 'array'
     or jsonb_array_length(p_items_json) = 0 then
    return jsonb_build_object('success', false, 'message', 'Đơn hàng không có sản phẩm.');
  end if;

  if p_subtotal is null
     or p_shipping_fee is null
     or p_discount is null
     or p_grand_total is null
     or p_subtotal < 0
     or p_shipping_fee < 0
     or p_discount < 0
     or p_grand_total < 0 then
    return jsonb_build_object('success', false, 'message', 'Giá trị thanh toán không hợp lệ.');
  end if;

  if p_shipping_name is null or btrim(p_shipping_name) = ''
     or p_shipping_phone is null or btrim(p_shipping_phone) = ''
     or p_shipping_detail is null or btrim(p_shipping_detail) = '' then
    return jsonb_build_object('success', false, 'message', 'Thông tin nhận hàng chưa đầy đủ.');
  end if;

  if p_shipping_area not in ('HANOI', 'DANANG', 'HCM') then
    return jsonb_build_object('success', false, 'message', 'Khu vực giao hàng không hợp lệ.');
  end if;

  if upper(p_payment_method) not in ('VIETQR', 'BANK_TRANSFER', 'COD') then
    return jsonb_build_object('success', false, 'message', 'Phương thức thanh toán không hợp lệ.');
  end if;

  for v_item in select value from jsonb_array_elements(p_items_json)
  loop
    v_product_id := nullif(btrim(v_item ->> 'product_id'), '');

    if v_product_id is null
       or coalesce(v_item ->> 'quantity', '') !~ '^[1-9][0-9]*$' then
      return jsonb_build_object('success', false, 'message', 'Dòng sản phẩm không hợp lệ.');
    end if;

    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity > 99 then
      return jsonb_build_object('success', false, 'message', 'Số lượng mỗi sản phẩm không được vượt quá 99.');
    end if;

    if v_product_id = any(v_seen_product_ids) then
      return jsonb_build_object('success', false, 'message', 'Đơn hàng chứa sản phẩm trùng lặp.');
    end if;
    v_seen_product_ids := array_append(v_seen_product_ids, v_product_id);

    select p.*
    into v_product
    from public.products p
    where p.id = v_product_id
    for update;

    if not found then
      return jsonb_build_object('success', false, 'message', 'Sản phẩm ' || v_product_id || ' không tồn tại.');
    end if;

    if not v_product.in_stock then
      return jsonb_build_object('success', false, 'message', 'Sản phẩm ' || v_product.name || ' đã hết hàng.');
    end if;

    v_computed_subtotal := v_computed_subtotal + (v_product.price * v_quantity);
    v_enriched_items := v_enriched_items || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id,
      'productId', v_product.id,
      'name', v_product.name,
      'price', v_product.price,
      'quantity', v_quantity,
      'image', v_product.image,
      'sku', v_product.sku
    ));
  end loop;

  if round(v_computed_subtotal, 2) <> round(p_subtotal, 2) then
    return jsonb_build_object('success', false, 'message', 'Subtotal không khớp với giá sản phẩm trong database.');
  end if;

  if round(p_grand_total, 2) <> round(greatest(0, p_subtotal - p_discount + p_shipping_fee), 2) then
    return jsonb_build_object('success', false, 'message', 'Tổng thanh toán không khớp.');
  end if;

  -- The current TypeScript caller strips hyphens from p_reference_code, while the
  -- webhook expects them. Normalize here so existing code and webhook agree.
  if upper(btrim(coalesce(p_reference_code, ''))) ~ '^MUSH MUSH-[0-9]{8}-[0-9]+$' then
    v_reference_code := upper(btrim(p_reference_code));
  else
    v_reference_code := 'MUSH ' || upper(btrim(p_order_id));
  end if;

  insert into public.orders (
    id,
    user_id,
    items,
    subtotal,
    shipping_fee,
    discount,
    grand_total,
    status,
    payment_method,
    shipping_name,
    shipping_phone,
    shipping_detail,
    shipping_area,
    tracking_logs
  )
  values (
    upper(btrim(p_order_id)),
    v_user_id,
    v_enriched_items,
    p_subtotal,
    p_shipping_fee,
    p_discount,
    p_grand_total,
    'PENDING',
    upper(p_payment_method)::public.payment_method,
    btrim(p_shipping_name),
    btrim(p_shipping_phone),
    btrim(p_shipping_detail),
    p_shipping_area,
    '[]'::jsonb
  );

  for v_item in select value from jsonb_array_elements(v_enriched_items)
  loop
    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      unit_price,
      quantity,
      image,
      sku
    )
    values (
      upper(btrim(p_order_id)),
      v_item ->> 'product_id',
      v_item ->> 'name',
      (v_item ->> 'price')::numeric,
      (v_item ->> 'quantity')::integer,
      v_item ->> 'image',
      v_item ->> 'sku'
    );
  end loop;

  if upper(p_payment_method) = 'VIETQR' then
    select
      'https://img.vietqr.io/image/' || ps.bank_id || '-' || ps.account_no || '-' || ps.template ||
      '.png?amount=' || trunc(p_grand_total)::bigint::text ||
      '&addInfo=' || replace(v_reference_code, ' ', '%20')
    into v_qr_url
    from public.payment_settings ps
    where ps.id = true and ps.enabled = true;
  end if;

  insert into public.payments (
    order_id,
    amount,
    method,
    status,
    qr_url,
    reference_code
  )
  values (
    upper(btrim(p_order_id)),
    p_grand_total,
    upper(p_payment_method)::public.payment_method,
    'PENDING',
    v_qr_url,
    v_reference_code
  );

  insert into public.order_tracking (order_id, title, description)
  values (upper(btrim(p_order_id)), v_initial_title, v_initial_description);

  return jsonb_build_object(
    'success', true,
    'order_id', upper(btrim(p_order_id)),
    'reference_code', v_reference_code
  );
exception
  when unique_violation then
    return jsonb_build_object('success', false, 'message', 'Mã đơn hàng hoặc mã thanh toán đã tồn tại.');
  when others then
    return jsonb_build_object(
      'success', false,
      'message', sqlerrm,
      'sqlstate', sqlstate
    );
end;
$$;

-- -----------------------------------------------------------------------------
-- Realtime tables used by TrackingTimeline and VietQRCard
-- -----------------------------------------------------------------------------

do $$
declare
  v_table text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach v_table in array array['orders', 'order_tracking', 'payments']
    loop
      if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = v_table
      ) then
        execute format('alter publication supabase_realtime add table public.%I', v_table);
      end if;
    end loop;
  end if;
end
$$;








-- P0 MIGRATION SYNC START: canonical definitions copied after migration design.
-- Phase A: additive structures for secure checkout and inventory.
-- Safe for an existing database: no production stock quantity is invented here.
-- Sellable products intentionally retain stock_quantity = NULL until an operator
-- supplies a verified physical count before Phase B.


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


-- Pre-Phase-B checks (must return zero rows before finalization):
-- select id, sku, name from public.products where stock_quantity is null;
-- select id, sku from public.products where stock_quantity < 0
--   or reserved_quantity < 0 or reserved_quantity > stock_quantity;

-- Rollback note: before Phase B and before any reservations exist, the new
-- tables/columns may be removed. Once orders use inventory events, prefer a
-- forward fix and retain event data for reconciliation.

-- Phase B: finalize verified inventory and install privileged checkout RPCs.
-- Run only after every sellable product has a confirmed stock_quantity.


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

-- P0 MIGRATION SYNC END
commit;

-- P1 PRODUCT VARIANTS MIGRATION SYNC START
-- P1 variants structure and legacy backfill.
-- Run on a dedicated test project only after P0 migrations.
begin;

lock table public.products in share row exclusive mode;
lock table public.order_items in share row exclusive mode;

create table if not exists public.product_variants (
  id uuid primary key default extensions.gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  sku text not null unique check (char_length(btrim(sku)) between 1 and 100),
  weight_grams integer check (weight_grams is null or weight_grams > 0),
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (
    compare_at_price is null or compare_at_price >= 0
  ),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  reserved_quantity integer not null default 0 check (
    reserved_quantity >= 0 and reserved_quantity <= stock_quantity
  ),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_variants_product_active_idx
  on public.product_variants(product_id, is_active, created_at);
create index if not exists product_variants_available_idx
  on public.product_variants(is_active, stock_quantity, reserved_quantity);

create table if not exists public.product_images (
  id uuid primary key default extensions.gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  image_url text not null check (char_length(btrim(image_url)) > 0),
  alt_text text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_primary boolean not null default false
);

create index if not exists product_images_product_sort_idx
  on public.product_images(product_id, sort_order, id);
create unique index if not exists product_images_one_primary_uidx
  on public.product_images(product_id) where is_primary;

create or replace function public.sync_product_stock_flag()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op='UPDATE' and exists(
    select 1 from public.product_variants v where v.product_id=new.id
  ) then
    select coalesce(bool_or(v.is_active and v.stock_quantity-v.reserved_quantity>0),false)
    into new.in_stock
    from public.product_variants v where v.product_id=new.id;
  else
    new.in_stock:=new.stock_quantity-new.reserved_quantity>0;
  end if;
  return new;
end;
$$;

-- One verified default variant per legacy product. Existing stock is copied
-- exactly; no production inventory is invented.
insert into public.product_variants(
  product_id, name, sku, price, compare_at_price,
  stock_quantity, reserved_quantity, is_active, created_at, updated_at
)
select
  p.id, 'Máº·c Ä‘á»‹nh', p.sku, p.price, p.compare_at_price,
  p.stock_quantity, p.reserved_quantity, p.in_stock, p.created_at, p.updated_at
from public.products p
where not exists (
  select 1 from public.product_variants v where v.product_id = p.id
);

insert into public.product_images(product_id, image_url, alt_text, sort_order, is_primary)
select p.id, p.image, p.name, 0, true
from public.products p
where not exists (
  select 1 from public.product_images i where i.product_id = p.id
);

alter table public.order_items
  add column if not exists variant_id uuid
  references public.product_variants(id) on delete set null;

update public.order_items oi
set variant_id = (
  select v.id
  from public.product_variants v
  where v.product_id = oi.product_id
  order by v.created_at, v.id
  limit 1
)
where oi.variant_id is null
  and oi.product_id is not null;

alter table public.order_items
  drop constraint if exists order_items_order_id_product_id_key;
create unique index if not exists order_items_order_variant_uidx
  on public.order_items(order_id, variant_id)
  where variant_id is not null;
create index if not exists order_items_variant_idx
  on public.order_items(variant_id);

create or replace function public.sync_product_variant_aggregate(p_product_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_price numeric(12,2);
  v_stock integer;
  v_reserved integer;
  v_available boolean;
begin
  select
    min(v.price) filter (where v.is_active),
    coalesce(sum(v.stock_quantity), 0)::integer,
    coalesce(sum(v.reserved_quantity), 0)::integer,
    coalesce(bool_or(v.is_active and v.stock_quantity-v.reserved_quantity>0),false)
  into v_price, v_stock, v_reserved, v_available
  from public.product_variants v
  where v.product_id = p_product_id;

  update public.products
  set price = coalesce(v_price, price),
      stock_quantity = v_stock,
      reserved_quantity = v_reserved,
      in_stock = v_available,
      updated_at = now()
  where id = p_product_id;
end;
$$;

create or replace function public.on_variant_changed_sync_product()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_product_variant_aggregate(old.product_id);
    return old;
  end if;
  perform public.sync_product_variant_aggregate(new.product_id);
  if tg_op = 'UPDATE' and old.product_id <> new.product_id then
    perform public.sync_product_variant_aggregate(old.product_id);
  end if;
  return new;
end;
$$;

drop trigger if exists product_variants_sync_product on public.product_variants;
create trigger product_variants_sync_product
after insert or update or delete on public.product_variants
for each row execute function public.on_variant_changed_sync_product();

create or replace function public.create_default_variant_for_product()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.product_variants(
    product_id, name, sku, price, compare_at_price,
    stock_quantity, reserved_quantity, is_active
  ) values (
    new.id, 'Máº·c Ä‘á»‹nh', new.sku, new.price, new.compare_at_price,
    new.stock_quantity, new.reserved_quantity, new.in_stock
  );
  insert into public.product_images(product_id,image_url,alt_text,sort_order,is_primary)
  values(new.id,new.image,new.name,0,true);
  return new;
end;
$$;

drop trigger if exists products_create_default_variant on public.products;
create trigger products_create_default_variant
after insert on public.products
for each row execute function public.create_default_variant_for_product();

create or replace function public.sync_single_variant_from_legacy_product()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if pg_trigger_depth()>1 then return new; end if;
  if (select count(*) from public.product_variants v where v.product_id=new.id)=1 then
    update public.product_variants
    set price=new.price,
        compare_at_price=new.compare_at_price,
        stock_quantity=new.stock_quantity,
        reserved_quantity=new.reserved_quantity,
        updated_at=now()
    where product_id=new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists products_sync_single_variant on public.products;
create trigger products_sync_single_variant
after update of price,compare_at_price,stock_quantity,reserved_quantity on public.products
for each row execute function public.sync_single_variant_from_legacy_product();

alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;

drop policy if exists product_variants_public_select on public.product_variants;
create policy product_variants_public_select on public.product_variants
for select to anon, authenticated using (is_active);
drop policy if exists product_variants_admin_all on public.product_variants;
create policy product_variants_admin_all on public.product_variants
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists product_images_public_select on public.product_images;
create policy product_images_public_select on public.product_images
for select to anon, authenticated using (true);
drop policy if exists product_images_admin_all on public.product_images;
create policy product_images_admin_all on public.product_images
for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.product_variants, public.product_images to anon, authenticated;
grant select on public.product_variants, public.product_images to service_role;
grant insert, update, delete on public.product_variants, public.product_images to authenticated;
revoke all on function public.sync_product_variant_aggregate(text)
  from public, anon, authenticated;
revoke all on function public.on_variant_changed_sync_product()
  from public, anon, authenticated;
revoke all on function public.create_default_variant_for_product()
  from public, anon, authenticated;
revoke all on function public.sync_single_variant_from_legacy_product()
  from public, anon, authenticated;
grant execute on function public.sync_product_variant_aggregate(text) to service_role;

commit;

-- Pre/post checks:
-- select p.id from public.products p left join public.product_variants v
--   on v.product_id=p.id where v.id is null;
-- select oi.id from public.order_items oi
--   where oi.product_id is not null and oi.variant_id is null;
-- select product_id, sum(stock_quantity), sum(reserved_quantity)
--   from public.product_variants group by product_id;
--
-- Rollback: stop checkout first. Do not drop variant/order linkage after new
-- orders exist. Before traffic, drop triggers/tables and variant_id in reverse
-- order inside one transaction.

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
  values(v_order_id,'KHá»žI Táº O ÄÆ N HÃ€NG','ÄÆ¡n hÃ ng Ä‘Ã£ Ä‘Æ°á»£c ghi nháº­n vÃ  Ä‘ang chá» xá»­ lÃ½.',true);
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

-- Forward fix for projects that already ran 20260725_06.
-- Server-rendered product detail uses the service role and still requires
-- PostgreSQL table privileges even though it bypasses RLS.
begin;

grant select on table public.product_variants, public.product_images
  to service_role;

commit;

-- Verification:
-- select
--   has_table_privilege('service_role','public.product_variants','SELECT')
--     as variants_select,
--   has_table_privilege('service_role','public.product_images','SELECT')
--     as images_select;
--
-- Rollback (disables server-side product detail):
-- revoke select on table public.product_variants, public.product_images
--   from service_role;

-- P1 PRODUCT VARIANTS MIGRATION SYNC END
