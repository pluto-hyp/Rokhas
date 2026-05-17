"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { 
  EllipsisVerticalIcon, 
  CircleUserRoundIcon, 
  CreditCardIcon, 
  BellIcon, 
  LogOutIcon, 
  X,
  Mail,
  Calendar,
  Settings,
  ShieldCheck
} from "lucide-react"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { user: authUser, logout } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
  }

  const getAvatarPath = (role?: string | null) => {
    if (role === "authority" || role === "admin" || role === "administrator") {
      return "/users-avatar-administrator.svg";
    }
    if (role === "architect") {
      return "/users-avatar-architect.svg";
    }
    return "/users-avatar-citizen.svg";
  };

  const getRoleBadgeColor = (role?: string | null) => {
    if (role === "architect") return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-emerald-500/5";
    if (role === "authority") return "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-amber-500/5";
    return "bg-primary/10 text-primary border border-primary/20 shadow-primary/5";
  };

  const getRoleLabel = (role?: string | null) => {
    if (role === "architect") return "Registered Architect";
    if (role === "authority") return "Municipal Authority";
    return "Citizen Account";
  };

  const activeAvatar = getAvatarPath(authUser?.role);
  const activeName = authUser?.full_name || user.name;
  const activeEmail = authUser?.email || user.email;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
              }
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={activeAvatar} alt={activeName} />
                <AvatarFallback className="rounded-lg">U</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-foreground">{activeName}</span>
                <span className="truncate text-xs text-foreground/60">
                  {activeEmail}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56 rounded-xl animate-in fade-in zoom-in-95 duration-100"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage src={activeAvatar} alt={activeName} />
                      <AvatarFallback className="rounded-lg">U</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-foreground">{activeName}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {activeEmail}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem 
                  className="cursor-pointer font-medium" 
                  onClick={() => {
                    setIsProfileOpen(true);
                  }}
                >
                  <CircleUserRoundIcon className="size-4" />
                  Account & Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <CreditCardIcon className="size-4" />
                  Payments
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <BellIcon className="size-4" />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-medium"
              >
                <LogOutIcon className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {isProfileOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card border border-border/40 rounded-3xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col gap-6">
            
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-border/40 pb-4 relative">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CircleUserRoundIcon className="size-5 text-primary" />
                Profile Credentials
              </h3>
              <button 
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="size-8 rounded-full border border-border/40 hover:bg-muted flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Profile Header Block */}
            <div className="flex flex-col items-center justify-center gap-3 py-2 text-center">
              <div className="relative">
                <Avatar className="size-20 border-2 border-primary/20 shadow-md">
                  <AvatarImage src={activeAvatar} alt={activeName} />
                  <AvatarFallback className="text-2xl font-bold">U</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 size-4 bg-emerald-500 rounded-full border-2 border-card flex items-center justify-center shadow-sm">
                  <span className="size-1.5 bg-white rounded-full animate-pulse" />
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold">{activeName}</h4>
                <div className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-block ${getRoleBadgeColor(authUser?.role)}`}>
                  {getRoleLabel(authUser?.role)}
                </div>
              </div>
            </div>

            {/* Profile Info Details List */}
            <div className="space-y-4 bg-muted/20 border border-border/40 rounded-2xl p-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Email Address</p>
                  <p className="text-sm font-semibold truncate">{activeEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="size-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Verification status</p>
                  <p className="text-sm font-semibold flex items-center gap-1.5 text-emerald-500">
                    <span className="size-1.5 bg-emerald-500 rounded-full" />
                    Administrative Clearance Granted
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="size-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Account Status</p>
                  <p className="text-sm font-semibold">Active & Healthy</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="h-11 rounded-xl border border-border/40 font-bold text-sm hover:bg-muted transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Close details
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  router.push("/settings");
                }}
                className="h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary/10"
              >
                <Settings className="size-4" />
                Edit Settings
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  )
}
