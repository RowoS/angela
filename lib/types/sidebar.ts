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
    Settings,
    QrCode
} from "lucide-react"
import { Role } from "./dashboard"

export interface SubMenuItem {
    name: string
    icon: LucideIcon
    href: string
    trailingIcon?: LucideIcon
}

export interface MenuItem {
    name: string
    icon: LucideIcon
    badge?: number
    href: string
    subMenuItems?: SubMenuItem[]
}

export const ROLE_AVATAR_COLORS: Record<Role, string> = {
    admin: "#008AAC",
    agent: "#5B8DEF",
    manager: "#8B5CF6"
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
                    href: "/tickets/new",
                    trailingIcon: QrCode
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
            href: "/admin/rooms"
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
                    href: "/tickets/new",
                    trailingIcon: QrCode
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
            href: "/learn"
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
            href: "/learn"
        }
    ]
}

export function getMenuLabelForPath(role: Role, pathname: string): string {
    const items = ROLE_MENUS[role] ?? []
 
    type Candidate = { label: string; hrefLength: number }
    const matches = (href: string) => pathname === href || pathname.startsWith(href + "/")
 
    const candidates: Candidate[] = []
    for (const item of items) {
        if (matches(item.href)) {
            candidates.push({ label: item.name, hrefLength: item.href.length })
        }
        for (const sub of item.subMenuItems ?? []) {
            if (matches(sub.href)) {
                candidates.push({ label: sub.name, hrefLength: sub.href.length })
            }
        }
    }
 
    if (candidates.length === 0) return "Dashboard"
 
    return candidates.reduce((best, current) =>
        current.hrefLength > best.hrefLength ? current : best
    ).label
}