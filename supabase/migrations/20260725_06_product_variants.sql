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
  p.id, 'Mặc định', p.sku, p.price, p.compare_at_price,
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
    new.id, 'Mặc định', new.sku, new.price, new.compare_at_price,
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
