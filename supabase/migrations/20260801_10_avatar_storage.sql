-- Account avatar storage. Run on a test project before production.
-- Public reads are intentional for profile images; writes remain owner-only.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

do $$
declare
  v_public boolean;
  v_file_size_limit bigint;
  v_allowed_mime_types text[];
begin
  select public, file_size_limit, allowed_mime_types
  into v_public, v_file_size_limit, v_allowed_mime_types
  from storage.buckets
  where id = 'avatars';

  if v_public is distinct from true
     or v_file_size_limit is distinct from 2097152
     or v_allowed_mime_types is null
     or not v_allowed_mime_types @> array['image/jpeg', 'image/png', 'image/webp']::text[]
     or not array['image/jpeg', 'image/png', 'image/webp']::text[] @> v_allowed_mime_types then
    raise exception 'AVATAR_BUCKET_PREFLIGHT_FAILED: expected public bucket with 2MB JPEG/PNG/WebP limit';
  end if;
end
$$;

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read
on storage.objects
for select
to public
using (bucket_id = 'avatars');

drop policy if exists avatars_owner_insert on storage.objects;
create policy avatars_owner_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists avatars_owner_update on storage.objects;
create policy avatars_owner_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists avatars_owner_delete on storage.objects;
create policy avatars_owner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

commit;

-- Rollback (only after removing references from user/profile metadata):
-- drop policy if exists avatars_owner_delete on storage.objects;
-- drop policy if exists avatars_owner_update on storage.objects;
-- drop policy if exists avatars_owner_insert on storage.objects;
-- drop policy if exists avatars_public_read on storage.objects;
-- delete from storage.objects where bucket_id = 'avatars';
-- delete from storage.buckets where id = 'avatars';
