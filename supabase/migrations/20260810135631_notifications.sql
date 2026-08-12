-- Migration: notifications
-- Per-recipient in-app notification rows, populated by triggers so
-- every write path to tickets/ticket_comments is covered without
-- relying on application code to remember to call a notify() helper.

SET check_function_bodies = false;

CREATE TABLE public.notifications (
  id           uuid                     DEFAULT gen_random_uuid() NOT NULL,
  recipient_id uuid                     NOT NULL,
  event_type   public.notification_event NOT NULL,
  entity_type  text                     NOT NULL,
  entity_id    uuid                     NOT NULL,
  title        text                     NOT NULL,
  body         text,
  is_read      boolean                  NOT NULL DEFAULT false,
  created_at   timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX notifications_recipient_id_created_at_idx ON public.notifications (recipient_id, created_at DESC);
CREATE INDEX notifications_recipient_id_unread_idx ON public.notifications (recipient_id) WHERE is_read = false;

ALTER TABLE public.notifications
  ENABLE ROW LEVEL SECURITY;

-- ALTER DEFAULT PRIVILEGES (20260730080138) grants ALL on new tables to
-- anon/authenticated by default — explicitly claw that back here.
-- Rows are written exclusively by SECURITY DEFINER trigger functions
-- and the service-role cron job, never directly by a client; the only
-- client-initiated write is toggling is_read on your own row.
REVOKE INSERT, DELETE ON public.notifications FROM anon;
REVOKE INSERT, DELETE ON public.notifications FROM authenticated;
REVOKE ALL ON public.notifications FROM anon;

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT
  USING (recipient_id = ( SELECT auth.uid() ));

CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE
  USING (recipient_id = ( SELECT auth.uid() ))
  WITH CHECK (recipient_id = ( SELECT auth.uid() ));

-- Core fan-in point: checks the admin-configured toggle from
-- notification_settings before inserting. A disabled event, or a null
-- recipient (e.g. an unassigned ticket), is a silent no-op — this
-- function is called from inside other triggers' transactions, so it
-- must never raise for either of those ordinary cases.
CREATE FUNCTION public.notify_user (
  p_recipient_id uuid,
  p_event        public.notification_event,
  p_entity_type  text,
  p_entity_id    uuid,
  p_title        text,
  p_body         text DEFAULT NULL::text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_enabled boolean;
begin
  if p_recipient_id is null then
    return;
  end if;

  select in_app into v_enabled from public.notification_settings where event_type = p_event;
  if not coalesce(v_enabled, true) then
    return;
  end if;

  insert into public.notifications (recipient_id, event_type, entity_type, entity_id, title, body)
  values (p_recipient_id, p_event, p_entity_type, p_entity_id, p_title, p_body);
end;
$function$;

GRANT ALL ON FUNCTION public.notify_user(uuid, public.notification_event, text, uuid, text, text) TO service_role;

-- Ticket recipients are the assignee plus ticket_watchers, deduplicated
-- so an assignee who's also a watcher isn't notified twice, and with
-- an optional exclusion for the user who triggered the event (e.g. a
-- commenter shouldn't be notified about their own comment).
CREATE FUNCTION public.notify_ticket_watchers_and_assignee (
  p_ticket_id    uuid,
  p_event        public.notification_event,
  p_title        text,
  p_body         text DEFAULT NULL::text,
  p_exclude_user uuid DEFAULT NULL::uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_assignee uuid;
  r record;
begin
  select assigned_to_id into v_assignee from public.tickets where id = p_ticket_id;

  if v_assignee is not null and v_assignee is distinct from p_exclude_user then
    perform public.notify_user(v_assignee, p_event, 'ticket', p_ticket_id, p_title, p_body);
  end if;

  for r in
    select w.user_id
    from public.ticket_watchers w
    where w.ticket_id = p_ticket_id
      and w.user_id is distinct from v_assignee
      and w.user_id is distinct from p_exclude_user
  loop
    perform public.notify_user(r.user_id, p_event, 'ticket', p_ticket_id, p_title, p_body);
  end loop;
end;
$function$;

GRANT ALL ON FUNCTION public.notify_ticket_watchers_and_assignee(uuid, public.notification_event, text, text, uuid) TO service_role;

-- Fires on every ticket UPDATE regardless of which of the several
-- code paths performed it. app.confirming_employee_id is the same
-- transaction-local flag close_ticket_via_qr / confirm_ticket_creation_via_qr
-- already set for log_status_change — reusing it here distinguishes a
-- QR-driven transition from a plain staff status change without
-- duplicating that signal.
CREATE FUNCTION public.notify_ticket_update()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_confirming_employee uuid := nullif(current_setting('app.confirming_employee_id', true), '')::uuid;
  v_actor uuid := auth.uid();
begin
  if old.status = 'pending_confirmation' and new.status = 'open' then
    if v_confirming_employee is not null then
      perform public.notify_ticket_watchers_and_assignee(
        new.id, 'qr_confirmed',
        'Ticket ' || new.ticket_number || ' confirmed by requester',
        new.title, v_actor
      );
    else
      perform public.notify_ticket_watchers_and_assignee(
        new.id, 'ticket_created',
        'Ticket ' || new.ticket_number || ' confirmed',
        new.title, v_actor
      );
    end if;
  elsif new.status = 'closed' and old.status is distinct from 'closed' and v_confirming_employee is not null then
    perform public.notify_ticket_watchers_and_assignee(
      new.id, 'qr_closed',
      'Ticket ' || new.ticket_number || ' closed by requester',
      new.title, v_actor
    );
  elsif new.status is distinct from old.status then
    perform public.notify_ticket_watchers_and_assignee(
      new.id, 'status_changed',
      'Ticket ' || new.ticket_number || ' is now ' || new.status,
      new.title, v_actor
    );
  end if;

  if new.assigned_to_id is distinct from old.assigned_to_id and new.assigned_to_id is not null then
    perform public.notify_user(
      new.assigned_to_id, 'ticket_assigned',
      'ticket', new.id,
      'Ticket ' || new.ticket_number || ' assigned to you',
      new.title
    );
  end if;

  return new;
end;
$function$;

GRANT ALL ON FUNCTION public.notify_ticket_update() TO anon;
GRANT ALL ON FUNCTION public.notify_ticket_update() TO authenticated;
GRANT ALL ON FUNCTION public.notify_ticket_update() TO service_role;

CREATE TRIGGER trg_notify_ticket_update
  AFTER UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_ticket_update();

CREATE FUNCTION public.notify_ticket_comment()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_ticket_number text;
  v_event public.notification_event;
begin
  select ticket_number into v_ticket_number from public.tickets where id = new.ticket_id;
  v_event := case when new.is_internal then 'comment_internal' else 'comment_public' end;

  perform public.notify_ticket_watchers_and_assignee(
    new.ticket_id, v_event,
    'New comment on ' || coalesce(v_ticket_number, 'ticket'),
    left(new.body, 140),
    new.user_id
  );

  return new;
end;
$function$;

GRANT ALL ON FUNCTION public.notify_ticket_comment() TO anon;
GRANT ALL ON FUNCTION public.notify_ticket_comment() TO authenticated;
GRANT ALL ON FUNCTION public.notify_ticket_comment() TO service_role;

CREATE TRIGGER trg_notify_ticket_comment
  AFTER INSERT ON public.ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_ticket_comment();

-- SLA warning/breach are time-based, not row-change events, so they
-- can't be triggers — a periodic job has to ask "is anything due
-- soon?" These two columns make that job idempotent: without them,
-- every cron run would re-notify every still-overdue ticket.
ALTER TABLE public.tickets
  ADD COLUMN sla_warning_notified_at timestamp with time zone,
  ADD COLUMN sla_breach_notified_at  timestamp with time zone;

-- Reset both flags whenever SLA deadlines are (re)computed, so a
-- ticket that gets reconfirmed after expiring can be warned about
-- again instead of staying permanently silenced by a stale flag.
CREATE OR REPLACE FUNCTION public.set_ticket_sla_deadlines()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_sla public.slas;
begin
  if new.status = 'open' and old.status = 'pending_confirmation' then
    select * into v_sla from public.slas where priority = new.priority;
    if found then
      new.first_response_due_at := now() + (v_sla.first_response_minutes || ' minutes')::interval;
      new.due_at := now() + (v_sla.resolution_minutes || ' minutes')::interval;
      new.sla_warning_notified_at := null;
      new.sla_breach_notified_at := null;
    end if;
  end if;
  return new;
end;
$function$;

-- Mirrors dashboard_ticket_counts' approaching/breached window exactly
-- (1-hour lookahead for "approaching"), so what the cron notifies
-- about matches what the dashboard already shows as amber/red — no
-- separate threshold to keep in sync by hand.
CREATE FUNCTION public.run_sla_notifications()
  RETURNS TABLE(warned_count integer, breached_count integer)
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_warned integer := 0;
  v_breached integer := 0;
  r record;
begin
  for r in
    select id, ticket_number, title
    from public.tickets
    where deleted_at is null
      and status not in ('resolved', 'closed')
      and sla_warning_notified_at is null
      and (
        (first_response_at is null and first_response_due_at is not null
          and first_response_due_at > now() and first_response_due_at <= now() + interval '1 hour')
        or
        (due_at is not null and due_at > now() and due_at <= now() + interval '1 hour')
      )
  loop
    perform public.notify_ticket_watchers_and_assignee(
      r.id, 'sla_warning',
      'SLA approaching for ' || r.ticket_number,
      r.title
    );
    update public.tickets set sla_warning_notified_at = now() where id = r.id;
    v_warned := v_warned + 1;
  end loop;

  for r in
    select id, ticket_number, title
    from public.tickets
    where deleted_at is null
      and status not in ('resolved', 'closed')
      and sla_breach_notified_at is null
      and (
        (first_response_at is null and first_response_due_at is not null and first_response_due_at <= now())
        or
        (resolved_at is null and due_at is not null and due_at <= now())
      )
  loop
    perform public.notify_ticket_watchers_and_assignee(
      r.id, 'sla_breached',
      'SLA breached for ' || r.ticket_number,
      r.title
    );
    update public.tickets set sla_breach_notified_at = now() where id = r.id;
    v_breached := v_breached + 1;
  end loop;

  return query select v_warned, v_breached;
end;
$function$;

GRANT ALL ON FUNCTION public.run_sla_notifications() TO service_role;