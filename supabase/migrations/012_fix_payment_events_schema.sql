-- ============================================================================
-- 012: Fix payment_events schema for webhook-handler
-- ============================================================================
-- - Adds `event_id` column (text, UNIQUE) for webhook idempotency.
-- - Adds `processed_at` timestamp column for audit trail.
-- The webhook-handler edge function stores raw events keyed by event_id and
-- marks them processed; the original 001 schema did not include these columns.
-- Run in the Supabase SQL Editor.
-- ============================================================================

-- ---------------------
-- 1. Add event_id column
-- ---------------------
alter table public.payment_events
  add column if not exists event_id text;

-- ---------------------
-- 2. Unique constraint on event_id for idempotency
-- ---------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'payment_events_event_id_unique'
  ) then
    alter table public.payment_events
      add constraint payment_events_event_id_unique unique (event_id);
  end if;
end $$;

-- ---------------------
-- 3. Index on event_id for fast lookups
-- ---------------------
create index if not exists idx_payment_events_event_id
  on public.payment_events(event_id);

-- ---------------------
-- 4. Add processed_at column
-- ---------------------
alter table public.payment_events
  add column if not exists processed_at timestamptz;
