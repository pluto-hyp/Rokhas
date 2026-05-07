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
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/AppIcon";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

import { usePathname } from "next/navigation";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: number;
};

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const pathname = usePathname();
  const role = user?.role || "citizen";

  const navigation: Array<{ title: string; items: NavItem[] }> = [
    {
      title: "Dashboards",
      items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Permit Requests", url: "/dashboard/projects", icon: FileText, badge: 12 },
      { title: "Track Application", url: "/dashboard/track", icon: Search },
      ],
    },
    {
      title: "Services",
      items: [
      { title: "Citizens Portal", url: "/dashboard/citizens", icon: UserCircle },
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
  const initials = user?.full_name?.split(" ").map((n) => n[0]).join("") || "RK";

  return (
    <Sidebar className="border-r border-sidebar-border/60 bg-sidebar">
      <SidebarHeader className="p-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <AppIcon className="size-6" />
          </div>
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight leading-none text-sidebar-foreground">Rokhas CRM</span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50">
                Digital Administration
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {navigation.map((section) => (
          <SidebarGroup key={section.title} className="mt-1">
            <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                const active = isLinkActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={active}
                      className={cn(
                        "h-9 w-full justify-between rounded-full px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      render={
                        <Link href={item.url}>
                          <div className="flex w-full items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                                active
                                  ? "border-sidebar-primary-foreground/40 bg-sidebar-primary-foreground/15"
                                  : "border-sidebar-border/60 bg-sidebar"
                              )}>
                                <item.icon className="h-3.5 w-3.5" />
                              </div>
                              <span className="font-medium">{item.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.badge && (
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                    active
                                      ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                            </div>
                          </div>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="mt-auto space-y-3 p-4">
        <div className="rounded-2xl border border-sidebar-border/80 bg-sidebar/40 p-3 text-xs leading-relaxed text-sidebar-foreground/80">
          <p className="font-semibold text-sidebar-foreground mb-1">Unlock everything</p>
          <p>Get full access to all dashboards and components for Rokhas CRM.</p>
          <button className="mt-3 w-full rounded-full bg-sidebar-foreground px-3 py-1.5 text-xs font-semibold text-sidebar bg-opacity-90 hover:bg-opacity-100">
            Get full access
          </button>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border/80 bg-muted/40 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.full_name || "Rokhas User"}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
              {role === "authority" ? "Administrator" : role}
            </p>
          </div>
          <button onClick={logout} className="text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
