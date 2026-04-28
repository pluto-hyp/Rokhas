"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { getMe, User } from "@/lib/auth-api";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadUser = async (authToken: string) => {
    try {
      const userData = await getMe(authToken);
      setUser(userData);
      setToken(authToken);
    } catch (error) {
      console.error("Failed to load user:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = Cookies.get("rokhas_token");
    if (storedToken) {
      loadUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    Cookies.set("rokhas_token", newToken, { expires: 7, path: '/' }); // 7 days
    setToken(newToken);
    loadUser(newToken);
  };

  const logout = () => {
    Cookies.remove("rokhas_token", { path: '/' });
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const reloadUser = async () => {
    if (token) {
      await loadUser(token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
