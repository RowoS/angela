import React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/session"

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.role) redirect('/login?error=no-profile')

  return (
    <div className="bg-[#F8F8F8] w-full min-h-screen">
      <SidebarProvider>
        <AppSidebar role={user.role} />
        <main className="flex min-h-screen flex-row justify-center flex-1 overflow-y-auto">
          {children}
        </main>
      </SidebarProvider>
    </div>
  )
}