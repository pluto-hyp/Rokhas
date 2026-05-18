"use client"

import * as React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboardIcon, 
  FileTextIcon, 
  Building2Icon, 
  SearchIcon, 
  BotIcon, 
  CreditCardIcon, 
  MessageSquareIcon, 
  MapIcon, 
  UsersIcon, 
  StarIcon, 
  BarChart3Icon, 
  Settings2Icon, 
  CircleHelpIcon,
  FolderIcon,
  ShieldCheckIcon,
  WalletIcon
} from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const role = user?.role || "citizen";

  const getNavMain = () => {
    const common = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: <LayoutDashboardIcon />,
      },
    ];

    if (role === "citizen") {
      return [
        ...common,
        {
          title: "Urbanism",
          url: "/dashboard/projects",
          icon: <FileTextIcon />,
        },
        {
          title: "Track Dossier",
          url: "/dashboard/track",
          icon: <SearchIcon />,
        },
      ];
    }

    if (role === "architect") {
      return [
        ...common,
        {
          title: "My Projects",
          url: "/dashboard/projects",
          icon: <FolderIcon />,
        },
        {
          title: "Technical Tracking",
          url: "/dashboard/track",
          icon: <SearchIcon />,
        },
        {
          title: "Payments",
          url: "/dashboard/payments",
          icon: <CreditCardIcon />,
        },
        {
          title: "Billing Methods",
          url: "/dashboard/payments/methods",
          icon: <WalletIcon />,
        },
        {
          title: "Mapping",
          url: "#",
          icon: <MapIcon />,
        },
      ];
    }

    if (role === "authority") {
      return [
        ...common,
        {
          title: "Evaluations",
          url: "/dashboard/evaluations",
          icon: <StarIcon />,
        },
        {
          title: "Dossier Management",
          url: "/dashboard/projects",
          icon: <ShieldCheckIcon />,
        },
        {
          title: "Citizens",
          url: "/dashboard/citizens",
          icon: <UsersIcon />,
        },
        {
          title: "Businesses",
          url: "/dashboard/businesses",
          icon: <Building2Icon />,
        },
      ];
    }

    return common;
  };

  const getIntelligence = () => {
    const items = [
      {
        name: "Rokhas AI Assistant",
        url: "/dashboard/agent",
        icon: <BotIcon />,
      },
      {
        name: "Reports & Stats",
        url: "/dashboard/reports",
        icon: <BarChart3Icon />,
      },
    ];

    if (role === "authority") {
      items.push({
        name: "Compliance & Audits",
        url: "/dashboard/compliance",
        icon: <ShieldCheckIcon />,
      });
    }

    return items;
  };

  const getSecondary = () => {
    return [
      {
        title: "Settings",
        url: "/settings",
        icon: <Settings2Icon />,
      },
      {
        title: "Help & Support",
        url: "/help",
        icon: <CircleHelpIcon />,
      },
      {
        title: "Complaints",
        url: "/complaints",
        icon: <MessageSquareIcon />,
      },
    ];
  };

  const sidebarUser = {
    name: user?.full_name || "User",
    email: user?.email || "",
    avatar: "/rokhas.svg",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="/ " />}
            >
              <img src="/rokhas.svg" className="size-5!" alt="logo" />
              <span className="text-base font-semibold">Rokhas.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavMain()} />
        <NavDocuments items={getIntelligence()} label="Intelligence & Stats" />
        <NavSecondary items={getSecondary()} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
