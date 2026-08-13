DROP POLICY IF EXISTS comments_select ON public.ticket_comments;

CREATE POLICY comments_select ON public.ticket_comments
  FOR SELECT
  USING (
    public.can_view_ticket(ticket_id)
    AND (
      is_internal = false
      OR public.current_role() = ANY (ARRAY['agent'::public.roles, 'admin'::public.roles])
    )
  );

DROP POLICY IF EXISTS comments_insert ON public.ticket_comments;

CREATE POLICY comments_insert ON public.ticket_comments
  FOR INSERT
  WITH CHECK (
    (user_id = (SELECT auth.uid()))
    AND public.can_view_ticket(ticket_id)
    AND (
      (is_internal = false AND public.current_role() = ANY (ARRAY['agent'::public.roles, 'admin'::public.roles, 'manager'::public.roles]))
      OR (is_internal = true AND public.current_role() = ANY (ARRAY['agent'::public.roles, 'admin'::public.roles]))
    )
  );