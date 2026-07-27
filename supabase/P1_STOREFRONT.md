# P1 Storefront setup

P1 replaces the catalog mock source with Supabase and adds login, registration,
email recovery, and password reset flows. Product variants are not part of this
phase.

## Test project only

1. Keep the localhost process pointed at the dedicated Supabase test project.
2. Run `supabase/migrations/20260725_05_catalog_indexes.sql` in that test project.
3. Do not run this migration against production until the test results and
   deployment window are approved.

The migration is additive and does not update product rows. `schema.sql` contains
the same indexes only for bootstrapping a new database.

## Supabase Auth URL configuration

In the test project's Authentication URL settings, use:

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`

Do not place API keys or passwords in this document. Keep test values in the
ignored `.env.test.local` file.

## Data source

Supabase is the default catalog source. Mock data is used only when
`NEXT_PUBLIC_DATA_SOURCE=MOCK` is explicitly set. Remove that variable or set it
to a non-`MOCK` value when testing Supabase.
