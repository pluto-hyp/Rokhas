import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClientLayout from "@/components/DashboardClientLayout";

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
