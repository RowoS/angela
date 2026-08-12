'use server'

import type { QueueTicket, TicketDetailData } from '@/lib/types/tickets'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from 'next/cache'
import type { CommentRow } from '@/app/(authenticated)/tickets/components/TicketComment'
import type { AttachmentRow } from '@/app/(authenticated)/tickets/components/TicketAttachment'

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

export async function getCurrentProfile() {
  const { supabase, user } = await getSupabaseAndUser()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createDraftTicket(formData: FormData) {
  const { supabase } = await getSupabaseAndUser()

  const employeeNo = formData.get('employee_no') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const categoryId = formData.get('category_id') as string
  const priority = (formData.get('priority') as string) || undefined

  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('id')
    .eq('employee_no', employeeNo)
    .eq('is_active', true)
    .single()

  if (employeeError || !employee) {
    throw new Error(`Employee ${employeeNo} not found or inactive`)
  }

  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert({
      requester_id: employee.id,
      title,
      description,
      category_id: categoryId,
      priority
    })
    .select('id, ticket_number')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/tickets')
  return ticket
}

export async function confirmTicketCreation(ticketId: string, scannedEmployeeNo: string) {
  const { supabase } = await getSupabaseAndUser()
  
  const { error } = await supabase.rpc('confirm_ticket_creation_via_qr', {
    _ticket_id: ticketId,
    _scanned_employee_no: scannedEmployeeNo,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/tickets/${ticketId}`)
}

//
// Manual staff actions
//


const VALID_STATUSES = [
  'open',
  'in_progress',
  'on_hold',
  'resolved',
  'reopened',
] as const

export type ManualStatus = (typeof VALID_STATUSES)[number]

export async function updateTicketStatus(ticketId: string, status: ManualStatus) {
  const { supabase } = await getSupabaseAndUser()

  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}`)
  }

  const timestamps: Record<string, string> =
    status === 'resolved'
      ? { resolved_at: new Date().toISOString() }
      : {}

  const { error } = await supabase
    .from('tickets')
    .update({ status, ...timestamps })
    .eq('id', ticketId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/tickets/${ticketId}`)
}

export async function assignTicket(ticketId: string, assigneeId: string | null) {
  const { supabase } = await getSupabaseAndUser()

  if (assigneeId === null) {
    // Unassignment isn't handled by assign_ticket (it requires a
    // non-null p_agent_id and a method). Keep the direct-update path
    // for this specific case only, or add an unassign_ticket RPC if
    // you want it logged too — flag which you'd prefer.
    const { error } = await supabase
      .from('tickets')
      .update({ assigned_to_id: null })
      .eq('id', ticketId)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.rpc('assign_ticket', {
      p_ticket_id: ticketId,
      p_agent_id: assigneeId,
      p_method: 'manual',
      p_rule_id: null,
    })
    if (error) throw new Error(error.message)
  }

  revalidatePath(`/tickets/${ticketId}`)
  revalidatePath('/tickets')
}

// Comments

export async function postComment(ticketId: string, body: string, isInternal: boolean) {
  const { supabase, user } = await getSupabaseAndUser()

  const { error } = await supabase.from('ticket_comments').insert({
    ticket_id: ticketId,
    user_id: user.id,
    body,
    is_internal: isInternal,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/tickets/${ticketId}`)
}

// Attachments

export async function uploadAttachment(ticketId: string | null, formData: FormData) {
  const { supabase, user } = await getSupabaseAndUser()

  const file = formData.get('file') as File
  if (!file) {
    throw new Error('No file provided')
  }

  const storagePath = `${ticketId}/${crypto.randomUUID()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('ticket-attachments')
    .upload(storagePath, file)

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { error: insertError } = await supabase.from('ticket_attachments').insert({
    tickets_id: ticketId,
    uploaded_by_id: user.id,
    storage_path: storagePath,
    original_filename: file.name,
    mime_type: file.type || null,
    size_bytes: file.size,
  })

  if (insertError) {
    await supabase.storage.from('ticket-attachments').remove([storagePath])
    throw new Error(insertError.message)
  }

  revalidatePath(`/tickets/${ticketId}`)
}

export async function getAttachmentDownloadUrl(
  ticketId: string | null,
  attachmentId: string
): Promise<string> {
  const { supabase } = await getSupabaseAndUser()

  // Re-derive storage_path from a query scoped by ticketId + attachmentId
  // rather than trusting a path handed in from the client. RLS on
  // ticket_attachments (attachments_select → can_view_ticket) is what
  // actually gates this — if the caller can't see the ticket, this
  // select returns nothing and we fail closed below rather than ever
  // reaching the storage call.
  const { data, error } = await supabase
    .from('ticket_attachments')
    .select('storage_path')
    .eq('id', attachmentId)
    .eq('tickets_id', ticketId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Attachment not found or you do not have access to this ticket.')

  const { data: signed, error: signError } = await supabase.storage
    .from('ticket-attachments')
    .createSignedUrl(data.storage_path, 60)

  if (signError) throw new Error(signError.message)
  if (!signed?.signedUrl) throw new Error('Failed to generate a download link.')

  return signed.signedUrl
}

export async function deleteAttachment(
  ticketId: string | null,
  attachmentId: string,
  storagePath: string
) {
  const { supabase } = await getSupabaseAndUser()

  const { data: deletedRows, error: deleteRowError } = await supabase
    .from('ticket_attachments')
    .delete()
    .eq('id', attachmentId)
    .select('id')

  if (deleteRowError) throw new Error(deleteRowError.message)

  if (!deletedRows || deletedRows.length === 0) {
    throw new Error(
      'Attachment cannot be deleted — the ticket is no longer awaiting confirmation.'
    )
  }

  const { error: deleteFileError } = await supabase.storage
    .from('ticket-attachments')
    .remove([storagePath])

  if (deleteFileError) throw new Error(deleteFileError.message)

  revalidatePath(`/tickets/${ticketId}`)
}


export async function closeTicketViaQr(ticketId: string, scannedEmployeeNo: string) {
  const { supabase } = await getSupabaseAndUser()

  const { error } = await supabase.rpc('close_ticket_via_qr', {
    _ticket_id: ticketId,
    _scanned_employee_no: scannedEmployeeNo,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/tickets/${ticketId}`)
}

export async function overrideCloseTicket(ticketId: string, reason?: string) {
  const { supabase } = await getSupabaseAndUser()

  const { error } = await supabase.rpc('override_close_ticket', {
    _ticket_id: ticketId,
    _reason: reason ?? null,
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/tickets/${ticketId}`)
}

export async function searchTickets(query: string) {
  const { supabase } = await getSupabaseAndUser()

  // Strip characters that are meaningful in PostgREST's .or() filter
  // grammar (commas separate conditions, parens group them) so a
  // pasted-in ticket number or title can't break the query string.
  const trimmed = query.trim().replace(/[,()]/g, '')
  if (!trimmed) return []

  const { data, error } = await supabase
    .from('tickets')
    .select('id, ticket_number, title, status')
    .is('deleted_at', null)
    .or(`ticket_number.ilike.%${trimmed}%,title.ilike.%${trimmed}%`)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw new Error(error.message)
  return data ?? []
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
      id, ticket_number, title, description, status, priority, created_at,
      due_at, first_response_due_at, first_response_at, resolved_at,
      category:ticket_categories!tickets_category_id_fkey(id, name),
      requester:employees!tickets_requester_id_fkey(full_name, employee_no, department),
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

  return (data ?? []).map((t): QueueTicket => {
    const category = Array.isArray(t.category) ? t.category[0] : t.category
    const requester = Array.isArray(t.requester) ? t.requester[0] : t.requester
    const assignedTo = Array.isArray(t.assigned_to) ? t.assigned_to[0] : t.assigned_to

    return {
      id: t.id,
      ticket_number: t.ticket_number,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      created_at: t.created_at,
      due_at: t.due_at,
      first_response_due_at: t.first_response_due_at,
      first_response_at: t.first_response_at,
      resolved_at: t.resolved_at,
      category: category ? { id: category.id, name: category.name } : null,
      requester: requester
        ? { full_name: requester.full_name, employee_no: requester.employee_no, department: requester.department }
        : null,
      assigned_to: assignedTo ? { id: assignedTo.id, full_name: assignedTo.full_name } : null,
      comment_count: t.comments?.[0]?.count ?? 0,
      attachment_count: t.attachments?.[0]?.count ?? 0,
    }
  })
}

export async function getTicketDetail(ticketId: string): Promise<TicketDetailData | null> {
  const { supabase } = await getSupabaseAndUser()

  const { data, error } = await supabase
    .from('tickets')
    .select(`
      id, ticket_number, title, description, status, priority, created_at,
      due_at, first_response_due_at, first_response_at, resolved_at, closed_at,
      category:ticket_categories!tickets_category_id_fkey(id, name),
      requester:employees!tickets_requester_id_fkey(id, full_name, employee_no, department),
      assigned_to:profiles!tickets_assigned_to_id_fkey(id, full_name, role)
    `)
    .eq('id', ticketId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  const category = Array.isArray(data.category) ? data.category[0] : data.category
  const requester = Array.isArray(data.requester) ? data.requester[0] : data.requester
  const assignedTo = Array.isArray(data.assigned_to) ? data.assigned_to[0] : data.assigned_to

  return {
    id: data.id,
    ticket_number: data.ticket_number,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    created_at: data.created_at,
    due_at: data.due_at,
    first_response_due_at: data.first_response_due_at,
    first_response_at: data.first_response_at,
    resolved_at: data.resolved_at,
    closed_at: data.closed_at,
    category: category ? { id: category.id, name: category.name } : null,
    requester: requester
      ? { id: requester.id, full_name: requester.full_name, employee_no: requester.employee_no, department: requester.department }
      : null,
    assigned_to: assignedTo ? { id: assignedTo.id, full_name: assignedTo.full_name, role: assignedTo.role } : null,
  }
}

export async function getAssignableStaff() {
  const { supabase } = await getSupabaseAndUser()

  // Managers are read-only across the whole ticket lifecycle (see
  // Project_Documentation.md role table) — excluded at the query level,
  // not just hidden in the UI, so a manager can never appear as an
  // assignee even via a stale client or a direct RPC call.
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('role', ['admin', 'agent'])
    .order('full_name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getTicketComments(ticketId: string): Promise<CommentRow[]> {
  const { supabase } = await getSupabaseAndUser()

  const { data, error } = await supabase
    .from('ticket_comments')
    .select(`
      id, body, is_internal, created_at,
      user:profiles!ticket_comments_user_id_fkey(full_name)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((c) => ({
    id: c.id,
    body: c.body,
    is_internal: c.is_internal,
    created_at: c.created_at,
    user: Array.isArray(c.user) ? c.user[0] ?? null : c.user,
  }))
}

export async function getTicketAttachments(ticketId: string): Promise<AttachmentRow[]> {
  const { supabase } = await getSupabaseAndUser()

  const { data, error } = await supabase
    .from('ticket_attachments')
    .select(`
      id, storage_path, original_filename, size_bytes, created_at,
      uploaded_by:profiles!ticket_attachments_uploaded_by_id_fkey(full_name)
    `)
    .eq('tickets_id', ticketId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((a) => ({
    id: a.id,
    storage_path: a.storage_path,
    original_filename: a.original_filename,
    size_bytes: a.size_bytes ?? 0, // column is nullable; treat missing size as 0 rather than crash formatBytes
    created_at: a.created_at,
    uploaded_by: Array.isArray(a.uploaded_by) ? a.uploaded_by[0] ?? null : a.uploaded_by,
  }))
}