"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CirclePlusIcon, MailIcon } from "lucide-react"
import { CreateProjectSheet } from "@/components/CreateProjectSheet"
import { useAuth } from "@/contexts/AuthContext"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  const { user } = useAuth();
  const role = user?.role || "citizen";
  const [isCreateSheetOpen, setIsCreateSheetOpen] = React.useState(false)

  const getCreateButtonLabel = () => {
    if (role === "architect") return "Soumettre Projet Urbain";
    if (role === "citizen") return "Demande Économique";
    return "Gérer Dossiers";
  };

  const showCreateButton = role === "architect" || role === "citizen";

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {showCreateButton && (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip={getCreateButtonLabel()}
                onClick={() => setIsCreateSheetOpen(true)}
                className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              >
                <CirclePlusIcon />
                <span>{getCreateButtonLabel()}</span>
              </SidebarMenuButton>
              <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
              >
                <MailIcon />
                <span className="sr-only">Inbox</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} render={<a href={item.url} />}>
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>

      <CreateProjectSheet 
        open={isCreateSheetOpen} 
        onOpenChange={setIsCreateSheetOpen} 
      />
    </SidebarGroup>
  )
}
