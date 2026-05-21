"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import {
  BellIcon,
  CheckIcon,
  LanguagesIcon,
  SearchIcon,
} from "lucide-react"

import { ModeToggle } from "@/components/ui/mode-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from "@/lib/api"

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "ar", label: "Arabic" },
]

export function SiteHeader() {
  const [language, setLanguage] = React.useState("en")
  const selectedLanguage = languages.find((item) => item.code === language)
  
  const pathname = usePathname()
  const router = useRouter()
  const { user, token } = useAuth()
  const role = user?.role || "citizen"

  const [notifications, setNotifications] = React.useState<Notification[]>([])

  const loadNotifications = React.useCallback(async () => {
    if (!token) return
    try {
      const data = await getNotifications(token)
      setNotifications(data)
    } catch (error) {
      console.error("Failed to load notifications:", error)
    }
  }, [token])

  React.useEffect(() => {
    loadNotifications()

    // Poll for notifications every 10 seconds if user has admin/authority roles
    if (role === "admin" || role === "authority") {
      const interval = setInterval(loadNotifications, 10000)
      return () => clearInterval(interval)
    }
  }, [loadNotifications, role])

  const handleMarkAsRead = async (notif: Notification) => {
    if (!token) return
    try {
      await markNotificationAsRead(notif.id, token)
      setNotifications(prev =>
        prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
      )
      if (notif.dossier_id) {
        router.push(`/dashboard/projects?id=${notif.dossier_id}`)
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!token) return
    try {
      await markAllNotificationsAsRead(token)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getBreadcrumbs = () => {
    const breadcrumbs: { label: string; href?: string; active: boolean }[] = []

    if (pathname === "/dashboard") {
      breadcrumbs.push({ label: "Dashboard", active: true })
    } else if (pathname.startsWith("/dashboard/")) {
      breadcrumbs.push({ label: "Dashboard", href: "/dashboard", active: false })
      
      const segment = pathname.split("/").pop()
      
      if (segment === "projects") {
        let label = "Projects"
        if (role === "citizen") label = "Urbanism"
        else if (role === "architect") label = "My Projects"
        else if (role === "authority") label = "Dossier Management"
        
        breadcrumbs.push({ label, active: true })
      } else if (segment === "track") {
        let label = "Technical Tracking"
        if (role === "citizen") label = "Track Dossier"
        
        breadcrumbs.push({ label, active: true })
      } else if (segment === "agent") {
        breadcrumbs.push({ label: "AI Assistant", active: true })
      } else if (segment === "reports") {
        breadcrumbs.push({ label: "Reports & Stats", active: true })
      } else if (segment === "evaluations") {
        breadcrumbs.push({ label: "Evaluations", active: true })
      } else if (segment === "citizens") {
        breadcrumbs.push({ label: "Citizens", active: true })
      } else if (segment === "businesses") {
        breadcrumbs.push({ label: "Businesses", active: true })
      } else {
        const capSegment = segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : ""
        breadcrumbs.push({ label: capSegment, active: true })
      }
    } else if (pathname === "/settings") {
      breadcrumbs.push({ label: "Settings", active: true })
    } else if (pathname === "/help") {
      breadcrumbs.push({ label: "Help & Support", active: true })
    } else {
      const segments = pathname.split("/").filter(Boolean)
      segments.forEach((seg, index) => {
        const isLast = index === segments.length - 1
        const label = seg.charAt(0).toUpperCase() + seg.slice(1)
        const href = "/" + segments.slice(0, index + 1).join("/")
        breadcrumbs.push({
          label,
          href: isLast ? undefined : href,
          active: isLast,
        })
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.active ? (
                    <BreadcrumbPage className="font-semibold text-foreground">{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={item.href || "#"} />} className="text-muted-foreground hover:text-foreground transition-colors">
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  title="Search"
                >
                  <SearchIcon />
                  <span className="sr-only">Search dashboard</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-72 rounded-xl p-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Search</DropdownMenuLabel>
                <div className="px-1.5 pb-1">
                  <Input placeholder="Search dashboard..." type="search" />
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full relative hover:bg-muted/60 transition-colors"
                  title="Notifications"
                >
                  <BellIcon className="size-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-ping" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
                  )}
                  <span className="sr-only">Open notifications ({unreadCount} unread)</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-80 rounded-xl p-0 border border-border/40 shadow-xl bg-background/95 backdrop-blur-md overflow-hidden">
              <div className="p-3 border-b border-border/40 flex items-center justify-between bg-muted/20">
                <span className="text-xs font-bold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-bold text-primary hover:underline hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border/20">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif)}
                      className={cn(
                        "p-3 text-xs cursor-pointer transition-all duration-200 hover:bg-muted/40 relative flex gap-2.5 items-start",
                        !notif.read && "bg-muted/10 font-medium"
                      )}
                    >
                      {!notif.read && (
                        <span className="absolute left-2.5 top-4.5 size-1.5 rounded-full bg-red-500" />
                      )}
                      <div className={cn("space-y-1 w-full pl-3.5", !notif.read && "font-medium")}>
                        <p className={cn("text-foreground font-bold leading-tight", !notif.read && "text-primary")}>
                          {notif.title}
                        </p>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  title="Language"
                >
                  <LanguagesIcon />
                  <span className="sr-only">
                    Switch language. Current language is{" "}
                    {selectedLanguage?.label ?? "English"}
                  </span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((item) => (
                  <DropdownMenuItem
                    key={item.code}
                    className="rounded-lg"
                    onClick={() => setLanguage(item.code)}
                  >
                    {item.label}
                    {language === item.code ? (
                      <CheckIcon className="ml-auto" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
