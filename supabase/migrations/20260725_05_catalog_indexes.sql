-- P1 catalog query indexes. Additive only; no product data is changed.
begin;

create index if not exists products_catalog_availability_idx
  on public.products (in_stock, category, price, created_at desc);
create index if not exists products_catalog_price_idx
  on public.products (price, id);

commit;

-- Rollback:
-- drop index if exists public.products_catalog_availability_idx;
-- drop index if exists public.products_catalog_price_idx;
