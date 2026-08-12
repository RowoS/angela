'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { NOTIFICATION_EVENT_ORDER } from '@/lib/utils/notification-utils'
import type { NotificationEvent, NotificationSettingRow } from '@/lib/utils/notification-utils'

async function getSupabaseAndUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')
  return { supabase, user }
}

export async function getNotificationSettings(): Promise<NotificationSettingRow[]> {
  const { supabase } = await getSupabaseAndUser()
  const { data, error } = await supabase
    .from('notification_settings')
    .select('event_type, in_app')

  if (error) throw new Error(error.message)

  // The migration seeds every event on install, but fall back to "on"
  // for anything unexpectedly missing rather than silently dropping a
  // row from the UI — a missing toggle is more confusing than a
  // possibly-wrong default.
  const byEvent = new Map((data ?? []).map((r) => [r.event_type as NotificationEvent, r.in_app]))
  return NOTIFICATION_EVENT_ORDER.map((event_type) => ({
    event_type,
    in_app: byEvent.get(event_type) ?? true,
  }))
}

// RLS (`notification_settings_manage_admin`) is the authorization
// boundary; there's no business-rule validation needed here beyond
// the type system, unlike upsertSla's minute-ordering check.
export async function updateNotificationSetting(event_type: NotificationEvent, in_app: boolean) {
  const { supabase } = await getSupabaseAndUser()

  const { error } = await supabase
    .from('notification_settings')
    .update({ in_app })
    .eq('event_type', event_type)

  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}