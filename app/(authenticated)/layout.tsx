import React from "react"
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar"
import { ADMIN_MENU, AGENT_MENU, MANAGER_MENU } from '@/config/navigation';
import type { UserRole } from "@/lib/types/sidebar"

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    // TODO(Backend): To fetch user role
    console.log("root layout auth!")

    const userRole: UserRole = "admin"

    // Pick the right navigation menu for this user's role
    const currentMenuItems =
        userRole === "admin"
            ? ADMIN_MENU
            : userRole === "manager"
            ? MANAGER_MENU
            : AGENT_MENU

    return (
        <div className="bg-[#F8F8F8] w-full min-h-screen">
            <SidebarProvider>
                <AppSidebar roleMenuItems={currentMenuItems} />
                <main className="flex min-h-screen flex-row justify-center flex-1 overflow-y-auto">
                    { children }
                </main>
            </SidebarProvider>
        </div>
    )
}