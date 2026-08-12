"use client"

import Image from "next/image"
import { useState } from "react"
import { Role } from "@/lib/types/dashboard"
import { usePathname, useRouter } from "next/navigation"
import { MenuItem, ROLE_MENUS, ROLE_AVATAR_COLORS } from "@/lib/types/sidebar"
import { ChevronDown, LogOut } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { signOut } from "@/lib/actions/auth-actions"

const activeText = "bg-linear-to-r from-[#008AAC] to-[#71BED1] bg-clip-text text-transparent font-medium"
const hoverText = "group-hover/item:bg-linear-to-r group-hover/item:from-[#008AAC] group-hover/item:to-[#71BED1] group-hover/item:bg-clip-text group-hover/item:text-transparent"
const activeStroke = "stroke-[url(#sidebar-icon-gradient)]"
const hoverStroke = "group-hover/item:stroke-[url(#sidebar-icon-gradient)]"

interface AppSidebarUser {
  name: string
  avatarUrl?: string | null
}

export function AppSidebar({ role, user }: { role: Role | string; user: AppSidebarUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const isIconOnly = state === "collapsed" && !isMobile

  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

  const navigate = (href: string) => {
    router.push(href)
    if (isMobile) setOpenMobile(false)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    signOut()
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="relative flex items-center justify-between">
        <div className="absolute inset-0 z-10 peer/trigger hidden items-center justify-center opacity-0 transition-opacity duration-200 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:hover:opacity-100">
          <SidebarTrigger />
        </div>

        <div className="flex w-full items-center justify-between transition-opacity duration-200 group-data-[collapsible=icon]:justify-center peer-hover/trigger:opacity-0">
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
                            className={`size-5 shrink-0 transition-all ${hoverStroke} ${
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

                const isOpen = openItem === menuItem.name
                const defaultHref = menuItem.subMenuItems?.[0]?.href // "Queue"

                return (
                  <Collapsible key={menuItem.name} open={isOpen}>
                    <SidebarMenuItem className="gap-y-px">
                      {isIconOnly ? (
                        <SidebarMenuButton
                          tooltip={menuItem.name}
                          isActive={active}
                          onClick={() => {
                            setOpenItem(menuItem.name)
                            if (defaultHref) navigate(defaultHref)
                          }}
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
                        // NOTE for debugging the "doesn't close" report:
                        // this handler is the ONLY thing in the whole file
                        // that calls setOpenItem for this branch. If a
                        // console.log at the top of this onClick doesn't
                        // fire on click, the click isn't reaching this
                        // button at all (stale bundle, wrong file actually
                        // imported, or something intercepting the click
                        // higher up) — that's a build/wiring problem, not
                        // a logic problem, and no amount of editing this
                        // function will fix it. If it DOES fire but the UI
                        // still doesn't visually close, log `isOpen` and
                        // `openItem` right after — that tells us whether
                        // state is updating but not re-rendering (a key/
                        // memoization issue) vs. not updating at all.
                        <SidebarMenuButton
                          tooltip={menuItem.name}
                          isActive={active}
                          onClick={() => {
                            console.log("Tickets clicked, isOpen was:", isOpen)
                            if (isOpen) {
                              setOpenItem(null)
                            } else {
                              setOpenItem(menuItem.name)
                              if (defaultHref) navigate(defaultHref)
                            }
                          }}
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

                          {typeof menuItem.badge === "number" && (
                            <span className="flex items-center justify-center size-5 rounded-full bg-[#008AAC] text-[#26343A] text-xs font-semibold shrink-0">
                              {menuItem.badge}
                            </span>
                          )}

                          {/*
                            Single icon that rotates, instead of swapping
                            between ChevronUp/ChevronDown. Two separate
                            icon components can't be animated between —
                            React unmounts one and mounts the other, so
                            there's no shared element for the transition
                            to interpolate. Rotating one icon 180° gives
                            the same visual end states with an actual
                            animation in between.
                          */}
                          <ChevronDown
                            className={`ml-auto size-4 shrink-0 transition-transform duration-200 ${
                              isOpen ? "rotate-180" : "rotate-0"
                            }`}
                          />
                        </SidebarMenuButton>
                      )}

                      {!isIconOnly && (
                        <CollapsibleContent>
                          <SidebarMenuSub className="pl-7 flex gap-y-0.75">
                            {menuItem.subMenuItems!.map((sub) => {
                              const subActive = pathname === sub.href
                              return (
                                <SidebarMenuSubItem key={sub.name}>
                                  <SidebarMenuSubButton
                                    isActive={subActive}
                                    onClick={() => navigate(sub.href)}
                                    className="h-9 px-4"
                                  >
                                    <sub.icon
                                      className={`size-3 shrink-0 ${
                                        subActive ? "stroke-[#008AAC]" : "stroke-[#26242A]"
                                      }`}
                                    />
                                    <span
                                      className={`flex-1 text-left text-[13px] ${
                                        subActive ? activeText : `text-[#26242A] ${hoverText}`
                                      }`}
                                    >
                                      {sub.name}
                                    </span>
                                    {sub.trailingIcon && (
                                      <sub.trailingIcon className="size-3 shrink-0 stroke-[#008AAC]" />
                                    )}
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

      <SidebarFooter className="flex-row p-2 w-full shadow-[0_-0.5px_0_0_rgba(255,255,255,0.3)] relative flex items-center justify-between group-data-[collapsible=icon]:justify-center">
        <div className="flex flex-1 items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          {/* Avatar + name — hidden entirely when icon-collapsed, same
              pattern as the logo row in the header, since there's no room
              for the name at that width. */}
          <div className="flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:hidden">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: ROLE_AVATAR_COLORS[role as Role] ?? "#6B7280" }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-sm font-medium text-[#26242A]">{user.name}</span>
          </div>
 
          <AlertDialog>
            <AlertDialogTrigger
              aria-label="Log out"
              className="group/logout flex size-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-[#008AAC]"
            >
              <LogOut className="size-4 stroke-[#26242A] transition-colors group-hover/logout:stroke-white" />
            </AlertDialogTrigger>
 
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Log out of Sci.Port?</AlertDialogTitle>
                <AlertDialogDescription>
                  You&apos;ll need to sign in again to access your tickets and dashboard.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-[#008AAC]" onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? "Logging out…" : "Log out"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}