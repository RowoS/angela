CREATE OR REPLACE VIEW public.activity_log_detailed WITH (security_invoker = on) AS
SELECT
  al.id,
  al.actor_id,
  p.full_name AS actor_name,
  p.role      AS actor_role,
  al.action,
  al.entity_type,
  al.entity_id,
  al.metadata,
  al.created_at,
  COALESCE(
    CASE WHEN al.entity_type = 'ticket'           THEN t.ticket_number || ' — ' || t.title END,
    CASE WHEN al.entity_type = 'room_reservation' THEN rr.title END,
    CASE WHEN al.entity_type = 'conference_room'  THEN cr.name END,
    CASE WHEN al.entity_type = 'sla'              THEN s.name END,
    CASE WHEN al.entity_type = 'event'            THEN e.title END
  ) AS subject
FROM public.activity_log al
LEFT JOIN public.profiles          p  ON p.id = al.actor_id
LEFT JOIN public.tickets           t  ON al.entity_type = 'ticket'           AND t.id  = al.entity_id
LEFT JOIN public.room_reservations rr ON al.entity_type = 'room_reservation' AND rr.id = al.entity_id
LEFT JOIN public.conference_rooms  cr ON al.entity_type = 'conference_room'  AND cr.id = al.entity_id
LEFT JOIN public.slas              s  ON al.entity_type = 'sla'              AND s.id  = al.entity_id
LEFT JOIN public.events            e  ON al.entity_type = 'event'            AND e.id  = al.entity_id; -- Added Event Join

GRANT SELECT ON public.activity_log_detailed TO authenticated;
REVOKE ALL ON public.activity_log_detailed FROM anon;