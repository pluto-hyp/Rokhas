"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import Chatbot from "@/components/Chatbot";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLightForced = ["/", "/privacy", "/terms"].includes(pathname);

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      disableTransitionOnChange
      forcedTheme={isLightForced ? "light" : undefined}
    >
      <AuthProvider>
        {children}
        <Chatbot />
      </AuthProvider>
    </ThemeProvider>
  );
}
