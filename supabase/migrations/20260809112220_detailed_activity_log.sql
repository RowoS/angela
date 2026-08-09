create or replace view public.activity_log_detailed
with (security_invoker = on) as
select
  al.id,
  al.actor_id,
  p.full_name as actor_name,
  p.role      as actor_role,
  al.action,
  al.entity_type,
  al.entity_id,
  al.metadata,
  al.created_at,
  coalesce(
    case when al.entity_type = 'ticket'           then t.ticket_number || ' — ' || t.title end,
    case when al.entity_type = 'room_reservation'  then rr.title end,
    case when al.entity_type = 'conference_room'   then cr.name end,
    case when al.entity_type = 'sla'               then s.name end
  ) as subject
from public.activity_log al
left join public.profiles          p  on p.id = al.actor_id
left join public.tickets           t  on al.entity_type = 'ticket'           and t.id  = al.entity_id
left join public.room_reservations rr on al.entity_type = 'room_reservation' and rr.id = al.entity_id
left join public.conference_rooms  cr on al.entity_type = 'conference_room'  and cr.id = al.entity_id
left join public.slas              s  on al.entity_type = 'sla'              and s.id  = al.entity_id;

grant select on public.activity_log_detailed to authenticated;
revoke all on public.activity_log_detailed from anon;