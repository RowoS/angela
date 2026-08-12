-- Migration: notifications_realtime
-- Two pieces of Supabase-specific plumbing the notifications table needs
-- that "create the table" doesn't imply — both fail silently rather
-- than erroring, which is exactly what made them easy to miss.
 
-- postgres_changes subscriptions get nothing at all without this: no
-- error anywhere, the channel just never receives an event.
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
 
-- Without FULL, Postgres logical replication only includes primary-key
-- columns in payload.old on UPDATE. use-notifications.ts's
-- `old.is_read === false` check silently evaluates against `undefined`
-- instead of the real prior value, breaking cross-tab/cross-device
-- unread-count sync specifically (the local optimistic update masks
-- this for the tab that actually clicked "mark as read").
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
