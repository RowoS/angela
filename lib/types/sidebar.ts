import { LucideIcon } from "lucide-react"

export interface MenuItem {
    name: string
    icon: LucideIcon
    badge?: number
}

export type UserRole = 'agent' | 'admin' | 'manager'

export interface SidebarConfig {
    role: UserRole
    items: MenuItem[]
}