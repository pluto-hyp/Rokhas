"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
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

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "ar", label: "Arabic" },
]

export function SiteHeader() {
  const [language, setLanguage] = React.useState("en")
  const selectedLanguage = languages.find((item) => item.code === language)
  
  const pathname = usePathname()
  const { user } = useAuth()
  const role = user?.role || "citizen"

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
                  className="rounded-full"
                  title="Notifications"
                >
                  <BellIcon />
                  <span className="sr-only">Open notifications</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-72 rounded-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-3 text-sm text-muted-foreground">
                  No new notifications.
                </div>
              </DropdownMenuGroup>
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
