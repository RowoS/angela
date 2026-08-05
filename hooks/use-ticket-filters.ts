import { useMemo, useState } from 'react'
import type { QueueTicket } from '@/lib/actions/ticket-actions'
import type { Database } from '@/lib/supabase/types'

type Priority = Database['public']['Enums']['ticket_priority']
type Status = Database['public']['Enums']['ticket_status']
export type SortKey = 'ticket_number' | 'priority' | 'status' | 'created_at' | 'due_at'

const PRIORITY_ORDER: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 }

export function useTicketFilters(tickets: QueueTicket[]) {
  // 1. State Management
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // 2. Derived Data (Categories)
  const categories = useMemo(
    () => [
      'all',
      ...Array.from(new Set(tickets.map((t) => t.category?.name).filter((n): n is string => !!n))),
    ],
    [tickets]
  )

  // 3. Heavy Filtering & Sorting Logic
  const filteredTickets = useMemo(() => {
    return tickets
      .filter((t) => {
        if (filterStatus !== 'all' && t.status !== filterStatus) return false
        if (filterPriority !== 'all' && t.priority !== filterPriority) return false
        if (filterCategory !== 'all' && t.category?.name !== filterCategory) return false
        
        if (search) {
          const q = search.toLowerCase()
          return (
            t.title.toLowerCase().includes(q) ||
            t.ticket_number.toLowerCase().includes(q) ||
            (t.requester?.full_name ?? '').toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => {
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

  // 4. Action Handlers
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // 5. Expose State and Actions
  return {
    state: {
      search,
      filterStatus,
      filterPriority,
      filterCategory,
      sortKey,
      sortDir,
    },
    actions: {
      setSearch,
      setFilterStatus,
      setFilterPriority,
      setFilterCategory,
      toggleSort,
    },
    data: {
      categories,
      filteredTickets,
    },
  }
}