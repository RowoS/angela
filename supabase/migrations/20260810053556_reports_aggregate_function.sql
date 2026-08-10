SET check_function_bodies = false;

-- KPI row: totals for an arbitrary window. Called twice from the server
-- action (current window + prior window of equal length) so the UI can
-- show %-change without baking period-comparison logic into SQL.
CREATE OR REPLACE FUNCTION public.report_kpis(p_start timestamptz, p_end timestamptz)
  RETURNS TABLE (
    tickets_created             integer,
    avg_first_response_minutes  numeric,
    sla_met_rate                numeric,
    sla_breach_count            integer
  )
  LANGUAGE sql
  STABLE
  SET search_path TO 'public'
  AS $$
  WITH visible AS (
    SELECT t.*
    FROM public.tickets t
    WHERE t.deleted_at IS NULL
      AND t.created_at >= p_start
      AND t.created_at < p_end
      AND (
        public.get_caller_role() = ANY (ARRAY['admin', 'agent'])
        OR (public.get_caller_role() = 'manager' AND t.department IS NOT DISTINCT FROM public.get_caller_department())
      )
  ),
  -- A ticket only has a *determined* SLA outcome once it's resolved or its
  -- due_at has passed — still-open, still-within-window tickets are
  -- excluded rather than guessed at.
  outcomes AS (
    SELECT
      v.*,
      (v.resolved_at IS NOT NULL AND v.due_at IS NOT NULL AND v.resolved_at <= v.due_at) AS resolution_met,
      (v.due_at IS NOT NULL AND (v.resolved_at IS NOT NULL OR v.due_at < now())) AS outcome_determined
    FROM visible v
  )
  SELECT
    (SELECT count(*)::int FROM visible),
    (SELECT round(avg(EXTRACT(EPOCH FROM (first_response_at - created_at)) / 60)::numeric, 1)
       FROM visible WHERE first_response_at IS NOT NULL),
    (SELECT round(
       (count(*) FILTER (WHERE resolution_met)::numeric / NULLIF(count(*) FILTER (WHERE outcome_determined), 0)) * 100, 1)
     FROM outcomes),
    (SELECT count(*) FILTER (WHERE outcome_determined AND NOT resolution_met)::int FROM outcomes);
$$;

REVOKE EXECUTE ON FUNCTION public.report_kpis(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_kpis(timestamptz, timestamptz) TO authenticated;

-- Monthly SLA met/breached %, for the compliance trend chart.
CREATE OR REPLACE FUNCTION public.report_sla_compliance_monthly(p_start timestamptz, p_end timestamptz)
  RETURNS TABLE (
    month         date,
    met_pct       numeric,
    breached_pct  numeric
  )
  LANGUAGE sql
  STABLE
  SET search_path TO 'public'
  AS $$
  WITH visible AS (
    SELECT t.*
    FROM public.tickets t
    WHERE t.deleted_at IS NULL
      AND t.created_at >= p_start
      AND t.created_at < p_end
      AND (
        public.get_caller_role() = ANY (ARRAY['admin', 'agent'])
        OR (public.get_caller_role() = 'manager' AND t.department IS NOT DISTINCT FROM public.get_caller_department())
      )
  ),
  outcomes AS (
    SELECT
      date_trunc('month', created_at)::date AS month,
      (resolved_at IS NOT NULL AND due_at IS NOT NULL AND resolved_at <= due_at) AS resolution_met,
      (due_at IS NOT NULL AND (resolved_at IS NOT NULL OR due_at < now())) AS outcome_determined
    FROM visible
  )
  SELECT
    month,
    round((count(*) FILTER (WHERE resolution_met)::numeric / NULLIF(count(*) FILTER (WHERE outcome_determined), 0)) * 100, 1),
    round((count(*) FILTER (WHERE outcome_determined AND NOT resolution_met)::numeric / NULLIF(count(*) FILTER (WHERE outcome_determined), 0)) * 100, 1)
  FROM outcomes
  WHERE outcome_determined
  GROUP BY month
  ORDER BY month;
$$;

REVOKE EXECUTE ON FUNCTION public.report_sla_compliance_monthly(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_sla_compliance_monthly(timestamptz, timestamptz) TO authenticated;

-- Monthly avg first-response / resolution minutes, for the trend line chart.
CREATE OR REPLACE FUNCTION public.report_response_resolution_monthly(p_start timestamptz, p_end timestamptz)
  RETURNS TABLE (
    month                   date,
    avg_response_minutes    numeric,
    avg_resolution_minutes  numeric
  )
  LANGUAGE sql
  STABLE
  SET search_path TO 'public'
  AS $$
  SELECT
    date_trunc('month', t.created_at)::date AS month,
    round(avg(EXTRACT(EPOCH FROM (t.first_response_at - t.created_at)) / 60) FILTER (WHERE t.first_response_at IS NOT NULL), 1),
    round(avg(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 60) FILTER (WHERE t.resolved_at IS NOT NULL), 1)
  FROM public.tickets t
  WHERE t.deleted_at IS NULL
    AND t.created_at >= p_start
    AND t.created_at < p_end
    AND (
      public.get_caller_role() = ANY (ARRAY['admin', 'agent'])
      OR (public.get_caller_role() = 'manager' AND t.department IS NOT DISTINCT FROM public.get_caller_department())
    )
  GROUP BY 1
  ORDER BY 1;
$$;

REVOKE EXECUTE ON FUNCTION public.report_response_resolution_monthly(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_response_resolution_monthly(timestamptz, timestamptz) TO authenticated;

-- Period-scoped variant of dashboard_tickets_by_category (that view is
-- all-time only, with no date window parameter).
CREATE OR REPLACE FUNCTION public.report_category_breakdown(p_start timestamptz, p_end timestamptz)
  RETURNS TABLE (
    category_id    uuid,
    category_name  text,
    ticket_count   integer
  )
  LANGUAGE sql
  STABLE
  SET search_path TO 'public'
  AS $$
  SELECT
    root.id,
    root.name,
    count(t.id)::int
  FROM public.ticket_categories root
  LEFT JOIN public.ticket_categories child ON child.parent_id = root.id
  LEFT JOIN public.tickets t ON (
    t.deleted_at IS NULL
    AND t.created_at >= p_start
    AND t.created_at < p_end
    AND (t.category_id = root.id OR t.category_id = child.id)
    AND (
      public.get_caller_role() = ANY (ARRAY['admin', 'agent'])
      OR (public.get_caller_role() = 'manager' AND t.department IS NOT DISTINCT FROM public.get_caller_department())
    )
  )
  WHERE root.parent_id IS NULL
    AND public.get_caller_role() = ANY (ARRAY['admin', 'agent', 'manager'])
  GROUP BY root.id, root.name
  ORDER BY count(t.id) DESC;
$$;

REVOKE EXECUTE ON FUNCTION public.report_category_breakdown(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_category_breakdown(timestamptz, timestamptz) TO authenticated;

-- Per-agent performance for the report table. Deliberately admin/agent-
-- visible only (mirrors report_kpis' staff scoping) — assigned_to_id has
-- no department, so there's no clean way to scope this to a manager's
-- department the way tickets_select does.
CREATE OR REPLACE FUNCTION public.report_agent_performance(p_start timestamptz, p_end timestamptz)
  RETURNS TABLE (
    agent_id             uuid,
    agent_name           text,
    assigned_count       integer,
    resolved_count       integer,
    avg_response_minutes numeric,
    sla_met_pct          numeric
  )
  LANGUAGE sql
  STABLE
  SET search_path TO 'public'
  AS $$
  WITH visible AS (
    SELECT t.*
    FROM public.tickets t
    WHERE t.deleted_at IS NULL
      AND t.assigned_to_id IS NOT NULL
      AND t.created_at >= p_start
      AND t.created_at < p_end
      AND public.get_caller_role() = ANY (ARRAY['admin', 'agent'])
  ),
  outcomes AS (
    SELECT
      v.*,
      (v.resolved_at IS NOT NULL AND v.due_at IS NOT NULL AND v.resolved_at <= v.due_at) AS resolution_met,
      (v.due_at IS NOT NULL AND (v.resolved_at IS NOT NULL OR v.due_at < now())) AS outcome_determined
    FROM visible v
  )
  SELECT
    p.id,
    p.full_name,
    count(o.id)::int,
    count(o.id) FILTER (WHERE o.resolved_at IS NOT NULL)::int,
    round(avg(EXTRACT(EPOCH FROM (o.first_response_at - o.created_at)) / 60) FILTER (WHERE o.first_response_at IS NOT NULL), 1),
    round((count(*) FILTER (WHERE o.resolution_met)::numeric / NULLIF(count(*) FILTER (WHERE o.outcome_determined), 0)) * 100, 1)
  FROM public.profiles p
  JOIN outcomes o ON o.assigned_to_id = p.id
  WHERE p.role = 'agent'
  GROUP BY p.id, p.full_name
  ORDER BY count(o.id) DESC;
$$;

REVOKE EXECUTE ON FUNCTION public.report_agent_performance(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_agent_performance(timestamptz, timestamptz) TO authenticated