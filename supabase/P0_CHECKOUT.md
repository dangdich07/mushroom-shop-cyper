# P0 secure checkout and inventory

## Runtime requirement

The application and current Supabase JavaScript dependencies require Node.js
22 or newer. Local verification currently uses Node.js 22.

## Existing database upgrade

Do not rerun `schema.sql` on an existing project. Apply these files in order on
a local or test project first:

1. `migrations/20260717_01_add_inventory_and_idempotency.sql`
2. Enter verified stock counts for every product whose `stock_quantity` is NULL.
3. Confirm this query returns no rows:

```sql
select id, sku, name from public.products where stock_quantity is null;
```

4. `migrations/20260717_02_finalize_inventory_and_secure_checkout.sql`
5. Optionally run `migrations/20260717_03_optional_cron.sql` after enabling
   Supabase Cron (`pg_cron`) in the project.

Phase A never invents production stock. Products marked out of stock receive
zero; products previously marked sellable remain NULL until a verified count is
entered. Phase B aborts while any NULL count remains. Inventory values in
`seed.sql` are demo-only.

Before Phase A, verify that `pgcrypto` exists in the `extensions` schema:

```sql
select e.extname, n.nspname as extension_schema
from pg_extension e
join pg_namespace n on n.oid = e.extnamespace
where e.extname = 'pgcrypto';
```

Migration A stops before changing the schema when this query does not return
`pgcrypto | extensions`. It never drops, recreates, or moves the extension.

## Legacy orders and deprecated checkout

Orders with `inventory_status = NONE` predate P0. Admin logistics transitions
remain available, but these orders never reserve, commit, release, or restock
inventory and never create inventory events.

`deploy_secure_checkout_transaction` is retained only for a controlled rollback.

`DELIVERED` is terminal for both legacy and managed P0 orders. Admin cancellation,
inventory release, and restock are rejected with `DELIVERED_ORDER_IS_TERMINAL`;
returns and refunds require a separate future workflow.
Its EXECUTE permission is revoked from PUBLIC, anon, authenticated, and
service_role. Restoring it requires an explicit manual grant during rollback.

## Public tracking token lifetime

The raw public tracking token is returned once after checkout and temporarily
stored in `sessionStorage`. Closing the tab or clearing browser data can remove
it. An authenticated order owner can still view tracking through their session
and RLS without this token. A public token cannot be recovered from the SHA-256
hash stored by the database.

Token rotation/reissue is deferred to a later phase. Do not store the raw token
in the database or long-lived `localStorage`.

## Reservation expiry and Cron

VietQR reserves stock for 15 minutes. COD reserves stock for 24 hours. Expiry is
automatic only after the Cron migration has successfully scheduled the jobs.
Verify it with:

```sql
select jobname, schedule, active
from cron.job
where jobname like 'cybermush-%';
```

When Cron is unavailable on local/test, invoke the batch RPCs manually:

```sql
select public.process_expired_reservations('VIETQR', 100);
select public.process_expired_reservations('COD', 100);
select public.cleanup_checkout_idempotency(500);
```

## Preflight and postflight inventory checks

```sql
select count(*) as total_products,
       count(*) filter (where in_stock) as marked_in_stock,
       count(*) filter (where not in_stock) as marked_out_of_stock
from public.products;

select id, sku, name, in_stock, stock_quantity, reserved_quantity
from public.products
order by sku;

select id, sku, name from public.products where stock_quantity is null;

select id, sku from public.products
where stock_quantity < 0 or reserved_quantity < 0
   or reserved_quantity > stock_quantity;

select id, sku from public.products
where in_stock <> (stock_quantity - reserved_quantity > 0);
```

Never run destructive checkout/inventory tests against production. Before a
production rollout, back up the database and export a stock snapshot. After new
orders exist, retain `inventory_events` and use a forward fix instead of dropping
inventory columns or resetting quantities in bulk.
