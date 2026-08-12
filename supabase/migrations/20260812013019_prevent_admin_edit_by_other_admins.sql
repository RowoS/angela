CREATE OR REPLACE FUNCTION public.prevent_admin_edit_by_peer()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  if old.role = 'admin'::public.roles
     and new.id is distinct from auth.uid()
     and (new.role is distinct from old.role or new.department is distinct from old.department)
  then
    raise exception 'Admins cannot modify other admin accounts.';
  end if;
  return new;
end;
$function$;

GRANT ALL ON FUNCTION public.prevent_admin_edit_by_peer() TO authenticated;

CREATE TRIGGER trg_prevent_admin_edit_by_peer
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_edit_by_peer();