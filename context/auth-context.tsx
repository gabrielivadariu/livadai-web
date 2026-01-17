"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, clearAuthToken, setAuthToken } from "@/lib/api";

type User = {
  _id?: string;
  name?: string;
  displayName?: string;
  email?: string;
  role?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<{ message?: string; requiresEmailVerification?: boolean }>;
  logout: () => void;
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
      setUser(data?.user || null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("token");
    if (stored) {
      setToken(stored);
      setAuthToken(stored);
      refresh().finally(() => setLoading(false));
      return;
    }
    setLoading(false);
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiPost<{ token: string; user: User }>("/auth/login", { email, password });
    if (data?.token) {
      window.localStorage.setItem("token", data.token);
      setToken(data.token);
      setAuthToken(data.token);
      setUser(data.user || null);
    }
  }, []);

  const register = useCallback(async (payload: Record<string, unknown>) => {
    return apiPost<{ message?: string; requiresEmailVerification?: boolean }>("/auth/register", payload);
  }, []);

  const logout = useCallback(() => {
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
