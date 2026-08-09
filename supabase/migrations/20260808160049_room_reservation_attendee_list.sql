SET check_function_bodies = false;

ALTER TABLE public.room_reservations
  ADD COLUMN attendee_note text;

-- Signature is changing (new trailing param), so the old overload has to
-- go first — CREATE OR REPLACE only replaces an exact signature match,
-- and leaving both around would make a 5-arg call ambiguous between
-- "the old function" and "the new one using its default".
DROP FUNCTION IF EXISTS public.create_room_reservation(uuid, text, timestamp with time zone, timestamp with time zone, uuid);

CREATE FUNCTION public.create_room_reservation (
  p_room_id       uuid,
  p_title         text,
  p_starts_at     timestamp with time zone,
  p_ends_at       timestamp with time zone,
  p_event_id      uuid DEFAULT NULL::uuid,
  p_attendee_note text DEFAULT NULL::text
)
  RETURNS public.room_reservations
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_row public.room_reservations;
begin
  if p_event_id is not null then
    if not exists (
      select 1 from public.events e
      where e.id = p_event_id
        and e.room_reservation_id is null
        and public.can_edit_event(p_event_id)
    ) then
      raise exception 'That event is not available to attach a room reservation to.';
    end if;

    perform set_config('app.attach_to_event_id', p_event_id::text, true);
  end if;

  insert into public.room_reservations (room_id, organizer_id, title, starts_at, ends_at, attendee_note)
  values (p_room_id, auth.uid(), p_title, p_starts_at, p_ends_at, p_attendee_note)
  returning * into v_row;

  return v_row;
end;
$function$;

GRANT ALL ON FUNCTION public.create_room_reservation(uuid, text, timestamp with time zone, timestamp with time zone, uuid, text) TO anon;
GRANT ALL ON FUNCTION public.create_room_reservation(uuid, text, timestamp with time zone, timestamp with time zone, uuid, text) TO authenticated;
GRANT ALL ON FUNCTION public.create_room_reservation(uuid, text, timestamp with time zone, timestamp with time zone, uuid, text) TO service_role;