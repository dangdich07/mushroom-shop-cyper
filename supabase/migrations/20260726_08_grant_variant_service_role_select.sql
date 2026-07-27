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
