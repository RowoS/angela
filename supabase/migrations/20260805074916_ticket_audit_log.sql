-- Unifies ticket_status_history (rich status-transition detail) with
-- activity_log (lifecycle events: created, assigned, deleted, commented,
-- attachment added). Status-change rows from activity_log are dropped in
-- favor of the richer ticket_status_history record for the same event.
CREATE OR REPLACE VIEW public.ticket_audit_trail
WITH (security_invoker = on) AS
SELECT
  h.id,
  h.ticket_id,
  'status_change'::text          AS event_type,
  h.changed_by_profile_id        AS actor_id,
  h.changed_by_employee_id,
  jsonb_build_object(
    'from_status', h.from_status,
    'to_status',   h.to_status,
    'note',        h.note
  )                               AS metadata,
  h.created_at
FROM public.ticket_status_history h

UNION ALL

SELECT
  a.id,
  a.entity_id                    AS ticket_id,
  a.action                       AS event_type,
  a.actor_id,
  NULL::uuid                     AS changed_by_employee_id,
  a.metadata,
  a.created_at
FROM public.activity_log a
WHERE a.entity_type = 'ticket'
  AND a.action NOT IN ('ticket.status_changed', 'ticket.verified')

ORDER BY created_at;

GRANT SELECT ON public.ticket_audit_trail TO authenticated;

-- Comments and attachments never wrote to activity_log — closing that gap
-- here so the view above is actually complete, not just status + lifecycle.
CREATE OR REPLACE FUNCTION public.log_ticket_comment()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
begin
  insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    'ticket.commented',
    'ticket',
    new.ticket_id,
    jsonb_build_object('comment_id', new.id, 'is_internal', new.is_internal)
  );
  return new;
end;
$function$;

CREATE TRIGGER trg_log_ticket_comment
  AFTER INSERT ON public.ticket_comments
  FOR EACH ROW EXECUTE FUNCTION public.log_ticket_comment();

CREATE OR REPLACE FUNCTION public.log_ticket_attachment()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
begin
  insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    'ticket.attachment_added',
    'ticket',
    new.tickets_id,
    jsonb_build_object('attachment_id', new.id, 'filename', new.original_filename)
  );
  return new;
end;
$function$;

CREATE TRIGGER trg_log_ticket_attachment
  AFTER INSERT ON public.ticket_attachments
  FOR EACH ROW EXECUTE FUNCTION public.log_ticket_attachment();


ALTER POLICY activity_log_select_staff ON public.activity_log
  USING (
    (( SELECT auth.role() ) = 'authenticated'::text)
    AND (
      entity_type <> 'ticket'
      OR public.can_view_ticket(entity_id::uuid)
    )
  );