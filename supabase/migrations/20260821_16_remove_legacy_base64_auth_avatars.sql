-- Remove legacy inline avatars from Auth metadata.
--
-- Base64 images stored in raw_user_meta_data are embedded in the Supabase JWT.
-- A sufficiently large avatar therefore produces oversized session cookies and
-- can make recovery callbacks fail with ERR_RESPONSE_HEADERS_TOO_BIG.
-- Current application code uploads avatars to the `avatars` Storage bucket and
-- stores only the resulting short public URL, so inline image data is obsolete.

begin;

update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) - 'avatar_url'
where coalesce(raw_user_meta_data ->> 'avatar_url', '') like 'data:image/%';

update public.profiles
set avatar_url = null,
    updated_at = now()
where coalesce(avatar_url, '') like 'data:image/%';

commit;

-- Verification (both counts must be zero):
-- select count(*) from auth.users
-- where coalesce(raw_user_meta_data ->> 'avatar_url', '') like 'data:image/%';
-- select count(*) from public.profiles
-- where coalesce(avatar_url, '') like 'data:image/%';

-- Rollback: removed inline image data cannot be restored safely. Users should
-- upload the avatar again so it is stored in the `avatars` Storage bucket.
