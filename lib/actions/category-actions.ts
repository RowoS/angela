'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

import type { TicketPriority, CategoryRow, CategoryWithChildren } from '../utils/category-utils'

async function getSupabaseAndUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')
  return { supabase, user }
}

// generate_ticket_number() prefixes every ticket number with this code,
// so it has to be short, stable, and safe to concatenate unescaped —
// hence the restrictive charset rather than allowing free text.
const CODE_PATTERN = /^[A-Z0-9_-]{2,10}$/

function normalizeCode(code: string): string {
  const normalized = code.trim().toUpperCase()
  if (!CODE_PATTERN.test(normalized)) {
    throw new Error('Code must be 2-10 characters: A-Z, 0-9, "-", or "_".')
  }
  return normalized
}

function normalizeName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Name is required.')
  return trimmed
}

export async function getCategories(): Promise<CategoryWithChildren[]> {
  const { supabase } = await getSupabaseAndUser()
  const { data, error } = await supabase
    .from('ticket_categories')
    .select('id, name, code, default_priority, default_sla_id, parent_id')
    .order('name')

  if (error) throw new Error(error.message)

  const rows = data ?? []
  const byParent = new Map<string, CategoryRow[]>()
  for (const row of rows) {
    if (row.parent_id === null) continue
    const siblings = byParent.get(row.parent_id) ?? []
    siblings.push(row)
    byParent.set(row.parent_id, siblings)
  }

  return rows
    .filter((row) => row.parent_id === null)
    .map((root) => ({ ...root, subcategories: byParent.get(root.id) ?? [] }))
}

export async function createCategory(input: {
  name: string
  code: string
  default_priority: TicketPriority
  default_sla_id?: string | null
  parent_id?: string | null
}) {
  const { supabase } = await getSupabaseAndUser()

  const { error } = await supabase.from('ticket_categories').insert({
    name: normalizeName(input.name),
    code: normalizeCode(input.code),
    default_priority: input.default_priority,
    default_sla_id: input.default_sla_id ?? null,
    parent_id: input.parent_id ?? null,
  })

  if (error) {
    if (error.code === '23505') throw new Error(`Code "${input.code.toUpperCase()}" is already in use.`)
    throw new Error(error.message)
  }
  revalidatePath('/settings')
}

export async function updateCategory(
  id: string,
  input: Partial<{
    name: string
    code: string
    default_priority: TicketPriority
    default_sla_id: string | null
  }>
) {
  const { supabase } = await getSupabaseAndUser()

  const patch: Record<string, unknown> = {}
  if (input.name !== undefined) patch.name = normalizeName(input.name)
  if (input.code !== undefined) patch.code = normalizeCode(input.code)
  if (input.default_priority !== undefined) patch.default_priority = input.default_priority
  if (input.default_sla_id !== undefined) patch.default_sla_id = input.default_sla_id

  const { error } = await supabase.from('ticket_categories').update(patch).eq('id', id)
  if (error) {
    if (error.code === '23505') throw new Error('That code is already in use.')
    throw new Error(error.message)
  }
  revalidatePath('/settings')
}

export async function deleteCategory(id: string) {
  const { supabase } = await getSupabaseAndUser()

  // No ON DELETE behavior is defined on the FKs from tickets or
  // ticket_categories.parent_id, so a category still in use — by a
  // ticket, a counter row, or a subcategory — fails at the database.
  // Surface that as a clear message instead of a raw postgres error.
  const { error } = await supabase.from('ticket_categories').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') {
      throw new Error('This category is still in use (tickets or subcategories reference it) and cannot be deleted.')
    }
    throw new Error(error.message)
  }
  revalidatePath('/settings')
}