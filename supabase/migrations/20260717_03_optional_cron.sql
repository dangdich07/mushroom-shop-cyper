-- Optional Supabase Cron configuration. This file does not enable pg_cron.
-- It schedules jobs only when the extension is already enabled in the project.

do $$
begin
  if exists (select 1 from pg_extension where extname='pg_cron') then
    if not exists (select 1 from cron.job where jobname='cybermush-expire-vietqr') then
      perform cron.schedule('cybermush-expire-vietqr','* * * * *',
        $job$select public.process_expired_reservations('VIETQR',100);$job$);
    end if;
    if not exists (select 1 from cron.job where jobname='cybermush-expire-cod') then
      perform cron.schedule('cybermush-expire-cod','*/5 * * * *',
        $job$select public.process_expired_reservations('COD',100);$job$);
    end if;
    if not exists (select 1 from cron.job where jobname='cybermush-clean-idempotency') then
      perform cron.schedule('cybermush-clean-idempotency','17 * * * *',
        $job$select public.cleanup_checkout_idempotency(500);$job$);
    end if;
  else
    raise notice 'pg_cron is not enabled; reservation expiry is NOT automated.';
  end if;
end
$$;

-- Rollback jobs:
-- select cron.unschedule('cybermush-expire-vietqr');
-- select cron.unschedule('cybermush-expire-cod');
-- select cron.unschedule('cybermush-clean-idempotency');
