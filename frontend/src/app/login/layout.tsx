import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (cookieStore.get("rokhas_token")?.value) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
