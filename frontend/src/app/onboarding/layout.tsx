import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";

function OnboardingClientLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (!cookieStore.get("rokhas_token")?.value) {
    redirect("/login");
  }

  return <OnboardingClientLayout>{children}</OnboardingClientLayout>;
}
