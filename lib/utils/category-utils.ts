export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export type CategoryRow = {
  id: string
  name: string
  code: string
  default_priority: TicketPriority
  default_sla_id: string | null
  parent_id: string | null
}

export type CategoryWithChildren = CategoryRow & { subcategories: CategoryRow[] }