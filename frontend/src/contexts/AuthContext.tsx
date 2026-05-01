"use client";

import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { getMe, User } from "@/lib/auth-api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    Cookies.remove("rokhas_token", { path: '/' });
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const loadUser = useCallback(async (authToken: string) => {
    try {
      const userData = await getMe(authToken);
      setUser(userData);
      setToken(authToken);
      return userData;
    } catch (error) {
      console.error("Failed to load user:", error);
      logout();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    async function initializeAuth() {
      const storedToken = Cookies.get("rokhas_token");
      if (storedToken) {
        await loadUser(storedToken);
        return;
      }
      await Promise.resolve();
      setIsLoading(false);
    }
    initializeAuth();
  }, [loadUser]);

  const login = useCallback(async (newToken: string) => {
    setIsLoading(true);
    Cookies.set("rokhas_token", newToken, { expires: 7, path: '/' }); // 7 days
    setToken(newToken);
    const userData = await loadUser(newToken);
    if (!userData) {
      throw new Error("Could not validate your session. Please sign in again.");
    }
  }, [loadUser]);

  const reloadUser = useCallback(async () => {
    if (token) {
      await loadUser(token);
    }
  }, [loadUser, token]);

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
