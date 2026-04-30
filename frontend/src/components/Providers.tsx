"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import Chatbot from "@/components/Chatbot";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        {children}
        <Chatbot />
      </AuthProvider>
    </ThemeProvider>
  );
}
