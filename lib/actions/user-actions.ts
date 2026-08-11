'use server'

import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/actions/role-actions'
import { type UserRole, type UserRow } from '@/lib/utils/user-utils'

async function requireAdminCaller() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  // listUsers/createUser below run on the service-role client, which
  // bypasses RLS entirely — this is the only thing standing between
  // any signed-in caller and full user management for those two.
  await requireRole(supabase, user.id, ['admin'])
  return { supabase, userId: user.id }
}

export async function listUsers(): Promise<UserRow[]> {
  await requireAdminCaller()
  const admin = createAdminClient()

  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id, full_name, department, role, created_at')
    .order('created_at', { ascending: false })

  if (profilesError) throw new Error(profilesError.message)

  // profiles has no email column — auth.users is the source of truth
  // for that, and reading it requires the admin API rather than a
  // table select.
  const { data: authList, error: authError } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (authError) throw new Error(authError.message)

  const emailById = new Map(authList.users.map((u) => [u.id, u.email ?? null]))

  return (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    department: p.department,
    role: p.role as UserRole,
    created_at: p.created_at,
    email: emailById.get(p.id) ?? null,
  }))
}

function generateTempPassword(length = 14): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) out += charset[bytes[i] % charset.length]
  return out
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function createUser(input: {
  full_name: string
  email: string
  department: string
  role: UserRole
}): Promise<{ tempPassword: string }> {
  await requireAdminCaller()

  const fullName = input.full_name.trim()
  const email = input.email.trim().toLowerCase()
  const department = input.department.trim()

  if (!fullName) throw new Error('Name is required.')
  if (!EMAIL_PATTERN.test(email)) throw new Error('Enter a valid email address.')

  const admin = createAdminClient()
  const tempPassword = generateTempPassword()

  // email_confirm: true — no invite email, no round-trip. handle_new_user()
  // reads full_name/role/department out of user_metadata and creates the
  // profiles row; password_reset_required defaults to true there, which
  // is what forces the reset flow on this user's first login.
  const { error } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: input.role, department },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      throw new Error('A user with that email already exists.')
    }
    throw new Error(error.message)
  }

  revalidatePath('/settings')
  return { tempPassword }
}

export async function updateUserRoleDepartment(
  userId: string,
  input: { role: UserRole; department: string }
) {
  // Stays on the normal session-bound client — profiles_update_own
  // already permits admins to update any profile row, so there's no
  // RLS bypass here to compensate for with an extra check.
  const { supabase } = await requireAdminCaller()

  const { error } = await supabase
    .from('profiles')
    .update({ role: input.role, department: input.department.trim() || null })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}