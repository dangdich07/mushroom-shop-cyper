# P2 Promotions Loyalty

## Scope

Migration `20260728_09_loyalty_promotion_wheel.sql` adds a real loyalty wallet
and a server-authoritative voucher wheel:

- Every future order transition to `DELIVERED` earns
  `floor(grand_total / 10,000)` points.
- Existing delivered orders are not backfilled.
- One spin costs 50 points.
- PostgreSQL locks the wallet row before debiting it.
- `(user_id, idempotency_key)` makes repeated spin requests idempotent.
- The selected active voucher, point debit, spin event and reward record are
  committed in one transaction.
- The browser never selects the winning voucher.

Wheel rewards currently reference active global vouchers. Checkout still
validates voucher activity, expiry and minimum subtotal. Unique single-use
voucher issuance is intentionally outside this migration.

## Security

Users can only read their own wallet, ledger, spins and rewards through RLS.
They cannot insert or update those tables directly.

`spin_promotion_wheel(uuid)`:

- derives the user from `auth.uid()`;
- is granted only to `authenticated`;
- uses `SECURITY DEFINER` with `SET search_path = ''`;
- never accepts a user ID or point amount from the client.

The delivery trigger function is not executable by `anon`, `authenticated` or
`service_role`; PostgreSQL invokes it only from the order status trigger.

## Test-project rollout

Do not run this migration on production until all checks pass on the dedicated
Supabase test project.

1. Run `20260728_09_loyalty_promotion_wheel.sql`.
2. Confirm the table and RPC grants:

```sql
select
  to_regclass('public.loyalty_wallets') as wallets,
  to_regclass('public.loyalty_point_ledger') as ledger,
  to_regclass('public.promotion_spin_events') as spins,
  to_regclass('public.user_promotion_rewards') as rewards;

select
  has_function_privilege(
    'anon',
    'public.spin_promotion_wheel(uuid)',
    'EXECUTE'
  ) as anon_execute,
  has_function_privilege(
    'authenticated',
    'public.spin_promotion_wheel(uuid)',
    'EXECUTE'
  ) as authenticated_execute;
```

Expected: all four tables exist, `anon_execute = false`, and
`authenticated_execute = true`.

3. Create a COD order with a test account and progress it through the normal
   admin flow to `DELIVERED`.
4. Reconcile the wallet:

```sql
select user_id, points, lifetime_earned, updated_at
from public.loyalty_wallets
where user_id = '<TEST_USER_UUID>';

select delta, balance_after, reason, source_ref, created_at
from public.loyalty_point_ledger
where user_id = '<TEST_USER_UUID>'
order by created_at;
```

The credited amount must equal `floor(order.grand_total / 10000)`. Repeating or
rejecting a terminal delivery transition must not add another ledger entry.

5. Sign in on localhost and spin once from `/promotions`.
6. Verify exactly 50 points were deducted and one spin/reward row exists:

```sql
select id, cost, status, prize_code, error_code, created_at
from public.promotion_spin_events
where user_id = '<TEST_USER_UUID>'
order by created_at desc;

select voucher_code, spin_id, created_at
from public.user_promotion_rewards
where user_id = '<TEST_USER_UUID>'
order by created_at desc;
```

7. Test two concurrent calls with the same idempotency key. Both calls must
   return the same prize and the wallet must lose only 50 points.
8. Test two concurrent calls with different keys and a balance sufficient for
   only one spin. Exactly one succeeds and the balance never becomes negative.
9. As another authenticated user, direct selects must return zero rows for the
   first user's wallet, ledger, spins and rewards.

## Production rollout

Back up production and deploy in this order:

1. Run migration `09`.
2. Run read-only grant/RLS checks.
3. Deploy the Promotions UI.
4. Monitor function errors and wallet invariants.

Never seed or manually backfill production points without a separately approved
business reconciliation plan.

