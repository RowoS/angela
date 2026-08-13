-- =============================================================================
-- seed.sql — Local dev seed data for the IT Support Ticket Management System
-- Run with: supabase db reset   (auto-applies supabase/seed.sql)
--       or: psql "$DATABASE_URL" -f seed.sql
-- =============================================================================
-- Ordering matters: auth.users -> profiles (trigger) -> employees -> slas
-- -> ticket_categories -> tickets -> ticket_status_history. Each block is a
-- hard FK dependency of the next. UUIDs are static/readable so later blocks
-- can reference earlier ones directly.
--
-- SCOPE NOTE: 20260730080138_remote_schema.sql (the base migration with the
-- actual `CREATE TABLE public.tickets` and its triggers) was not available
-- when writing this. Every value below is therefore either (a) taken
-- directly from a column/type documented in types.ts or a migration you did
-- provide, or (b) computed by hand to match the exact logic in a function
-- body you provided (generate_ticket_number, expire_stale_pending_tickets),
-- specifically because I can't confirm those functions are wired to a
-- BEFORE/AFTER trigger on `tickets` in your local schema. Nothing here
-- assumes a ticket-table trigger fires during this script. If your base
-- migration does wire them up, the values here still match what those
-- triggers would have produced, so re-running through the app afterward
-- stays consistent.
-- =============================================================================

begin;

-- pgcrypto provides crypt()/gen_salt() for the auth.users password hash below.
-- Supabase projects have this enabled by default, but it's guarded here so
-- the script is safe to run against a bare local Postgres too.
create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- 1. Staff accounts (auth.users) — trigger on_auth_user_created (AFTER INSERT
--    ON auth.users, confirmed in 20260730080138_remote_schema.sql) fires
--    handle_new_user(), which inserts the matching public.profiles row. As of
--    the 20260804000506 migration that function reads BOTH `role` and
--    `department` out of raw_user_meta_data (the original 20260730 version
--    hard-coded role='agent' and ignored department — superseded by
--    CREATE OR REPLACE, not still in effect). Do NOT insert into profiles
--    directly: profiles.id has a FK straight to auth.users(id) ON DELETE
--    CASCADE, so the row has to originate here.
-- -----------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
) values
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000001',
   'authenticated', 'authenticated', 'marcus.webb@company.test', crypt('password123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"full_name":"Marcus Webb","role":"admin","department":"IT"}',
   now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002',
   'authenticated', 'authenticated', 'sofia.reyes@company.test', crypt('password123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"full_name":"Sofia Reyes","role":"agent","department":"IT"}',
   now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000003',
   'authenticated', 'authenticated', 'dmitri.volkov@company.test', crypt('password123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"full_name":"Dmitri Volkov","role":"agent","department":"IT"}',
   now(), now(), '', '', '', ''),

  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000004',
   'authenticated', 'authenticated', 'nia.thompson@company.test', crypt('password123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}',
   '{"full_name":"Nia Thompson","role":"manager","department":"Operations"}',
   now(), now(), '', '', '', '');

-- -----------------------------------------------------------------------------
-- 2. Employees (requesters) — no auth account, ticket requesters only.
--    Amara Osei is deliberately in "Operations" to match manager Nia
--    Thompson's department, so tickets_select's manager-scoping is testable.
-- -----------------------------------------------------------------------------
insert into public.employees (id, employee_no, full_name, department, email, is_active) values
  ('e0000000-0000-0000-0000-000000000001', 'EMP-0042', 'Priya Anand',   'Finance',     'p.anand@company.test',    true),
  ('e0000000-0000-0000-0000-000000000002', 'EMP-0091', 'Jordan Clarke', 'Marketing',   'j.clarke@company.test',  true),
  ('e0000000-0000-0000-0000-000000000003', 'EMP-0117', 'Leo Fontaine',  'Engineering', 'l.fontaine@company.test', true),
  ('e0000000-0000-0000-0000-000000000004', 'EMP-0203', 'Yuki Tanaka',   'HR',          'y.tanaka@company.test',  true),
  ('e0000000-0000-0000-0000-000000000005', 'EMP-0058', 'Carlos Mendez', 'Sales',       'c.mendez@company.test',  true),
  ('e0000000-0000-0000-0000-000000000006', 'EMP-0076', 'Amara Osei',    'Operations',  'a.osei@company.test',    true);

-- -----------------------------------------------------------------------------
-- 3. SLAs — one row per priority (upsertSla enforces this via a unique
--    constraint on priority). Categories below reference these by id.
-- -----------------------------------------------------------------------------
insert into public.slas (id, name, priority, first_response_minutes, resolution_minutes) values
  ('b0000000-0000-0000-0000-000000000001', 'Standard Low SLA',      'low',      480, 4320),
  ('b0000000-0000-0000-0000-000000000002', 'Standard Medium SLA',   'medium',   240, 1440),
  ('b0000000-0000-0000-0000-000000000003', 'Standard High SLA',     'high',      60,  480),
  ('b0000000-0000-0000-0000-000000000004', 'Standard Critical SLA', 'critical',  15,  240);

-- -----------------------------------------------------------------------------
-- 4. Ticket categories — `code` is required: generate_ticket_number() raises
--    if it's null, since it's used as the ticket-number prefix.
-- -----------------------------------------------------------------------------
insert into public.ticket_categories (id, code, name, parent_id, default_priority, default_sla_id) values
  ('c0000000-0000-0000-0000-000000000001', 'HW',  'Hardware',        null, 'medium',   'b0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000002', 'SW',  'Software',        null, 'medium',   'b0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000003', 'NW', 'Network',         null, 'high',     'b0000000-0000-0000-0000-000000000003'),
  ('c0000000-0000-0000-0000-000000000004', 'ACC', 'Access/Accounts', null, 'high',     'b0000000-0000-0000-0000-000000000003'),
  ('c0000000-0000-0000-0000-000000000005', 'OTH', 'Other',           null, 'low',      'b0000000-0000-0000-0000-000000000001');

-- -----------------------------------------------------------------------------
-- 5. Tickets — one per status value (8 statuses), priorities spread across
--    all four levels, plus two extra `open`/`in_progress` rows so the SLA
--    breach/warning cards on the dashboard have something to show.
--
--    Confirmed against the schema (tickets DDL + its triggers, lines ~1269-
--    1382 of 20260730080138_remote_schema.sql):
--      - trg_generate_ticket_number (BEFORE INSERT) unconditionally
--        overwrites new.ticket_number using ticket_categories.code + year +
--        a per-category sequence — it does not check whether a value was
--        already supplied. The placeholders below exist only to satisfy the
--        NOT NULL column definition for the instant before the trigger
--        reassigns it; their actual text is discarded every time.
--      - trg_set_ticket_department (BEFORE INSERT) unconditionally looks up
--        new.requester_id in employees and overwrites new.department, so
--        `department` is deliberately omitted from this INSERT — anything
--        passed there would just be thrown away too.
--      - trg_set_ticket_sla_deadlines only fires BEFORE UPDATE (the
--        pending_confirmation -> open transition), never on INSERT, so
--        due_at / first_response_due_at are set explicitly by hand below to
--        get realistic SLA-breach/warning demo rows.
--      - trg_log_ticket_created (AFTER INSERT) fires unconditionally and
--        writes an activity_log row per ticket; trg_log_status_change /
--        trg_log_ticket_status_change are AFTER UPDATE only and will NOT
--        fire for these inserts, so no ticket_status_history rows get
--        created for the initial status — matches real lifecycle behavior,
--        where history only tracks transitions after creation.
--      - tickets_insert RLS policy requires current_role() IN
--        ('admin','agent'); irrelevant here since this script runs as the
--        table owner/superuser, which bypasses RLS unless FORCE ROW LEVEL
--        SECURITY is set (it isn't, per the DDL).
-- -----------------------------------------------------------------------------
insert into public.tickets (
  id, ticket_number, title, description, category_id, priority, status,
  requester_id, assigned_to_id, source,
  created_at, first_response_due_at, first_response_at, due_at, resolved_at, closed_at
) values

  -- 1. pending_confirmation — just submitted, awaiting QR confirmation
  ('f0000000-0000-0000-0000-000000000001', 'SEED-0001',
   'New monitor request for desk 4B',
   'Requesting a second monitor for my workstation to support dual-screen data entry.',
   'c0000000-0000-0000-0000-000000000001', 'low', 'pending_confirmation',
   'e0000000-0000-0000-0000-000000000004', null, 'web',
   now() - interval '2 hours', null, null, null, null, null),

  -- 2. open — confirmed, unassigned SLA clock running normally
  ('f0000000-0000-0000-0000-000000000002', 'SEED-0002',
   'Outlook keeps crashing on launch',
   'Outlook crashes within a few seconds of opening on Windows 11. Reinstalled once already, same result.',
   'c0000000-0000-0000-0000-000000000002', 'medium', 'open',
   'e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'web',
   now() - interval '1 day', now() - interval '20 hours', null, now() + interval '4 hours', null, null),

  -- 3. in_progress — being actively worked
  ('f0000000-0000-0000-0000-000000000003', 'SEED-0003',
   'Intermittent WiFi drops in East wing',
   'WiFi disconnects every 15-20 minutes on the east side of the 3rd floor. Affects multiple employees.',
   'c0000000-0000-0000-0000-000000000003', 'high', 'in_progress',
   'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'web',
   now() - interval '2 days', now() - interval '47 hours', now() - interval '46 hours', now() + interval '2 hours', null, null),

  -- 4. on_hold — waiting on a vendor part
  ('f0000000-0000-0000-0000-000000000004', 'SEED-0004',
   'Replacement laptop battery needed',
   'Battery swells and no longer holds charge past 20%. Vendor part on backorder, ticket on hold pending delivery.',
   'c0000000-0000-0000-0000-000000000001', 'low', 'on_hold',
   'e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'web',
   now() - interval '5 days', now() - interval '4 days 16 hours', now() - interval '4 days 15 hours', now() + interval '2 days', null, null),

  -- 5. resolved — fixed, not yet formally closed
  ('f0000000-0000-0000-0000-000000000005', 'SEED-0005',
   'Core switch failure — 2nd floor outage',
   'Full network outage on the 2nd floor traced to a failed core switch. Switch replaced and service restored.',
   'c0000000-0000-0000-0000-000000000003', 'critical', 'resolved',
   'e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'phone',
   now() - interval '3 days', now() - interval '2 days 23 hours 45 minutes', now() - interval '2 days 23 hours 40 minutes', now() - interval '2 days 20 hours', now() - interval '2 days 19 hours', null),

  -- 6. closed — fully resolved and confirmed
  ('f0000000-0000-0000-0000-000000000006', 'SEED-0006',
   'Locked out of domain account',
   'Too many failed login attempts locked the account. Verified identity and reset credentials.',
   'c0000000-0000-0000-0000-000000000004', 'high', 'closed',
   'e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'web',
   now() - interval '10 days', now() - interval '9 days 23 hours', now() - interval '9 days 23 hours', now() - interval '9 days 16 hours', now() - interval '9 days 17 hours', now() - interval '9 days 16 hours'),

  -- 7. reopened — requester says the fix didn't hold
  ('f0000000-0000-0000-0000-000000000007', 'SEED-0007',
   'License activation error returned after "fix"',
   'The Adobe Creative Cloud license error was marked resolved yesterday but reappeared this morning.',
   'c0000000-0000-0000-0000-000000000002', 'medium', 'reopened',
   'e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'web',
   now() - interval '4 days', now() - interval '3 days 20 hours', now() - interval '3 days 19 hours', now() + interval '6 hours', null, null),

  -- 8. cancelled — requester never confirmed via QR, auto-expired
  ('f0000000-0000-0000-0000-000000000008', 'SEED-0008',
   'General question about VPN setup',
   'Asked about setting up VPN access on a personal device; request went stale and was auto-cancelled.',
   'c0000000-0000-0000-0000-000000000005', 'low', 'cancelled',
   'e0000000-0000-0000-0000-000000000002', null, 'email',
   now() - interval '6 days', null, null, null, null, null),

  -- 9. open, past due — SLA-breached demo row
  ('f0000000-0000-0000-0000-000000000009', 'SEED-0009',
   'Server room A/C failure — temperature climbing',
   'The A/C unit in the primary server room failed overnight. Rack temperatures are rising steadily.',
   'c0000000-0000-0000-0000-000000000001', 'critical', 'open',
   'e0000000-0000-0000-0000-000000000006', null, 'phone',
   now() - interval '10 hours', now() - interval '9 hours 45 minutes', null, now() - interval '6 hours', null, null),

  -- 10. in_progress, due soon — SLA-approaching demo row
  ('f0000000-0000-0000-0000-000000000010', 'SEED-0010',
   'New hire access provisioning — starts Monday',
   'Need domain account, VPN access, and shared drive permissions set up before the new hire''s start date.',
   'c0000000-0000-0000-0000-000000000004', 'medium', 'in_progress',
   'e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'web',
   now() - interval '3 hours', now() - interval '1 hour', now() - interval '30 minutes', now() + interval '45 minutes', null, null);

commit;