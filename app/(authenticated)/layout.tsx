import React from "react"
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar"
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { MenuItem } from "@/lib/types/sidebar";
import { ADMIN_MENU, AGENT_MENU, MANAGER_MENU } from '@/config/navigation';
import type { UserRole } from "@/lib/types/sidebar"

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {

   console.log("root layout auth!")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()


  let currentMenuItems = [] as MenuItem[]

  if (profile?.role === 'admin')
  {
    currentMenuItems = ADMIN_MENU;
  }
  else if (profile?.role === 'manager')
  {
    currentMenuItems = MANAGER_MENU;
  }
  else if (profile?.role === 'agent')
  {
    currentMenuItems = AGENT_MENU;
  }

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