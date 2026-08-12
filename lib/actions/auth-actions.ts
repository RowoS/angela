'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserRole, roleHomeRoute } from '@/lib/actions/role-actions'

const PASSWORD_MIN_LENGTH = 8

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')

  const role = await getCurrentUserRole(supabase, data.user.id)
  redirect(roleHomeRoute(role))
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Check your email to confirm your account')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// Called from /reset-password on first login. Two writes, in order:
//   1. auth.updateUser() — changes the actual credential.
//   2. rpc('complete_password_setup') — the ONLY path that can clear
//      profiles.password_reset_required; trg_prevent_password_flag_bypass
//      rejects a plain UPDATE to that column from a non-admin.
// If step 1 succeeds but step 2 fails, the user keeps a valid new password
// but stays gated at /reset-password and can just resubmit — no partial-
// auth state, just a redundant (harmless) password re-set.
export async function completePasswordReset(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    redirect(
      '/reset-password?error=' +
        encodeURIComponent(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
    )
  }

  if (password !== confirmPassword) {
    redirect('/reset-password?error=' + encodeURIComponent('Passwords do not match.'))
  }

  const { error: updateError } = await supabase.auth.updateUser({ password })
  if (updateError) {
    redirect('/reset-password?error=' + encodeURIComponent(updateError.message))
  }

  const { error: rpcError } = await supabase.rpc('complete_password_setup')
  if (rpcError) {
    redirect('/reset-password?error=' + encodeURIComponent(rpcError.message))
  }

  revalidatePath('/', 'layout')

  const role = await getCurrentUserRole(supabase, user.id)
  redirect(roleHomeRoute(role))
}