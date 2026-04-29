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
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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

// Custom Logo Component
const RokhasLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="12" fill="var(--primary)" />
    <path d="M12 24V14C12 12.8954 12.8954 12 14 12H26C27.1046 12 28 12.8954 28 14V24M12 24L20 18L28 24M12 24H28M20 28V24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="18" y="22" width="4" height="2" rx="1" fill="white" fillOpacity="0.3" />
  </svg>
);

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const pathname = usePathname();
  const role = user?.role || "citizen";

  const navigation = {
    overview: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Permit Requests", url: "/dashboard/projects", icon: FileText, badge: 12 },
      { title: "Track Application", url: "/dashboard/track", icon: Search },
    ],
    services: [
      { title: "Citizens Portal", url: "/dashboard/citizens", icon: UserCircle },
      { title: "Businesses", url: "/dashboard/businesses", icon: Building2, badge: 3 },
      { title: "Evaluations", url: "/dashboard/evaluations", icon: Star },
    ],
    system: [
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
      { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
    ],
  };

  const isLinkActive = (url: string) => pathname === url;

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <RokhasLogo />
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight leading-none text-foreground">Rokhas</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">Digital Administration</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-wider mb-2 px-2">Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.overview.map((item) => {
                const active = isLinkActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      isActive={active}
                      className={cn(
                        "w-full justify-between px-3 py-2 rounded-xl transition-all duration-200",
                        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      render={
                        <Link href={item.url}>
                          <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span>{item.title}</span>
                          </div>
                          {item.badge && (
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted-foreground/10 text-muted-foreground"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-wider mb-2 px-2">Services</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.services.map((item) => {
                const active = isLinkActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      isActive={active}
                      className={cn(
                        "w-full justify-between px-3 py-2 rounded-xl transition-all duration-200",
                        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      render={
                        <Link href={item.url}>
                          <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span>{item.title}</span>
                          </div>
                          {item.badge && (
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted-foreground/10 text-muted-foreground"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-wider mb-2 px-2">System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.system.map((item) => {
                const active = isLinkActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      isActive={active}
                      className={cn(
                        "w-full justify-between px-3 py-2 rounded-xl transition-all duration-200",
                        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      render={
                        <Link href={item.url}>
                          <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span>{item.title}</span>
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
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <div className="bg-muted/50 border border-border/40 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            {user?.full_name?.split(' ').map(n => n[0]).join('') || "AK"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{user?.full_name || "Ahmed Karimi"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{role === 'authority' ? 'Administrator' : role}</p>
          </div>
          <button onClick={logout} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
