'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Notification = {
  id: string
  recipient_id: string
  event_type: string
  entity_type: string
  entity_id: string
  title: string
  body: string | null
  is_read: boolean
  created_at: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Memoized regardless of whether lib/supabase/client.ts already
  // singletons internally — relying on that as an unverified
  // implementation detail is how you get an effect (and its realtime
  // subscription) silently torn down and rebuilt on every render.
  const supabase = useMemo(() => createClient(), [])
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    let cancelled = false

    async function initializeNotifications() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data && !cancelled) setNotifications(data)

      // Exact count, not derived from the 50-row page — deriving it
      // from the page undercounts once a user has more than 50
      // notifications with unread ones outside that window.
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)

      if (cancelled) return
      setUnreadCount(count ?? 0)

      const channel = supabase
        .channel(`user-notifications-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${user.id}` },
          (payload) => {
            const newNotification = payload.new as Notification
            setNotifications((prev) => [newNotification, ...prev])
            setUnreadCount((prev) => prev + 1)
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${user.id}` },
          (payload) => {
            const updated = payload.new as Notification
            // Requires REPLICA IDENTITY FULL on notifications (see
            // 20260810140000_notifications_realtime.sql) — without
            // it, payload.old only has the primary key and `is_read`
            // here is undefined, so this branch never fires.
            const old = payload.old as Partial<Notification>
            setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
            if (old.is_read === false && updated.is_read === true) {
              setUnreadCount((prev) => Math.max(0, prev - 1))
            } else if (old.is_read === true && updated.is_read === false) {
              setUnreadCount((prev) => prev + 1)
            }
          }
        )
        .subscribe()

      if (cancelled) {
        // Effect was cleaned up while the async setup above was still
        // in flight (React 18 Strict Mode double-invokes effects in
        // dev) — tear down immediately instead of leaking a channel
        // no one holds a reference to.
        supabase.removeChannel(channel)
        return
      }

      channelRef.current = channel
    }

    initializeNotifications()

    return () => {
      cancelled = true
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [supabase])

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false)
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}