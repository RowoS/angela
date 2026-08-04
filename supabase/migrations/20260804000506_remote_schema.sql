-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

CREATE OR REPLACE FUNCTION public.annotate_deleted_reservation_event()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  update public.events
  set room_reservation_id = null,
      description = 'Room reservation was deleted. This event is no longer tied to a specific room.'
  where room_reservation_id = old.id;
 
  return old;
end;
$function$;

CREATE OR REPLACE FUNCTION public.assign_ticket (
  p_ticket_id uuid,
  p_agent_id  uuid,
  p_method    text,
  p_rule_id   uuid DEFAULT NULL::uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_caller_role text;
  v_prev_agent_id uuid;
begin
  if p_method not in ('manual', 'rule') then
    raise exception 'Invalid assignment method: %', p_method;
  end if;

  -- Authorization lives here, not just RLS, because security definer
  -- bypasses RLS entirely — this function IS the trust boundary now.
  -- Assumes only staff ever call this, including for rule-triggered
  -- assignment. Revisit if item 4's rule engine ends up running as a
  -- cron/service job with no authenticated staff user in context —
  -- that will need a separate service-role path, not this check.
  select role into v_caller_role from public.profiles where id = auth.uid();
  if v_caller_role not in ('admin', 'agent') then
    raise exception 'Not authorized to assign tickets.';
  end if;

  select assigned_to_id into v_prev_agent_id
  from public.tickets where id = p_ticket_id;

  if not found then
    raise exception 'Ticket % not found.', p_ticket_id;
  end if;

  update public.tickets
  set assigned_to_id = p_agent_id
  where id = p_ticket_id;

  insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    'ticket.assigned',
    'ticket',
    p_ticket_id,
    jsonb_build_object(
      'from', v_prev_agent_id,
      'to', p_agent_id,
      'method', p_method,
      'rule_id', p_rule_id
    )
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.can_act_on_ticket (
  _ticket_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select exists (
    select 1 from public.tickets t
    where t.id = _ticket_id
    and (
      public.is_admin()
      or t.assigned_to_id = auth.uid()
      or (t.assigned_to_id is null and public.current_role() = 'agent')
    )
  );
$function$;

CREATE OR REPLACE FUNCTION public.can_edit_event (
  _event_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select exists (
    select 1
    from public.events e
    join public.profiles owner on owner.id = e.owner_id
    where e.id = _event_id
    and (
      public.is_admin()
      or (public.current_role() = 'manager' and owner.department = public.current_department())
      or (public.current_role() = 'agent'   and e.owner_id = auth.uid())
    )
  );
$function$;

CREATE OR REPLACE FUNCTION public.can_manage_reservation (
  _reservation_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select exists (
    select 1 from public.room_reservations r
    where r.id = _reservation_id
    and (
      r.organizer_id = auth.uid()
      or public.is_admin()
    )
  );
$function$;

CREATE OR REPLACE FUNCTION public.can_view_ticket (
  _ticket_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select exists (
    select 1 from public.tickets t
    where t.id = _ticket_id
    and (
      t.assigned_to_id = auth.uid()
      or public.is_admin()
      or public.current_role() = 'agent'
      or (
        public.current_role() = 'manager'
        and t.department = public.current_department()
      )
    )
  );
$function$;

CREATE OR REPLACE FUNCTION public.close_ticket_via_qr (
  _ticket_id           uuid,
  _scanned_employee_no text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_employee_id     uuid;
  v_current_status  ticket_status;
begin
  if not public.can_act_on_ticket(_ticket_id) then
    raise exception 'Not authorized to close this ticket';
  end if;
 
  v_employee_id := public.verify_scanned_employee(_ticket_id, _scanned_employee_no);
 
  select status into v_current_status from public.tickets where id = _ticket_id;
 
  perform set_config('app.confirming_employee_id', v_employee_id::text, true);
 
  if v_current_status is distinct from 'resolved' then
    update public.tickets set status = 'resolved', resolved_at = now() where id = _ticket_id;
  end if;
 
  update public.tickets set status = 'closed', closed_at = now() where id = _ticket_id;
end;
$function$;

CREATE FUNCTION public.complete_password_setup()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  perform set_config('app.completing_password_setup', 'true', true);
  update public.profiles
  set password_reset_required = false
  where id = auth.uid();
end;
$function$;

GRANT ALL ON FUNCTION public.complete_password_setup() TO anon;

GRANT ALL ON FUNCTION public.complete_password_setup() TO authenticated;

GRANT ALL ON FUNCTION public.complete_password_setup() TO service_role;

CREATE OR REPLACE FUNCTION public.confirm_ticket_creation_via_qr (
  _ticket_id           uuid,
  _scanned_employee_no text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_employee_id uuid;
  v_status      ticket_status;
begin
  if not public.can_act_on_ticket(_ticket_id) then
    raise exception 'Not authorized to confirm this ticket';
  end if;
 
  select status into v_status from public.tickets where id = _ticket_id;
  if v_status is distinct from 'pending_confirmation' then
    raise exception 'Ticket is not awaiting confirmation (current status: %)', v_status;
  end if;
 
  v_employee_id := public.verify_scanned_employee(_ticket_id, _scanned_employee_no);
 
  perform set_config('app.confirming_employee_id', v_employee_id::text, true);
  update public.tickets set status = 'open' where id = _ticket_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.create_room_reservation (
  p_room_id   uuid,
  p_title     text,
  p_starts_at timestamp with time zone,
  p_ends_at   timestamp with time zone,
  p_event_id  uuid                     DEFAULT NULL::uuid
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
 
  insert into public.room_reservations (room_id, organizer_id, title, starts_at, ends_at)
  values (p_room_id, auth.uid(), p_title, p_starts_at, p_ends_at)
  returning * into v_row;
 
  return v_row;
end;
$function$;

CREATE OR REPLACE FUNCTION public.expire_stale_pending_tickets (
  cutoff interval DEFAULT '24:00:00'::interval
)
  RETURNS integer
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  affected integer;
begin
  -- No app.confirming_employee_id set here — this isn't tied to any
  -- one employee. changed_by_profile_id will also end up null, since
  -- there's no signed-in session on a scheduled job. Neither is meant
  -- to read as "no one did this" — the note below states the fact
  -- plainly instead: the request was cancelled, full stop.
  perform set_config(
    'app.status_change_note',
    'Ticket request has been cancelled after remaining unconfirmed for ' || cutoff::text || '.',
    true
  );
 
  update public.tickets
  set status = 'cancelled'
  where status = 'pending_confirmation'
    and created_at < now() - cutoff;
 
  get diagnostics affected = row_count;
  return affected;
end;
$function$;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_year int := extract(year from now())::int;
  v_code text;
  v_seq  bigint;
begin
  select code into v_code
  from public.ticket_categories
  where id = new.category_id;
 
  if v_code is null then
    raise exception 'Ticket category % has no prefix code configured', new.category_id;
  end if;
 
  -- Atomic upsert: this single statement is what prevents two concurrent
  -- submissions in the same category from ever getting the same number —
  -- same principle as the room-reservation EXCLUDE constraint, just solved
  -- with a locked counter row instead of a range check.
  insert into public.ticket_number_counters (year, category_id, last_value)
  values (v_year, new.category_id, 1)
  on conflict (year, category_id)
  do update set last_value = ticket_number_counters.last_value + 1
  returning last_value into v_seq;
 
  -- Always server-generated — overwrites anything a client may have sent.
  new.ticket_number := v_code || '-' || v_year || '-' || lpad(v_seq::text, 6, '0');
 
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_caller_department()
  RETURNS text
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select department from public.profiles where id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.get_caller_role()
  RETURNS text
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select role from public.profiles where id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$begin
  insert into public.profiles (id, full_name, role, department)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::roles, 'agent'),
    new.raw_user_meta_data ->> 'department'
  );
  return new;
end;$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.log_conference_room_change()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    case when tg_op = 'INSERT' then 'conference_room.created' else 'conference_room.updated' end,
    'conference_room',
    new.id,
    jsonb_build_object('name', new.name, 'location', new.location, 'capacity', new.capacity, 'is_active', new.is_active)
  );
 
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.log_room_reservation_activity()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_attach_event_id uuid;
begin
  if tg_op = 'INSERT' then
    -- Same setting create_room_reservation hands to the calendar-sync
    -- trigger; reading it here too records whether this booking
    -- attached to an existing event or created a fresh one.
    v_attach_event_id := nullif(current_setting('app.attach_to_event_id', true), '')::uuid;
 
    insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
    values (
      auth.uid(),
      'room_reservation.created',
      'room_reservation',
      new.id,
      jsonb_build_object(
        'room_id', new.room_id,
        'title', new.title,
        'starts_at', new.starts_at,
        'ends_at', new.ends_at,
        'attached_to_event_id', v_attach_event_id
      )
    );
 
    return new;
  end if;
 
  if tg_op = 'UPDATE' then
    if new.cancelled_at is not null and old.cancelled_at is null then
      insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
      values (
        auth.uid(),
        'room_reservation.cancelled',
        'room_reservation',
        new.id,
        jsonb_build_object('cancelled_by', new.cancelled_by)
      );
      return new;
    end if;
 
    if new.cancelled_at is null and old.cancelled_at is not null then
      insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
      values (
        auth.uid(),
        'room_reservation.reactivated',
        'room_reservation',
        new.id,
        jsonb_build_object('room_id', new.room_id, 'starts_at', new.starts_at, 'ends_at', new.ends_at)
      );
      return new;
    end if;
 
    if new.cancelled_at is null and (
      new.title     is distinct from old.title or
      new.starts_at is distinct from old.starts_at or
      new.ends_at   is distinct from old.ends_at or
      new.room_id   is distinct from old.room_id
    ) then
      insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
      values (
        auth.uid(),
        'room_reservation.updated',
        'room_reservation',
        new.id,
        jsonb_build_object(
          'from', jsonb_build_object('room_id', old.room_id, 'title', old.title, 'starts_at', old.starts_at, 'ends_at', old.ends_at),
          'to',   jsonb_build_object('room_id', new.room_id, 'title', new.title, 'starts_at', new.starts_at, 'ends_at', new.ends_at)
        )
      );
    end if;
 
    return new;
  end if;
 
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.log_room_reservation_deleted()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    'room_reservation.deleted',
    'room_reservation',
    old.id,
    jsonb_build_object('room_id', old.room_id, 'title', old.title, 'starts_at', old.starts_at, 'ends_at', old.ends_at)
  );
 
  return old;
end;
$function$;

CREATE OR REPLACE FUNCTION public.log_sla_change()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    case when tg_op = 'INSERT' then 'sla.created' else 'sla.updated' end,
    'sla',
    new.id,
    jsonb_build_object(
      'priority', new.priority,
      'first_response_minutes', new.first_response_minutes,
      'resolution_minutes', new.resolution_minutes
    )
  );
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.log_status_change()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_employee_id uuid;
  v_note        text;
begin
  if new.status is distinct from old.status then
    
    -- Transaction-local, set right before the update by whatever
    -- function is performing it; automatically clears itself once the
    -- transaction ends, so an unrelated later transaction never picks
    -- up a stale value. Both default to null for a plain staff update
    -- that doesn't set either.
    v_employee_id := nullif(current_setting('app.confirming_employee_id', true), '')::uuid;
    v_note        := nullif(current_setting('app.status_change_note', true), '');
 
    insert into public.ticket_status_history
      (ticket_id, from_status, to_status, changed_by_profile_id, changed_by_employee_id, note)
    values (new.id, old.status, new.status, auth.uid(), v_employee_id, v_note);
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.log_ticket_created()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    'ticket.draft_created',
    'ticket',
    new.id,
    jsonb_build_object('status', new.status, 'priority', new.priority)
  );
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.log_ticket_soft_delete()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    'ticket.deleted',
    'ticket',
    new.id,
    jsonb_build_object('status_at_deletion', new.status)
  );
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.log_ticket_status_change()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  if new.status is distinct from old.status then
    insert into public.activity_log (actor_id, action, entity_type, entity_id, metadata)
    values (
      auth.uid(),
      case
        when old.status = 'pending_confirmation' and new.status = 'open'
          then 'ticket.verified'
        else 'ticket.status_changed'
      end,
      'ticket',
      new.id,
      jsonb_build_object('from_status', old.status, 'to_status', new.status)
    );
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.override_close_ticket (
  _ticket_id uuid,
  _reason    text DEFAULT NULL::text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_current_status ticket_status;
begin
  if not public.can_act_on_ticket(_ticket_id) then
    raise exception 'Not authorized to close this ticket';
  end if;

  select status into v_current_status from public.tickets where id = _ticket_id;

  if v_current_status = 'closed' then
    raise exception 'Ticket is already closed';
  end if;

  perform set_config(
    'app.status_change_note',
    coalesce(_reason, 'Closed via staff override — not QR-confirmed by requester.'),
    true
  );

  if v_current_status is distinct from 'resolved' then
    update public.tickets set status = 'resolved', resolved_at = now() where id = _ticket_id;
  end if;

  update public.tickets set status = 'closed', closed_at = now() where id = _ticket_id;
end;
$function$;

CREATE FUNCTION public.prevent_password_flag_bypass()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  if new.password_reset_required is distinct from old.password_reset_required
     and coalesce(current_setting('app.completing_password_setup', true), '') <> 'true'
     and not public.is_admin()
  then
    raise exception 'password_reset_required can only be cleared via complete_password_setup()';
  end if;
  return new;
end;
$function$;

GRANT ALL ON FUNCTION public.prevent_password_flag_bypass() TO anon;

GRANT ALL ON FUNCTION public.prevent_password_flag_bypass() TO authenticated;

GRANT ALL ON FUNCTION public.prevent_password_flag_bypass() TO service_role;

CREATE OR REPLACE FUNCTION public.prevent_role_department_change()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role
       or new.department is distinct from old.department then
      raise exception 'Only admins may change role or department';
    end if;
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_events_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_ticket_department()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  select department into new.department
  from public.employees
  where id = new.requester_id;
  return new;
end;
$function$;

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
    end if;
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.sync_employee_record (
  _employee_no text,
  _full_name   text,
  _department  text,
  _email       text DEFAULT NULL::text
)
  RETURNS public.employees
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_row public.employees;
begin
  update public.employees
  set full_name  = _full_name,
      department = _department,
      email      = coalesce(_email, email),
      updated_at = now()
  where employee_no = _employee_no
  returning * into v_row;
 
  if v_row.id is null then
    raise exception 'Employee % not found — scan-time sync only refreshes existing records, it does not create new ones', _employee_no;
  end if;
 
  return v_row;
end;
$function$;

CREATE OR REPLACE FUNCTION public.sync_room_reservation_event()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_room_name       text;
  v_attach_event_id uuid;
begin
  if tg_op = 'INSERT' then
    v_attach_event_id := nullif(current_setting('app.attach_to_event_id', true), '')::uuid;
    select name into v_room_name from public.conference_rooms where id = new.room_id;
 
    if v_attach_event_id is not null then
      -- public.create_room_reservation already checked that this event
      -- exists, is unclaimed, and the caller is allowed to edit it —
      -- but that check and this update aren't atomic with each other,
      -- so re-check room_reservation_id IS NULL here too. If two
      -- attach attempts race, only the first UPDATE finds a matching
      -- row; the second hits "not found" and raises instead of
      -- stealing the event out from under the first.
      update public.events
      set room_reservation_id = new.id,
          title       = new.title,
          description = 'Conference room reservation — ' || coalesce(v_room_name, 'room'),
          starts_at   = new.starts_at,
          ends_at     = new.ends_at
      where id = v_attach_event_id
        and room_reservation_id is null;
 
      if not found then
        raise exception 'Event % is no longer available to attach this reservation to.', v_attach_event_id;
      end if;
    else
      insert into public.events (title, description, event_type, room_reservation_id, owner_id, starts_at, ends_at)
      values (
        new.title,
        'Conference room reservation — ' || coalesce(v_room_name, 'room'),
        'room_reservation',
        new.id,
        new.organizer_id,
        new.starts_at,
        new.ends_at
      );
    end if;
 
    return new;
  end if;
 
  if tg_op = 'UPDATE' then
    -- Cancelling frees the room but leaves the event on the calendar —
    -- it just stops pointing at this reservation, since the meeting
    -- may still occur elsewhere. The description is updated so anyone
    -- looking at the event understands the room fell through.
    if new.cancelled_at is not null and old.cancelled_at is null then
      update public.events
      set room_reservation_id = null,
          description = 'Room reservation was cancelled. This event is no longer tied to a specific room.'
      where room_reservation_id = new.id;
      return new;
    end if;
 
    -- Reactivating a previously-cancelled reservation creates a new
    -- calendar entry, since the reservation no longer has one linked
    -- (cancellation unlinked it rather than deleting it — see above).
    if new.cancelled_at is null and old.cancelled_at is not null then
      select name into v_room_name from public.conference_rooms where id = new.room_id;
 
      insert into public.events (title, description, event_type, room_reservation_id, owner_id, starts_at, ends_at)
      values (
        new.title,
        'Conference room reservation — ' || coalesce(v_room_name, 'room'),
        'room_reservation',
        new.id,
        new.organizer_id,
        new.starts_at,
        new.ends_at
      );
 
      return new;
    end if;
 
    -- Otherwise, keep the existing event's title/description/timing in
    -- sync with whatever changed on the reservation (room, title, or
    -- time range).
    if new.cancelled_at is null and (
      new.title     is distinct from old.title or
      new.starts_at is distinct from old.starts_at or
      new.ends_at   is distinct from old.ends_at or
      new.room_id   is distinct from old.room_id
    ) then
      select name into v_room_name from public.conference_rooms where id = new.room_id;
 
      update public.events
      set title       = new.title,
          description = 'Conference room reservation — ' || coalesce(v_room_name, 'room'),
          starts_at   = new.starts_at,
          ends_at     = new.ends_at
      where room_reservation_id = new.id;
    end if;
 
    return new;
  end if;
 
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.verify_scanned_employee (
  _ticket_id           uuid,
  _scanned_employee_no text
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_requester_id uuid;
  v_scanned_id   uuid;
begin
  select requester_id into v_requester_id from public.tickets where id = _ticket_id;
 
  select id into v_scanned_id
  from public.employees
  where employee_no = _scanned_employee_no and is_active;
 
  if v_scanned_id is null then
    raise exception 'Scanned employee ID not recognized';
  end if;
 
  if v_scanned_id is distinct from v_requester_id then
    raise exception 'Scanned employee does not match this ticket''s requester';
  end if;
 
  return v_scanned_id;
end;
$function$;

ALTER TABLE public.profiles
  ADD COLUMN password_reset_required boolean DEFAULT true NOT NULL;

CREATE TRIGGER trg_prevent_password_flag_bypass
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_password_flag_bypass();

CREATE VIEW public.dashboard_agent_workload WITH (security_invoker=on) AS SELECT p.id AS agent_id,
    p.full_name AS agent_name,
    count(t.id) FILTER (WHERE (t.status = 'in_progress'::public.ticket_status)) AS in_progress_count,
    count(t.id) FILTER (WHERE (t.status = 'closed'::public.ticket_status)) AS closed_count
   FROM (public.profiles p
     LEFT JOIN public.tickets t ON (((t.assigned_to_id = p.id) AND (t.deleted_at IS NULL))))
  WHERE (p.role = 'agent'::public.roles)
  GROUP BY p.id, p.full_name
  ORDER BY p.full_name;

GRANT ALL ON public.dashboard_agent_workload TO authenticated;

GRANT ALL ON public.dashboard_agent_workload TO service_role;
