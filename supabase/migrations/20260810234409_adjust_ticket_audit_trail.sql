DROP VIEW IF EXISTS public.ticket_audit_trail;

CREATE VIEW public.ticket_audit_trail
WITH (security_invoker = on) AS
SELECT
  h.id,
  CASE
    WHEN h.from_status = 'pending_confirmation' AND h.to_status = 'open'
      THEN 'ticket.verified'
    ELSE 'ticket.status_changed'
  END                                     AS action,
  'ticket'::text                          AS entity_type,
  h.ticket_id                             AS entity_id,
  COALESCE(h.changed_by_profile_id, h.changed_by_employee_id) AS actor_id,
  COALESCE(prof.full_name, emp.full_name) AS actor_name,
  prof.role                               AS actor_role,
  t.ticket_number || ' — ' || t.title     AS subject,
  jsonb_build_object(
    'from_status', h.from_status,
    'to_status',   h.to_status,
    'note',        h.note
  )                                        AS metadata,
  h.created_at
FROM public.ticket_status_history h
JOIN public.tickets t              ON t.id = h.ticket_id
LEFT JOIN public.profiles prof     ON prof.id = h.changed_by_profile_id
LEFT JOIN public.employees emp     ON emp.id = h.changed_by_employee_id

UNION ALL

SELECT
  a.id,
  a.action,
  a.entity_type,
  a.entity_id,
  a.actor_id,
  p.full_name                             AS actor_name,
  p.role                                  AS actor_role,
  t.ticket_number || ' — ' || t.title     AS subject,
  a.metadata,
  a.created_at
FROM public.activity_log a
JOIN public.tickets t          ON t.id = a.entity_id
LEFT JOIN public.profiles p    ON p.id = a.actor_id
WHERE a.entity_type = 'ticket'
  AND a.action NOT IN ('ticket.status_changed', 'ticket.verified')

ORDER BY created_at;

GRANT SELECT ON public.ticket_audit_trail TO authenticated;
REVOKE ALL ON public.ticket_audit_trail FROM anon;