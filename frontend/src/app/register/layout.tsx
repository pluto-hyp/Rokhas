import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";

export default async function RegisterLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (cookieStore.get("rokhas_token")?.value) {
    redirect("/dashboard");
  }

  return <AuthProvider>{children}</AuthProvider>;
}
