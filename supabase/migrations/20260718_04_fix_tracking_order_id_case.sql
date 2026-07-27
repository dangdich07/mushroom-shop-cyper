-- Forward fix for databases that already ran 20260717_02.
-- Generated order IDs contain lowercase hexadecimal characters, so tracking
-- must preserve the exact ID casing stored in public.orders.

begin;

create or replace function public.get_public_order_tracking(
  p_order_id text,
  p_tracking_token text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_logs jsonb;
begin
  if p_tracking_token is null or char_length(p_tracking_token) > 200 then
    return jsonb_build_object('success',false,'error_code','TRACKING_NOT_FOUND');
  end if;

  select * into v_order
  from public.orders
  where id = btrim(p_order_id)
    and tracking_token_hash = extensions.digest(p_tracking_token,'sha256');

  if not found then
    return jsonb_build_object('success',false,'error_code','TRACKING_NOT_FOUND');
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id',id,
        'title',title,
        'description',description,
        'created_at',created_at
      ) order by created_at desc
    ),
    '[]'::jsonb
  ) into v_logs
  from public.order_tracking
  where order_id = v_order.id
    and is_public = true;

  return jsonb_build_object(
    'success',true,
    'order_id',v_order.id,
    'status',v_order.status,
    'logs',v_logs
  );
end;
$$;

revoke execute on function public.get_public_order_tracking(text,text)
  from public, anon, authenticated, service_role;
grant execute on function public.get_public_order_tracking(text,text)
  to anon, authenticated, service_role;

commit;

-- Rollback: restore the previous function body only if order IDs have first
-- been normalized consistently. Revoking this RPC is safer than restoring the
-- broken uppercase comparison.
