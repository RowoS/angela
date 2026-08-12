SET check_function_bodies = false;
 
CREATE TYPE public.notification_event AS ENUM (
  'ticket_created',
  'status_changed',
  'ticket_assigned',
  'comment_public',
  'comment_internal',
  'qr_confirmed',
  'qr_closed',
  'sla_warning',
  'sla_breached',
  'room_reservation_created'
);
 
CREATE TABLE public.notification_settings (
  event_type public.notification_event NOT NULL,
  in_app     boolean                   NOT NULL DEFAULT true,
  updated_at timestamp with time zone  NOT NULL DEFAULT now()
);
 
ALTER TABLE public.notification_settings
  ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (event_type);
 
ALTER TABLE public.notification_settings
  ENABLE ROW LEVEL SECURITY;
 
GRANT ALL ON public.notification_settings TO authenticated;
GRANT ALL ON public.notification_settings TO service_role;
REVOKE ALL ON public.notification_settings FROM anon;
 
-- Every authenticated user (not just admins) needs read access — the
-- notification-dispatch code path checks this table for any user's
-- session, not just an admin's.
CREATE POLICY notification_settings_select_all ON public.notification_settings
  FOR SELECT
  USING (( SELECT auth.role() ) = 'authenticated');
 
CREATE POLICY notification_settings_manage_admin ON public.notification_settings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
 
CREATE TRIGGER trg_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
 
-- Seed one row per event, defaulted on. Row-per-event (not a single
-- jsonb blob) so RLS/grants apply uniformly and the UPDATE policy
-- above can't be bypassed by rewriting the whole row.
INSERT INTO public.notification_settings (event_type, in_app) VALUES
  ('ticket_created',            true),
  ('status_changed',            true),
  ('ticket_assigned',           true),
  ('comment_public',            true),
  ('comment_internal',          true),
  ('qr_confirmed',              true),
  ('qr_closed',                 true),
  ('sla_warning',                true),
  ('sla_breached',              true),
  ('room_reservation_created',  true)
ON CONFLICT (event_type) DO NOTHING;
