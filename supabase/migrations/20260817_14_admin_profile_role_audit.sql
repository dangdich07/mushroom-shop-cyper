-- Atomic, audited role changes for the hardened admin users interface.
-- Existing profiles and roles are not modified by this migration.

begin;

create table if not exists public.profile_role_audit (
  id uuid primary key default extensions.gen_random_uuid(),
  target_user_id uuid not null references auth.users(id) on delete restrict,
  actor_id uuid not null references auth.users(id) on delete restrict,
  previous_role public.user_role not null,
  new_role public.user_role not null,
  reason text not null check (char_length(btrim(reason)) between 3 and 500),
  created_at timestamptz not null default now()
);

create index if not exists profile_role_audit_target_created_idx
  on public.profile_role_audit(target_user_id, created_at desc);
create index if not exists profile_role_audit_actor_created_idx
  on public.profile_role_audit(actor_id, created_at desc);

alter table public.profile_role_audit enable row level security;
revoke all on table public.profile_role_audit from public, anon, authenticated;
grant select, insert on table public.profile_role_audit to service_role;

create or replace function public.admin_update_profile_role(
  p_target_user_id uuid,
  p_new_role public.user_role,
  p_reason text,
  p_actor_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_role public.user_role;
  v_target_role public.user_role;
begin
  if p_target_user_id is null or p_actor_id is null or p_new_role is null
     or char_length(btrim(coalesce(p_reason, ''))) not between 3 and 500 then
    return jsonb_build_object('success', false, 'error_code', 'INVALID_ROLE_CHANGE');
  end if;
  if p_target_user_id = p_actor_id then
    return jsonb_build_object('success', false, 'error_code', 'SELF_ROLE_CHANGE_FORBIDDEN');
  end if;

  select p.role into v_actor_role
  from public.profiles p
  where p.id = p_actor_id
  for update;
  if not found or v_actor_role not in ('admin', 'super_admin') then
    return jsonb_build_object('success', false, 'error_code', 'ADMIN_ACCESS_FORBIDDEN');
  end if;

  select p.role into v_target_role
  from public.profiles p
  where p.id = p_target_user_id
  for update;
  if not found then
    return jsonb_build_object('success', false, 'error_code', 'PROFILE_NOT_FOUND');
  end if;
  if v_target_role = p_new_role then
    return jsonb_build_object('success', true, 'idempotent', true, 'role', p_new_role);
  end if;

  if v_actor_role = 'admin' and (
    v_target_role not in ('customer', 'staff')
    or p_new_role not in ('customer', 'staff')
  ) then
    return jsonb_build_object('success', false, 'error_code', 'SUPER_ADMIN_REQUIRED');
  end if;

  update public.profiles
  set role = p_new_role,
      updated_at = now()
  where id = p_target_user_id;

  insert into public.profile_role_audit(
    target_user_id, actor_id, previous_role, new_role, reason
  ) values (
    p_target_user_id, p_actor_id, v_target_role, p_new_role, btrim(p_reason)
  );

  return jsonb_build_object('success', true, 'role', p_new_role);
end;
$$;

revoke execute on function public.admin_update_profile_role(uuid, public.user_role, text, uuid)
  from public, anon, authenticated;
grant execute on function public.admin_update_profile_role(uuid, public.user_role, text, uuid)
  to service_role;

commit;

-- Verification:
-- select
--   has_function_privilege('anon', 'public.admin_update_profile_role(uuid,public.user_role,text,uuid)', 'EXECUTE') as anon_execute,
--   has_function_privilege('authenticated', 'public.admin_update_profile_role(uuid,public.user_role,text,uuid)', 'EXECUTE') as authenticated_execute,
--   has_function_privilege('service_role', 'public.admin_update_profile_role(uuid,public.user_role,text,uuid)', 'EXECUTE') as service_role_execute;
-- Expected: false, false, true.

-- Rollback only before the RPC is used:
-- revoke execute on function public.admin_update_profile_role(uuid,public.user_role,text,uuid) from service_role;
-- drop function public.admin_update_profile_role(uuid,public.user_role,text,uuid);
-- drop table public.profile_role_audit;
-- After audit records exist, retain the table and deploy a forward fix.
