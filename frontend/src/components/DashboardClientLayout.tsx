"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 w-full flex flex-col h-screen overflow-hidden bg-[#FDFCFB]">
        <header className="h-16 border-b border-border/40 flex items-center px-8 bg-white/50 backdrop-blur-md z-10 shrink-0">
          <SidebarTrigger />
          <div className="ml-4 h-6 w-px bg-border/40 md:hidden" />
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
