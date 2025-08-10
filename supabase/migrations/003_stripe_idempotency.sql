-- Migration: Add Stripe webhook idempotency table
-- Created: 2025-08-10
-- Purpose: Prevent double-processing of Stripe webhook events

-- Create stripe_events table for idempotency
create table if not exists stripe_events (
    id text primary key, -- Stripe event ID
    type text not null, -- Event type (e.g., 'checkout.session.completed')
    payload jsonb not null, -- Full event payload for debugging
    processed_at timestamp with time zone default timezone('utc'::text, now()),
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index for faster lookups by event type
create index if not exists idx_stripe_events_type on stripe_events(type);

-- Index for cleanup queries (optional - remove old events after 30 days)
create index if not exists idx_stripe_events_created_at on stripe_events(created_at);

-- Enable row-level security
alter table stripe_events enable row level security;

-- Create policy for service role access (webhooks run with service role)
create policy "Service role can manage stripe events" on stripe_events
    for all using (auth.role() = 'service_role');

-- Optional: Add a function to clean up old events (run this manually or via cron)
create or replace function cleanup_old_stripe_events()
returns void
language plpgsql
security definer
as $$
begin
    delete from stripe_events 
    where created_at < now() - interval '30 days';
end;
$$;

-- Comment on the cleanup function
comment on function cleanup_old_stripe_events() is 'Removes Stripe events older than 30 days to keep table size manageable';
