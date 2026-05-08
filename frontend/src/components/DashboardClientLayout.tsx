"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
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
    <SidebarProvider className="dashboard-shell">
      <AppSidebar />
      <SidebarInset className="min-h-screen overflow-hidden">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/70 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:h-16 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="rounded-md text-muted-foreground hover:text-foreground" />
            <div className="relative hidden w-full max-w-xs lg:block lg:max-w-sm">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="h-9 pl-8" />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>
            <ModeToggle />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 animate-appear">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
