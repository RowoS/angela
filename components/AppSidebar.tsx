import Image from "next/image"
import { MenuItem } from "@/lib/types/sidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarGroupLabel
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  roleMenuItems: MenuItem[];
}

export function AppSidebar({ roleMenuItems }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="relative flex items-center justify-between">
        <div className="absolute inset-0 z-10 peer/trigger hidden items-center justify-center opacity-0 transition-opacity duration-200 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:hover:opacity-100">
          <SidebarTrigger />
        </div>

        <div className="flex w-full items-center justify-between transition-opacity duration-200 group-data-[collapsible=icon]:justify-center peer-hover/trigger:opacity-0">
          <div className="flex items-center group-data-[collapsible=icon]:hidden">
            <div className="flex flex-col w-fit h-fit pl-2 pr-1.5 py-1.5">
              <Image
                src="/logo-icon-light.svg"
                alt="Brand Logo"
                width={27}
                height={28}
                className="w-full h-auto shrink-0"
              />
            </div>
            <div className="flex flex-row items-center text-lg">
              <p className="font-redhat text-[#26343A] font-black ">Sci</p>
              <p className="text-white">.</p>
              <p className="font-redhat text-[#26343A] font-black ">Part</p>
            </div>
          </div>

          <div className="hidden group-data-[collapsible=icon]:block">
            <Image
                src="/logo-icon-light.svg"
                alt="Brand Logo"
                width={27}
                height={28}
                className="w-full h-auto shrink-0"
            />
          </div>
        </div>

        <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>MAIN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <svg width="0" height="0" className="absolute">
                <defs>
                  <linearGradient 
                    id="sidebar-icon-gradient" 
                    x1="0" 
                    y1="0" 
                    x2="24" 
                    y2="24" 
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#008AAC" />
                    <stop offset="100%" stopColor="#71BED1" />
                  </linearGradient>
                </defs>
              </svg>

              {roleMenuItems.map((menuItem) => (
                <SidebarMenuItem key={menuItem.name}>
                  <SidebarMenuButton
                    tooltip={menuItem.name}
                    className="group/item flex items-center gap-3.5 text-[#26242A] transition-all hover:bg-[#D1D1D1] group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:p-0!"
                  >
                    <span className="flex flex-row justify-center p-1">
                      <menuItem.icon className="shrink-0 transition-all group-hover/item:stroke-[url(#sidebar-icon-gradient)]"/>
                    </span>
                    <span className="transition-all group-data-[collapsible=icon]:hidden group-hover/item:bg-linear-to-r group-hover/item:from-[#008AAC] group-hover/item:to-[#71BED1] group-hover/item:bg-clip-text group-hover/item:text-transparent">
                      {menuItem.name}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}