-- Logs plain calendar-event create/update/delete. Explicitly excludes any
-- row where room_reservation_id is non-null on either side of the
-- transition — those writes originate from sync_room_reservation_event /
-- annotate_deleted_reservation_event and are already logged under
-- room_reservation.* actions. Logging both would double-count a single
-- user action (e.g. reserving a room shows up as both
-- "room_reservation.created" and "event.created" for the same click).
CREATE OR REPLACE FUNCTION public.log_event_activity()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  if tg_op = 'INSERT' then
    if new.room_reservation_id is not null then
      return new;
    end if;

    insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
    values (
      auth.uid(),
      'event.created',
      'event',
      new.id,
      jsonb_build_object(
        'title', new.title,
        'event_type', new.event_type,
        'starts_at', new.starts_at,
        'ends_at', new.ends_at,
        'ticket_id', new.ticket_id
      )
    );
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.room_reservation_id is not null or new.room_reservation_id is not null then
      return new;
    end if;

    if new.title       is distinct from old.title or
       new.description is distinct from old.description or
       new.event_type   is distinct from old.event_type or
       new.ticket_id     is distinct from old.ticket_id or
       new.starts_at     is distinct from old.starts_at or
       new.ends_at       is distinct from old.ends_at
    then
      insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
      values (
        auth.uid(),
        'event.updated',
        'event',
        new.id,
        jsonb_build_object(
          'from', jsonb_build_object('title', old.title, 'event_type', old.event_type, 'starts_at', old.starts_at, 'ends_at', old.ends_at),
          'to',   jsonb_build_object('title', new.title, 'event_type', new.event_type, 'starts_at', new.starts_at, 'ends_at', new.ends_at)
        )
      );
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.room_reservation_id is not null then
      return old;
    end if;

    insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
    values (
      auth.uid(),
      'event.deleted',
      'event',
      old.id,
      jsonb_build_object('title', old.title, 'event_type', old.event_type, 'starts_at', old.starts_at)
    );
    return old;
  end if;

  return null;
end;
$function$;

GRANT ALL ON FUNCTION public.log_event_activity() TO anon;
GRANT ALL ON FUNCTION public.log_event_activity() TO authenticated;
GRANT ALL ON FUNCTION public.log_event_activity() TO service_role;

CREATE TRIGGER trg_log_event_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.log_event_activity();