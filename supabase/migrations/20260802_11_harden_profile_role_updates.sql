-- Prevent users from promoting their own profile role.
-- Run and verify on a test project before applying to production.

begin;

create or replace function public.protect_profile_role_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and coalesce(auth.role(), '') <> 'service_role'
     and session_user not in ('postgres', 'supabase_admin')
     and not public.is_admin() then
    raise exception 'PROFILE_ROLE_UPDATE_FORBIDDEN';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_role_update on public.profiles;
create trigger profiles_protect_role_update
before update of role on public.profiles
for each row
execute function public.protect_profile_role_update();

revoke execute on function public.protect_profile_role_update()
from public, anon, authenticated;

commit;

-- Pre-deployment audit: every privileged account must be operator-approved.
-- select id, email, role from public.profiles
-- where role in ('admin', 'super_admin') order by email;

-- Test expectations:
-- 1. customer changing own role -> PROFILE_ROLE_UPDATE_FORBIDDEN
-- 2. customer updating allowed profile fields without changing role -> succeeds
-- 3. existing admin changing another profile role -> succeeds under current policy
-- 4. service_role role update -> succeeds

-- Rollback:
-- drop trigger if exists profiles_protect_role_update on public.profiles;
-- drop function if exists public.protect_profile_role_update();
