"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [isLoading, router, token]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm font-medium text-muted-foreground">
        Loading dashboard...
      </main>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <SidebarProvider className="dashboard-shell bg-muted/20">
      <AppSidebar />
      <main className="flex h-screen w-full flex-1 flex-col overflow-hidden text-foreground">
        <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="rounded-md text-muted-foreground hover:text-foreground" />
            <div className="relative hidden w-72 lg:block">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="h-9 pl-8" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>
            <ModeToggle />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 animate-appear">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
