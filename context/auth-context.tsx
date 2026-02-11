"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, clearAuthToken } from "@/lib/api";

type User = {
  _id?: string;
  email?: string;
  role?: string;
  avatar?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<{ message?: string; requiresEmailVerification?: boolean }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiGet<{ user: User }>("/auth/me");
      const nextUser = data?.user || null;
      setUser(nextUser);
      setToken(nextUser ? "cookie-session" : null);
    } catch {
      if (process.env.NODE_ENV !== "production") {
        console.debug("[auth] refresh failed");
      }
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      await refresh();
      if (active) setLoading(false);
    };
    bootstrap();
    return () => {
      active = false;
    };
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiPost<{ token?: string; user?: User }>("/auth/login", { email, password });
    if (data?.user) {
      setUser(data.user);
      setToken("cookie-session");
      window.localStorage.removeItem("token");
      clearAuthToken();
      return;
    }
    await refresh();
  }, [refresh]);

  const register = useCallback(async (payload: Record<string, unknown>) => {
    return apiPost<{ message?: string; requiresEmailVerification?: boolean }>("/auth/register", payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout", {});
    } catch (_err) {
      // best-effort logout
    }
    window.localStorage.removeItem("token");
    clearAuthToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refresh }),
    [user, token, loading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
