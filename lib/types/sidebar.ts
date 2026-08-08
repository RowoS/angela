import { 
    LucideIcon,
    LayoutDashboard,
    Ticket,
    ListFilter,
    CirclePlus,
    CalendarDays,
    DoorOpen,
    ChartNoAxesColumn,
    BookOpen,
    Activity,
    Settings
} from "lucide-react"
import { Role } from "./dashboard"

export interface SubMenuItem {
    name: string
    icon: LucideIcon
    href: string
}

export interface MenuItem {
    name: string
    icon: LucideIcon
    badge?: number
    href: string
    subMenuItems?: SubMenuItem[]
}

export const ROLE_MENUS: Record<Role, MenuItem[]> = {
    admin: [
        {
            name: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
        },
        {
            name: "Tickets",
            icon: Ticket,
            badge: 3,
            href: "/tickets",
            subMenuItems: [
                {
                    name: "Queue",
                    icon: ListFilter,
                    href: "/tickets/queue"
                },
                {
                    name: "Assigned to Me",
                    icon: LayoutDashboard,
                    href: "/tickets/assigned"
                },
                {
                    name: "New Ticket",
                    icon: CirclePlus,
                    href: "/tickets/new"
                }
            ]
        },
        {
            name: "Calendar",
            icon: CalendarDays,
            href: "/calendar"
        },
        {
            name: "Rooms",
            icon: DoorOpen,
            href: "/rooms"
        },
        {
            name: "Reports",
            icon: ChartNoAxesColumn,
            href: "/reports"
        },
        {
            name: "Knowledge Base",
            icon: BookOpen,
            href: "/learn"
        },
        {
            name: "Activity Log",
            icon: Activity,
            href: "/activity"
        },
        {
            name: "Settings",
            icon: Settings,
            href: "/settings"
        }
    ],
    agent: [
        {
            name: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
        },
        {
            name: "Tickets",
            icon: Ticket,
            badge: 3,
            href: "/tickets",
            subMenuItems: [
                {
                    name: "Queue",
                    icon: ListFilter,
                    href: "/tickets/queue"
                },
                {
                    name: "Assigned to Me",
                    icon: LayoutDashboard,
                    href: "/tickets/assigned"
                },
                {
                    name: "New Ticket",
                    icon: CirclePlus,
                    href: "/tickets/new"
                }
            ]
        },
        {
            name: "Calendar",
            icon: CalendarDays,
            href: "/calendar"
        },
        {
            name: "Rooms",
            icon: DoorOpen,
            href: "/rooms"
        },
        {
            name: "Knowledge Base",
            icon: BookOpen,
            href: "/articles"
        },
        {
            name: "Activity Log",
            icon: Activity,
            href: "/activity"
        }
    ],
    manager: [
        {
            name: "Dashboard",
            icon: LayoutDashboard,
            href: "/dashboard",
        },
        {
            name: "Tickets",
            icon: Ticket,
            badge: 3,
            href: "/tickets",
            subMenuItems: [
                {
                    name: "Queue",
                    icon: ListFilter,
                    href: "/tickets/queue"
                }
            ]
        },
        {
            name: "Calendar",
            icon: CalendarDays,
            href: "/calendar"
        },
        {
            name: "Reports",
            icon: ChartNoAxesColumn,
            href: "/reports"
        },
        {
            name: "Knowledge Base",
            icon: BookOpen,
            href: "/articles"
        }
    ]
}