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
-- Atomic checkout RPC used by src/features/checkout/actions.ts
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

commit;
