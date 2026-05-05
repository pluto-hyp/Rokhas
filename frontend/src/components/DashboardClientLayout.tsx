"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useAuth } from "@/contexts/AuthContext";

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
      <main className="flex-1 w-full flex flex-col h-screen overflow-hidden bg-background text-foreground">
        <header className="h-16 flex items-center justify-between border-b border-border bg-background/95 px-8 z-10 shrink-0 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center">
            <SidebarTrigger className="rounded-md text-muted-foreground hover:text-foreground" />
            <div className="ml-4 h-6 w-px bg-border/40 md:hidden" />
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-appear">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
