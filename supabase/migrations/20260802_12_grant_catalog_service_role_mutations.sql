-- Minimum table privileges for authenticated Admin catalog Server Actions.
begin;

grant insert, update, delete on table public.products to service_role;
grant insert, update, delete on table public.product_variants to service_role;
grant insert, update, delete on table public.product_images to service_role;

commit;

-- Verification:
-- select
--   has_table_privilege('service_role','public.products','INSERT,UPDATE,DELETE') as products_mutation,
--   has_table_privilege('service_role','public.product_variants','INSERT,UPDATE,DELETE') as variants_mutation,
--   has_table_privilege('service_role','public.product_images','INSERT,UPDATE,DELETE') as images_mutation;

-- Rollback:
-- revoke insert, update, delete on table public.products from service_role;
-- revoke insert, update, delete on table public.product_variants from service_role;
-- revoke insert, update, delete on table public.product_images from service_role;
