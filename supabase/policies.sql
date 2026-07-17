-- CyberMushroom - Row Level Security, grants, and role helpers
-- Run after supabase/schema.sql.

begin;

-- -----------------------------------------------------------------------------
-- Role helpers
-- -----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('super_admin', 'admin')
  );
$$;

-- A customer may update their own profile fields, but never their own role.
create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and current_user not in ('postgres', 'supabase_admin', 'service_role')
     and not public.is_admin() then
    raise exception 'Only an administrator can change profile roles.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_role_change on public.profiles;
create trigger profiles_guard_role_change
before update on public.profiles
for each row execute function public.guard_profile_role_change();

-- -----------------------------------------------------------------------------
-- Enable RLS everywhere exposed through the public schema
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.blogs enable row level security;
alter table public.vouchers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.order_tracking enable row level security;
alter table public.addresses enable row level security;
alter table public.notifications enable row level security;
alter table public.payment_logs enable row level security;
alter table public.payment_settings enable row level security;

-- -----------------------------------------------------------------------------
-- Remove policies with these names so this file can be safely re-run
-- -----------------------------------------------------------------------------

drop policy if exists profiles_select_own_or_admin on public.profiles;
drop policy if exists profiles_update_own_or_admin on public.profiles;

drop policy if exists products_public_select on public.products;
drop policy if exists products_admin_insert on public.products;
drop policy if exists products_admin_update on public.products;
drop policy if exists products_admin_delete on public.products;

drop policy if exists reviews_public_select on public.reviews;
drop policy if exists reviews_public_insert on public.reviews;
drop policy if exists reviews_admin_update on public.reviews;
drop policy if exists reviews_admin_delete on public.reviews;

drop policy if exists blogs_public_select on public.blogs;
drop policy if exists blogs_admin_insert on public.blogs;
drop policy if exists blogs_admin_update on public.blogs;
drop policy if exists blogs_admin_delete on public.blogs;

drop policy if exists vouchers_public_select_active on public.vouchers;
drop policy if exists vouchers_admin_select_all on public.vouchers;
drop policy if exists vouchers_admin_insert on public.vouchers;
drop policy if exists vouchers_admin_update on public.vouchers;
drop policy if exists vouchers_admin_delete on public.vouchers;

drop policy if exists orders_select_own_or_admin on public.orders;
drop policy if exists orders_public_tracking_status on public.orders;
drop policy if exists orders_admin_update on public.orders;
drop policy if exists orders_admin_delete on public.orders;

drop policy if exists order_items_select_own_or_admin on public.order_items;
drop policy if exists payments_select_own_or_admin on public.payments;

drop policy if exists order_tracking_public_select on public.order_tracking;
drop policy if exists order_tracking_admin_insert on public.order_tracking;

drop policy if exists addresses_owner_all on public.addresses;
drop policy if exists notifications_owner_select on public.notifications;
drop policy if exists notifications_owner_update on public.notifications;
drop policy if exists notifications_owner_delete on public.notifications;

drop policy if exists payment_logs_admin_select on public.payment_logs;
drop policy if exists payment_settings_admin_all on public.payment_settings;

-- -----------------------------------------------------------------------------
-- Profiles
-- -----------------------------------------------------------------------------

create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy profiles_update_own_or_admin
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- -----------------------------------------------------------------------------
-- Catalog, reviews, and blogs
-- -----------------------------------------------------------------------------

create policy products_public_select
on public.products
for select
to anon, authenticated
using (true);

create policy products_admin_insert
on public.products
for insert
to authenticated
with check (public.is_admin());

create policy products_admin_update
on public.products
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy products_admin_delete
on public.products
for delete
to authenticated
using (public.is_admin());

create policy reviews_public_select
on public.reviews
for select
to anon, authenticated
using (true);

create policy reviews_public_insert
on public.reviews
for insert
to anon, authenticated
with check (
  is_verified_purchase = false
  and (
    (auth.uid() is null and user_id is null)
    or user_id = auth.uid()
  )
);

create policy reviews_admin_update
on public.reviews
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy reviews_admin_delete
on public.reviews
for delete
to authenticated
using (public.is_admin());

create policy blogs_public_select
on public.blogs
for select
to anon, authenticated
using (true);

create policy blogs_admin_insert
on public.blogs
for insert
to authenticated
with check (public.is_admin());

create policy blogs_admin_update
on public.blogs
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy blogs_admin_delete
on public.blogs
for delete
to authenticated
using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Vouchers
-- -----------------------------------------------------------------------------

create policy vouchers_public_select_active
on public.vouchers
for select
to anon, authenticated
using (is_active = true);

create policy vouchers_admin_select_all
on public.vouchers
for select
to authenticated
using (public.is_admin());

create policy vouchers_admin_insert
on public.vouchers
for insert
to authenticated
with check (public.is_admin());

create policy vouchers_admin_update
on public.vouchers
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy vouchers_admin_delete
on public.vouchers
for delete
to authenticated
using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Orders and payments
-- -----------------------------------------------------------------------------

create policy orders_select_own_or_admin
on public.orders
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

-- Anonymous tracking only receives the non-sensitive id/status columns granted
-- below. Shipping and payment columns remain inaccessible to the anon role.
create policy orders_public_tracking_status
on public.orders
for select
to anon
using (true);

create policy orders_admin_update
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy orders_admin_delete
on public.orders
for delete
to authenticated
using (public.is_admin());

create policy order_items_select_own_or_admin
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or public.is_admin())
  )
);

create policy payments_select_own_or_admin
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = payments.order_id
      and (o.user_id = auth.uid() or public.is_admin())
  )
);

-- Tracking nodes contain no address/payment data. Public SELECT is required by
-- the current anonymous tracking page and its Realtime subscription.
create policy order_tracking_public_select
on public.order_tracking
for select
to anon, authenticated
using (true);

create policy order_tracking_admin_insert
on public.order_tracking
for insert
to authenticated
with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- User-owned data
-- -----------------------------------------------------------------------------

create policy addresses_owner_all
on public.addresses
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy notifications_owner_select
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

create policy notifications_owner_update
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy notifications_owner_delete
on public.notifications
for delete
to authenticated
using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Administrative/internal tables
-- -----------------------------------------------------------------------------

create policy payment_logs_admin_select
on public.payment_logs
for select
to authenticated
using (public.is_admin());

create policy payment_settings_admin_all
on public.payment_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Table privileges. RLS remains the row-level gate after these grants.
-- -----------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated, service_role;

grant select on public.products, public.reviews, public.blogs,
  public.vouchers, public.order_tracking
to anon;
grant select (id, status) on public.orders to anon;
grant insert on public.reviews to anon;

grant select on public.products, public.reviews, public.blogs,
  public.vouchers, public.order_tracking
to authenticated;
grant insert, update, delete on public.products, public.reviews, public.blogs,
  public.vouchers
to authenticated;
grant select, update on public.profiles to authenticated;
grant select, update, delete on public.orders to authenticated;
grant select on public.order_items, public.payments to authenticated;
grant insert on public.order_tracking to authenticated;
grant select, insert, update, delete on public.addresses to authenticated;
grant select, update, delete on public.notifications to authenticated;
grant select on public.payment_logs to authenticated;
grant select, insert, update, delete on public.payment_settings to authenticated;

grant all privileges on all tables in schema public to service_role;

grant usage on type public.mushroom_category to anon, authenticated, service_role;
grant usage on type public.order_status to authenticated, service_role;
grant usage on type public.payment_method to authenticated, service_role;
grant usage on type public.payment_status to authenticated, service_role;
grant usage on type public.voucher_discount_type to anon, authenticated, service_role;
grant usage on type public.user_role to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Function privileges
-- -----------------------------------------------------------------------------

revoke all on function public.is_admin() from public;
revoke all on function public.increment_blog_views(text) from public;
revoke all on function public.deploy_secure_checkout_transaction(
  text, text, numeric, numeric, numeric, numeric,
  text, text, text, text, text, jsonb, text
) from public;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.increment_blog_views(text) to anon, authenticated;
grant execute on function public.deploy_secure_checkout_transaction(
  text, text, numeric, numeric, numeric, numeric,
  text, text, text, text, text, jsonb, text
) to service_role;

commit;
