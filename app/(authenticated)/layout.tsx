import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar"
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

const ADMIN_MENU = [
    { name: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Tickets', url: '/admin/tickets', icon: Ticket },
    { name: 'Calendar', url: '/admin/calendar', icon: CalendarDays },
    { name: 'Rooms', url: '/admin/rooms', icon: DoorOpen },
    { name: 'Reports', url: '/admin/reports', icon: ChartNoAxesColumn },
    { name: 'Knowledge Base', url: '/admin/knowledge-base', icon: BookOpen },
    { name: 'Activity Log', url: '/admin/activity-log', icon: Activity },
    { name: 'Settings', url: '/admin/settings', icon: Settings },
]

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    // TODO(Backend): To fetch user role
    const role = 'admin' // for testing only

    let currentMenuItems = ADMIN_MENU
    if (role === 'admin') currentMenuItems = ADMIN_MENU;

    return (
        <div className="bg-[#F8F8F8] w-full h-full">
            <SidebarProvider>
                <AppSidebar roleMenuItems={currentMenuItems} />
                <main className="flex flex-row justify-center w-full h-full">
                    { children }
                </main>
            </SidebarProvider>
        </div>
    )
}