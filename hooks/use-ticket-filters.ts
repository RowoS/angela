import { useMemo, useState } from 'react'
import type { QueueTicket } from '@/lib/types/tickets'
import { filterTickets } from '@/lib/types/tickets'
import type { Database } from '@/lib/supabase/types'

type Priority = Database['public']['Enums']['ticket_priority']
type Status = Database['public']['Enums']['ticket_status']
export type SortKey = 'ticket_number' | 'priority' | 'status' | 'created_at' | 'due_at'

export type TicketStatusFilter =
  | 'all'
  | 'pending_confirmation'
  | 'open'
  | 'in_progress'
  | 'on_hold'
  | 'resolved'
  | 'closed'
  | 'reopened'
  | 'cancelled'

const PRIORITY_ORDER: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 }

export function useTicketFilters(tickets: QueueTicket[]) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const categories = useMemo(
    () => [
      'all',
      ...Array.from(new Set(tickets.map((t) => t.category?.name).filter((n): n is string => !!n))),
    ],
    [tickets]
  )

  const filteredTickets = useMemo(() => {
    const filtered = filterTickets(tickets, {
      search: search || undefined,
      status: filterStatus,
      priority: filterPriority,
      category: filterCategory,
    })

    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'priority') {
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      } else if (sortKey === 'created_at' || sortKey === 'due_at') {
        const av = a[sortKey] ? new Date(a[sortKey] as string).getTime() : 0
        const bv = b[sortKey] ? new Date(b[sortKey] as string).getTime() : 0
        cmp = av - bv
      } else {
        cmp = a[sortKey].localeCompare(b[sortKey])
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [tickets, search, filterStatus, filterPriority, filterCategory, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return {
    state: { search, filterStatus, filterPriority, filterCategory, sortKey, sortDir },
    actions: { setSearch, setFilterStatus, setFilterPriority, setFilterCategory, toggleSort },
    data: { categories, filteredTickets },
  }
}

export function useTicketFilter<T extends { status: string }>(initialTickets: T[]) {
  const [activeFilter, setActiveFilter] = useState<TicketStatusFilter>('all')

  const filteredTickets = useMemo(() => {
    if (activeFilter === 'all') return initialTickets
    return initialTickets.filter((ticket) => ticket.status === activeFilter)
  }, [initialTickets, activeFilter])

  return { activeFilter, setActiveFilter, filteredTickets }
}