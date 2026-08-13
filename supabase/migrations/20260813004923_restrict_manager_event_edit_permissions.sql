SET check_function_bodies = false;

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
    where e.id = _event_id
    and (
      public.is_admin()
      or e.owner_id = auth.uid()
    )
  );
$function$;