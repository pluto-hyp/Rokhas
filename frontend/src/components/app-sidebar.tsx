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
  ShieldCheckIcon
} from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const role = user?.role || "citizen";

  const getNavMain = () => {
    const common = [
      {
        title: "Tableau de Bord",
        url: "/dashboard",
        icon: <LayoutDashboardIcon />,
      },
    ];

    if (role === "citizen") {
      return [
        ...common,
        {
          title: "Urbanisme",
          url: "/dashboard/projects",
          icon: <FileTextIcon />,
        },
        {
          title: "Suivi de Dossier",
          url: "/dashboard/track",
          icon: <SearchIcon />,
        },
        {
          title: "Paiements",
          url: "#",
          icon: <CreditCardIcon />,
        },
      ];
    }

    if (role === "architect") {
      return [
        ...common,
        {
          title: "Mes Projets",
          url: "/dashboard/projects",
          icon: <FolderIcon />,
        },
        {
          title: "Suivi Technique",
          url: "/dashboard/track",
          icon: <SearchIcon />,
        },
        {
          title: "Cartographie",
          url: "#",
          icon: <MapIcon />,
        },
      ];
    }

    if (role === "authority") {
      return [
        ...common,
        {
          title: "Évaluations",
          url: "/dashboard/evaluations",
          icon: <StarIcon />,
        },
        {
          title: "Gestion Dossiers",
          url: "/dashboard/projects",
          icon: <ShieldCheckIcon />,
        },
        {
          title: "Citoyens",
          url: "/dashboard/citizens",
          icon: <UsersIcon />,
        },
        {
          title: "Entreprises",
          url: "/dashboard/businesses",
          icon: <Building2Icon />,
        },
      ];
    }

    return common;
  };

  const getIntelligence = () => {
    return [
      {
        name: "Assistant Rokhas AI",
        url: "/dashboard/agent",
        icon: <BotIcon />,
      },
      {
        name: "Rapports & Stats",
        url: "/dashboard/reports",
        icon: <BarChart3Icon />,
      },
    ];
  };

  const getSecondary = () => {
    return [
      {
        title: "Paramètres",
        url: "/settings",
        icon: <Settings2Icon />,
      },
      {
        title: "Aide & Support",
        url: "/help",
        icon: <CircleHelpIcon />,
      },
      {
        title: "Réclamations",
        url: "#",
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
