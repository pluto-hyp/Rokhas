"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import Chatbot from "@/components/Chatbot";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Chatbot />
    </AuthProvider>
  );
}
