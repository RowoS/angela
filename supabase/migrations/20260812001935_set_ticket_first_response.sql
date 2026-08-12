CREATE OR REPLACE FUNCTION public.set_ticket_first_response()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  if old.status = 'open'
     and new.status is distinct from old.status
     and new.first_response_at is null
  then
    new.first_response_at := now();
  end if;
  return new;
end;
$function$;

CREATE TRIGGER trg_set_ticket_first_response
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ticket_first_response();