"use client";

import {
  LayoutDashboard,
  FileText,
  Search,
  UserCircle,
  Building2,
  Star,
  Settings,
  BarChart3,
  LogOut,
  ChevronsUpDown,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/AppIcon";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { usePathname } from "next/navigation";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: number;
};

export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const role = user?.role || "citizen";

  const navigation: Array<{ title: string; items: NavItem[] }> = [
    {
      title: "Dashboards",
      items: [
        { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
        { title: "Permit requests", url: "/dashboard/projects", icon: FileText, badge: 12 },
        { title: "Track application", url: "/dashboard/track", icon: Search },
      ],
    },
    {
      title: "Services",
      items: [
        { title: "Citizens", url: "/dashboard/citizens", icon: UserCircle },
        { title: "Businesses", url: "/dashboard/businesses", icon: Building2, badge: 3 },
        { title: "Evaluations", url: "/dashboard/evaluations", icon: Star },
      ],
    },
    {
      title: "System",
      items: [
        { title: "Settings", url: "/dashboard/settings", icon: Settings },
        { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
      ],
    },
  ];

  const isLinkActive = (url: string) => pathname === url;
  const initials =
    user?.full_name?.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "RK";

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "[&_svg]:size-4 [&_svg]:shrink-0",
                  "flex h-12 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding]",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2",
                  "group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:p-0!"
                )}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <AppIcon className="size-4 shrink-0" />
                </div>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold text-sidebar-foreground">Rokhas</span>
                  <span className="truncate text-xs font-normal text-sidebar-foreground/60">
                    Workspace
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-70 group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-56 rounded-lg" align="start" sideOffset={6}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal text-muted-foreground">
                    Workspace
                  </DropdownMenuLabel>
                  <DropdownMenuItem className="rounded-md font-medium">
                    <AppIcon className="mr-2 size-4 shrink-0" />
                    Rokhas — Production
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="rounded-md text-muted-foreground">Preferences</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = isLinkActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={active}
                        render={
                          <Link href={item.url} className="flex min-w-0 items-center gap-2">
                            <item.icon />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        }
                      />
                      {item.badge !== undefined ? (
                        <SidebarMenuBadge className={cn(active && "text-sidebar-accent-foreground")}>
                          {item.badge}
                        </SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="group-data-[collapsible=icon]:hidden mx-2 mb-2 rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-3 text-xs shadow-none">
          <div className="mb-2 flex items-center gap-2 font-semibold text-sidebar-accent-foreground">
            <Sparkles className="size-3.5 shrink-0" />
            Unlock everything
          </div>
          <p className="mb-3 leading-relaxed text-sidebar-accent-foreground/85">
            Full dashboards and admin workflows in one workspace.
          </p>
          <button
            type="button"
            className="flex w-full cursor-default items-center justify-center gap-2 rounded-full bg-sidebar-primary py-2 text-xs font-semibold text-sidebar-primary-foreground"
          >
            <span className="size-2 shrink-0 rounded-full bg-emerald-400" aria-hidden />
            Get full access
          </button>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex min-w-0 w-full flex-1 items-center gap-2 overflow-hidden rounded-md outline-hidden ring-sidebar-ring transition-[width,height,padding]",
                  "[&_svg]:size-4 [&_svg]:shrink-0",
                  "h-12 px-2 text-left text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground",
                  "group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:p-0!"
                )}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-xs font-semibold">{initials}</span>
                </div>
                <div className="grid min-w-0 flex-1 gap-px text-sm leading-snug group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold text-sidebar-foreground">
                    {user?.full_name || "Rokhas user"}
                  </span>
                  <span className="truncate text-xs font-normal text-sidebar-foreground/60">
                    {user?.email}
                  </span>
                  <span className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {role === "authority" ? "Administrator" : role}
                  </span>
                </div>
                <ChevronsUpDown className="size-4 shrink-0 opacity-60 group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-52 rounded-lg" side="right" align="start" sideOffset={8}>
                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link href="/dashboard/settings" />}>Account settings</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                    className="gap-2"
                  >
                    <LogOut className="size-4 shrink-0" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
