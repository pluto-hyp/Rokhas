import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function OnboardingClientLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (!cookieStore.get("rokhas_token")?.value) {
    redirect("/login");
  }

  return <OnboardingClientLayout>{children}</OnboardingClientLayout>;
}
