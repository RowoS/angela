"use client"

import Image from "next/image"
import { useState } from "react"
import { Role, ROLE } from "@/lib/types/dashboard"
import { usePathname, useRouter } from "next/navigation"
import { MenuItem, ROLE_MENUS } from "@/lib/types/sidebar"
import {
  ChevronRight,
  TicketIcon
} from "lucide-react"
import {
  useSidebar,
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
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

const activeText = "bg-linear-to-r from-[#008AAC] to-[#71BED1] bg-clip-text text-transparent font-medium"
const hoverText = "group-hover/item:bg-linear-to-r group-hover/item:from-[#008AAC] group-hover/item:to-[#71BED1] group-hover/item:bg-clip-text group-hover/item:text-transparent"
const activeStroke = "stroke-[url(#sidebar-icon-gradient)]"
const hoverStroke = "group-hover/item:stroke-[url(#sidebar-icon-gradient)]"

export function AppSidebar({ role }: { role: Role | string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const isIconOnly = state === "collapsed" && !isMobile

  const currentMenuItems = ROLE_MENUS[role as Role] || []

  const [openItem, setOpenItem] = useState<string | null>(
    currentMenuItems.find((item) =>
      item.subMenuItems?.some((sub) => pathname.startsWith(sub.href))
    )?.name ?? null
  )

  const isActive = (item: MenuItem) =>
    item.subMenuItems?.length
      ? item.subMenuItems.some((sub) => pathname.startsWith(sub.href))
      : pathname === item.href

  // Single navigation helper used by every menu button. Since we're not
  // using <Link>, this is what actually moves the page — router.push does
  // a client-side transition, same as Link would, it's just triggered from
  // a <button>'s onClick instead of an <a>'s href.
  const navigate = (href: string) => {
    router.push(href)
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="relative flex items-center justify-between">
        <div className="absolute inset-0 z-10 peer/trigger hidden items-center justify-center opacity-0 transition-opacity duration-200 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:hover:opacity-100">
          <SidebarTrigger />
        </div>

        <div className="flex w-full items-center justify-between transition-opacity duration-200 group-data-[collapsible=icon]:justify-center peer-hover/trigger:opacity-0">
          {/* Logo/home button — a real <button> with onClick, same reasoning
              as every menu item below: no <a>/<button> nesting anywhere. */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center group-data-[collapsible=icon]:hidden"
          >
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
              <p className="font-redhat text-[#26343A] font-black ">Port</p>
            </div>
          </button>

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
          <SidebarGroupLabel>NAVIGATION</SidebarGroupLabel>
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

              {currentMenuItems.map((menuItem) => {
                const active = isActive(menuItem)
                const hasSubItems = !!menuItem.subMenuItems?.length

                // --- Simple item: no sub-items ---
                // SidebarMenuButton renders its own <button> (no asChild),
                // so we drive navigation from its onClick instead of
                // wrapping/nesting a <Link> inside or around it.
                if (!hasSubItems) {
                  return (
                    <SidebarMenuItem key={menuItem.name}>
                      <SidebarMenuButton
                        tooltip={menuItem.name}
                        isActive={active}
                        onClick={() => navigate(menuItem.href)}
                        className="group/item flex items-center gap-3.5 text-[#26242A] transition-all hover:bg-[#D1D1D1] data-[active=true]:bg-[#D1D1D1] group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:p-0!"
                      >
                        <span className="flex flex-row justify-center p-1">
                          <menuItem.icon
                            className={`shrink-0 transition-all ${hoverStroke} ${
                              active ? activeStroke : ""
                            }`}
                          />
                        </span>
                        <span
                          className={`transition-all group-data-[collapsible=icon]:hidden ${hoverText} ${
                            active ? activeText : ""
                          }`}
                        >
                          {menuItem.name}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                // --- Parent item with sub-items (e.g. "Ticket") ---
                const isOpen = openItem === menuItem.name
                const defaultHref = menuItem.subMenuItems?.[0]?.href // "Queue"

                return (
                  <Collapsible
                    key={menuItem.name}
                    open={isOpen}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      {isIconOnly ? (
                        // Collapsed to icons: no room for a submenu, so this
                        // button just navigates straight to the default
                        // sub-item (Queue) instead of expanding anything.
                        <SidebarMenuButton
                          tooltip={menuItem.name}
                          isActive={active}
                          onClick={() => defaultHref && navigate(defaultHref)}
                          className="group/item flex items-center gap-3.5 text-[#26242A] transition-all hover:bg-[#D1D1D1] data-[active=true]:bg-[#D1D1D1] group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:p-0!"
                        >
                          <span className="flex flex-row justify-center p-1">
                            <menuItem.icon
                              className={`shrink-0 transition-all ${hoverStroke} ${
                                active ? activeStroke : ""
                              }`}
                            />
                          </span>
                        </SidebarMenuButton>
                      ) : (
                        // Expanded: this button ONLY toggles the submenu open/
                        // closed — it does not navigate. That mirrors how a
                        // parent nav item with children usually behaves, and
                        // sidesteps needing a second nested control on the
                        // same element to do two different jobs.
                        <SidebarMenuButton
                          tooltip={menuItem.name}
                          isActive={active}
                          onClick={() =>
                            setOpenItem(isOpen ? null : menuItem.name)
                          }
                          className="group/item flex items-center gap-3.5 text-[#26242A] transition-all hover:bg-[#D1D1D1] data-[active=true]:bg-[#D1D1D1]"
                        >
                          <span className="flex flex-row justify-center p-1">
                            <menuItem.icon
                              className={`shrink-0 transition-all ${hoverStroke} ${
                                active ? activeStroke : ""
                              }`}
                            />
                          </span>
                          <span
                            className={`flex-1 text-left transition-all ${hoverText} ${
                              active ? activeText : ""
                            }`}
                          >
                            {menuItem.name}
                          </span>
                          <ChevronRight
                            className={`ml-auto size-4 shrink-0 transition-transform duration-200 ${
                              isOpen ? "rotate-90" : ""
                            }`}
                          />
                        </SidebarMenuButton>
                      )}

                      {!isIconOnly && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {menuItem.subMenuItems!.map((sub) => {
                              const subActive = pathname === sub.href
                              return (
                                <SidebarMenuSubItem key={sub.name}>
                                  <SidebarMenuSubButton
                                    isActive={subActive}
                                    onClick={() => navigate(sub.href)}
                                    className="flex items-center gap-2.5 data-[active=true]:bg-[#D1D1D1]"
                                  >
                                    <TicketIcon
                                      className={`size-3.5 shrink-0 ${
                                        subActive ? "stroke-[#008AAC]" : "stroke-[#26242A]"
                                      }`}
                                    />
                                    <span className={subActive ? activeText : ""}>
                                      {sub.name}
                                    </span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}