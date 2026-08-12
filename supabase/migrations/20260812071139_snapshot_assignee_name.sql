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
  v_caller_role     text;
  v_prev_agent_id   uuid;
  v_prev_agent_name text;
  v_agent_name      text;
begin
  if p_method not in ('manual', 'rule') then
    raise exception 'Invalid assignment method: %', p_method;
  end if;

  select role into v_caller_role from public.profiles where id = auth.uid();
  if v_caller_role not in ('admin', 'agent') then
    raise exception 'Not authorized to assign tickets.';
  end if;

  select assigned_to_id into v_prev_agent_id
  from public.tickets where id = p_ticket_id;

  if not found then
    raise exception 'Ticket % not found.', p_ticket_id;
  end if;

  -- Snapshot both names now — audit rows should read correctly even
  -- after either profile is later renamed or deactivated. v_prev_agent_id
  -- can be null (previously unassigned) — the select then correctly
  -- leaves v_prev_agent_name null rather than erroring.
  select full_name into v_prev_agent_name
  from public.profiles
  where id = v_prev_agent_id;

  select full_name into v_agent_name
  from public.profiles
  where id = p_agent_id;

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
      'from',        v_prev_agent_id,
      'from_name',   v_prev_agent_name,
      'to',          p_agent_id,
      'to_name',     v_agent_name,
      'method',      p_method,
      'rule_id',     p_rule_id
    )
  );
end;
$function$;