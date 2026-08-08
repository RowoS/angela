import React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/session"
import DashboardHeader from "@/components/DashboardHeader"

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  // CHANGED THE ROUTING FOR OPTIMIZATION: PLEASE REVIEW AND MAKE CHANGES ACCORDINGLY
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.role) redirect('/login?error=no-profile')

  return (
    <div className="bg-[#F8F8F8] w-full min-h-screen">
      <SidebarProvider>
        <AppSidebar role={user.role} user={{ name: user.name }} />
        <main className="flex min-h-screen flex-col flex-1 overflow-y-auto">
          <DashboardHeader role={user.role} />
          {children}
        </main>
      </SidebarProvider>
    </div>
  )
}