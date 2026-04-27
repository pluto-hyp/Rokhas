import { 
  Home, 
  FolderOpen, 
  Bot, 
  Settings, 
  LogOut,
  Users,
  ClipboardCheck,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { SignOutButton, useUser } from "@clerk/nextjs";

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
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string || "citizen";

  const navigation = {
    citizen: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "My Projects", url: "/dashboard/projects", icon: FolderOpen },
      { title: "Rokhas Agent", url: "/dashboard/agent", icon: Bot },
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
    ],
    architect: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Client Projects", url: "/dashboard/projects", icon: Users },
      { title: "Rokhas Agent", url: "/dashboard/agent", icon: Bot },
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
    ],
    authority: [
      { title: "Overview", url: "/dashboard", icon: Home },
      { title: "Approval Queue", url: "/dashboard/projects", icon: ClipboardCheck },
      { title: "Stats", url: "/dashboard/stats", icon: BarChart3 },
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
    ],
  };

  const items = navigation[role as keyof typeof navigation] || navigation.citizen;

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <h2 className="font-serif text-2xl font-bold tracking-tight">Rokhas.</h2>
        <div className="mt-1 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10 w-fit">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/40">{role}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  } />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/40">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                {user?.firstName?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold">{user?.fullName || "User"}</span>
            <SignOutButton>
              <button className="text-xs text-primary/50 hover:text-primary transition-colors text-left flex items-center gap-1 mt-1">
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
