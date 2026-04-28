import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";

function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 w-full flex flex-col h-screen overflow-hidden bg-background">
          <div className="h-16 flex items-center px-6 border-b border-border/40 shrink-0 gap-4">
            <SidebarTrigger />
            <h1 className="font-serif text-lg font-bold">Portal</h1>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("rokhas_token")?.value) {
    redirect("/login");
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
