"use client"

import { Menu } from 'lucide-react'
import { usePathname } from "next/navigation"
import { Role } from "@/lib/types/dashboard"
import { getMenuLabelForPath } from "@/lib/types/sidebar"
import { useSidebar } from "@/components/ui/sidebar"
import { NotificationPopover } from '@/components/notifications/NotificationPopover'

interface DashboardHeaderProps {
    role: Role | string;
}

export default function DashboardHeader({ role }: DashboardHeaderProps) {
    const pathname = usePathname()
    const menuItem = getMenuLabelForPath(role as Role, pathname)

    const { toggleSidebar } = useSidebar()

    return (
        <div className="flex flex-col w-full">
            <div className="flex flex-row justify-between w-full h-14 px-4 items-center bg-white shadow-[0_0.5px_0_0_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        aria-label="Toggle sidebar"
                        className="md:hidden -ml-1 flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-[#F2F2F2] transition-colors"
                    >
                        <Menu className="w-13 size-7 stroke-white bg-[#008AAC] py-1 rounded-sm" />
                    </button>
                    <span className='flex flex-col justify-center font-redhat font-extrabold text-base text-[#040404]'>
                        {menuItem}
                    </span>
                </div>
                
                {/* Dynamically handles UI, Badges, and Popover State */}
                <NotificationPopover />
            </div>
        </div>
    )
}