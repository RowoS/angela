DROP FUNCTION IF EXISTS public.close_ticket_via_qr(uuid, text);

CREATE OR REPLACE FUNCTION public.resolve_ticket_via_qr(_ticket_id uuid, _scanned_employee_no text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_employee_id uuid;
begin
  if not public.can_act_on_ticket(_ticket_id) then
    raise exception 'Not authorized to resolve this ticket';
  end if;

  v_employee_id := public.verify_scanned_employee(_ticket_id, _scanned_employee_no);

  perform set_config('app.confirming_employee_id', v_employee_id::text, true);

  update public.tickets set status = 'resolved', resolved_at = now() where id = _ticket_id;
end;
$function$