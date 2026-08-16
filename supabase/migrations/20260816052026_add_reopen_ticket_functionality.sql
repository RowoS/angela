SET check_function_bodies = false;
 
-- Mirrors resolve_ticket_via_qr (see 20260812091534_modify_qr_close.sql):
-- same authorization check, same QR/manual employee verification against
-- the ticket's requester, same use of app.confirming_employee_id so
-- trg_log_status_change records WHICH employee confirmed this on the
-- resulting ticket_status_history row.
--
-- Two deliberate differences from resolve_ticket_via_qr:
--   1. It gates on current status (resolved/closed only). resolve_ticket_via_qr
--      doesn't gate at all — but "reopened" is only a meaningful transition
--      from those two states, and StatusPanel's UI only ever offers this
--      action when currentStatus is resolved or closed. Reopening from,
--      say, in_progress would just be a confusing no-op status label.
--   2. It clears resolved_at/closed_at. Leaving them set would make
--      TicketDetailData show a stale closure date on a ticket that's
--      actually active again. They get re-populated by
--      resolve_ticket_via_qr / override_close_ticket if this ticket is
--      resolved or closed again later.
CREATE OR REPLACE FUNCTION public.reopen_ticket_via_qr (
  _ticket_id           uuid,
  _scanned_employee_no text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_employee_id    uuid;
  v_current_status ticket_status;
begin
  if not public.can_act_on_ticket(_ticket_id) then
    raise exception 'Not authorized to reopen this ticket';
  end if;
 
  select status into v_current_status from public.tickets where id = _ticket_id;
 
  if not found then
    raise exception 'Ticket % not found.', _ticket_id;
  end if;
 
  if v_current_status not in ('resolved', 'closed') then
    raise exception 'Only resolved or closed tickets can be reopened (current status: %)', v_current_status;
  end if;
 
  v_employee_id := public.verify_scanned_employee(_ticket_id, _scanned_employee_no);
 
  perform set_config('app.confirming_employee_id', v_employee_id::text, true);
  perform set_config(
    'app.status_change_note',
    'Ticket reopened — confirmed via employee QR scan.',
    true
  );
 
  update public.tickets
  set status      = 'reopened',
      resolved_at = null,
      closed_at   = null
  where id = _ticket_id;
end;
$function$;
 
