import { MenuItem } from "@/lib/types/sidebar"
import { 
    LayoutDashboard,
    Ticket,
    CalendarDays,
    DoorOpen,
    ChartNoAxesColumn,
    BookOpen,
    Activity,
    Settings
} from "lucide-react";

export const ADMIN_MENU: MenuItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Tickets', icon: Ticket },
    { name: 'Calendar', icon: CalendarDays },
    { name: 'Rooms', icon: DoorOpen },
    { name: 'Reports', icon: ChartNoAxesColumn },
    { name: 'Knowledge Base', icon: BookOpen },
    { name: 'Activity Log', icon: Activity },
    { name: 'Settings', icon: Settings }
]

export const AGENT_MENU: MenuItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Tickets', icon: Ticket },
    { name: 'Calendar', icon: CalendarDays },
    { name: 'Rooms', icon: DoorOpen },
    { name: 'Knowledge Base', icon: BookOpen },
    { name: 'Settings', icon: Settings }
]

export const MANAGER_MENU: MenuItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Reports', icon: ChartNoAxesColumn },
    { name: 'Knowledge Base', icon: BookOpen },
    { name: 'Activity Log', icon: Activity },
    { name: 'Settings', icon: Settings }
]

