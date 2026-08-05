'use server'

import type { Database } from '@/lib/supabase/types'

import { createClient } from "@/lib/supabase/server"
 
type TicketPriority = Database['public']['Enums']['ticket_priority']
type TicketStatus = Database['public']['Enums']['ticket_status']

export type QueueTicket = {
  id: string
  ticket_number: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  created_at: string
  due_at: string | null
  first_response_due_at: string | null
  first_response_at: string | null
  resolved_at: string | null
  category: { id: string; name: string } | null
  requester: { full_name: string; employee_no: string } | null
  assigned_to: { id: string; full_name: string | null } | null
  comment_count: number
  attachment_count: number
}

async function getSupabaseAndUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not signed in')
  }
  return { supabase, user }
}

// Single query covers Queue and AssignedToMe (pass a scope). RLS on
// `tickets` already restricts rows to what the caller may see —
// agents see all, managers see their department, this function does
// no additional filtering itself beyond soft-delete and the optional
// assignee scope.
export async function getTicketQueue(opts?: { assignedToSelf?: boolean }): Promise<QueueTicket[]> {
  const { supabase, user } = await getSupabaseAndUser()

  let query = supabase
    .from('tickets')
    .select(`
      id, ticket_number, title, status, priority, created_at,
      due_at, first_response_due_at, first_response_at, resolved_at,
      category:ticket_categories!tickets_category_id_fkey(id, name),
      requester:employees!tickets_requester_id_fkey(full_name, employee_no),
      assigned_to:profiles!tickets_assigned_to_id_fkey(id, full_name),
      comments:ticket_comments(count),
      attachments:ticket_attachments(count)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (opts?.assignedToSelf) {
    query = query.eq('assigned_to_id', user.id)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  // Explicit field-by-field construction rather than `...t as QueueTicket`.
  // The FK hints above should make these embeds resolve as single objects,
  // but normalizing defensively means a stray schema/typing drift fails
  // loudly at the specific field instead of silently through a blanket cast.
  return (data ?? []).map((t): QueueTicket => {
    const category = Array.isArray(t.category) ? t.category[0] : t.category
    const requester = Array.isArray(t.requester) ? t.requester[0] : t.requester
    const assignedTo = Array.isArray(t.assigned_to) ? t.assigned_to[0] : t.assigned_to

    return {
      id: t.id,
      ticket_number: t.ticket_number,
      title: t.title,
      status: t.status,
      priority: t.priority,
      created_at: t.created_at,
      due_at: t.due_at,
      first_response_due_at: t.first_response_due_at,
      first_response_at: t.first_response_at,
      resolved_at: t.resolved_at,
      category: category ? { id: category.id, name: category.name } : null,
      requester: requester
        ? { full_name: requester.full_name, employee_no: requester.employee_no }
        : null,
      assigned_to: assignedTo ? { id: assignedTo.id, full_name: assignedTo.full_name } : null,
      comment_count: t.comments?.[0]?.count ?? 0,
      attachment_count: t.attachments?.[0]?.count ?? 0,
    }
  })
}