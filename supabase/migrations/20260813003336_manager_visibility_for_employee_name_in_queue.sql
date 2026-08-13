CREATE POLICY employees_select_manager ON public.employees
  FOR SELECT
  TO authenticated
  USING (
    public."current_role"() = 'manager'::public.roles
    AND department = public.current_department()
  );