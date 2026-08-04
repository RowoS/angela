CREATE OR REPLACE VIEW public.dashboard_recent_tickets
  WITH (security_invoker = on) AS
SELECT
  t.id,
  t.ticket_number,
  t.title,
  t.priority,
  t.status,
  t.category_id,
  t.created_at,
  e.full_name AS requester_name
FROM public.tickets t
LEFT JOIN public.employees e ON e.id = t.requester_id
WHERE t.deleted_at IS NULL
ORDER BY t.created_at DESC
LIMIT 10;

REVOKE ALL ON public.dashboard_recent_tickets FROM anon;

-- Avg first-response time, last 7 days, staff-visible only (security_invoker
-- means RLS on `tickets` still applies — a manager only ever sees their
-- own department's average, same boundary as every other dashboard view).
CREATE OR REPLACE VIEW public.dashboard_avg_first_response
  WITH (security_invoker = on) AS
SELECT
  AVG(EXTRACT(EPOCH FROM (t.first_response_at - t.created_at)) / 60)::numeric(10,1)
    AS avg_first_response_minutes,
  COUNT(*) FILTER (WHERE t.first_response_at IS NOT NULL) AS sample_size
FROM public.tickets t
WHERE t.deleted_at IS NULL
  AND t.first_response_at IS NOT NULL
  AND t.created_at > now() - interval '7 days';

GRANT ALL ON public.dashboard_avg_first_response TO authenticated;
GRANT ALL ON public.dashboard_avg_first_response TO service_role;
REVOKE ALL ON public.dashboard_avg_first_response FROM anon;