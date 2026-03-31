"use client";

import { getAnalyticsHeaders } from "@/lib/analytics-core";

export const getApiOrigin = () => {
  if (typeof window === "undefined") return null;
  return window.location.origin;
};

const getApiBase = () =>
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "https://livadai-backend-production.up.railway.app"
    : "/api";

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

type ApiOptions = RequestInit & { json?: unknown; timeoutMs?: number };
type InternalApiOptions = ApiOptions & { _retried?: boolean; _skipAuthRefresh?: boolean };
type PublicApiOptions = Omit<ApiOptions, "json" | "method">;

let refreshRequest: Promise<boolean> | null = null;

const tryRefreshSession = async () => {
  if (refreshRequest) return refreshRequest;

  refreshRequest = (async () => {
    try {
      const headers = new Headers();
      if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
      }
      const res = await fetch(`${getApiBase()}/auth/refresh`, {
        method: "POST",
        headers,
        credentials: "include",
      });
      if (!res.ok) {
        clearAuthToken();
        return false;
      }
      const data = await res.json().catch(() => ({}));
      if (data?.token) {
        setAuthToken(data.token);
      }
      return true;
    } catch {
      return false;
    } finally {
      refreshRequest = null;
    }
  })();

  return refreshRequest;
};

const apiRequest = async <T>(path: string, options: InternalApiOptions = {}) => {
  const headers = new Headers(options.headers || undefined);
  if (options.json !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const analyticsHeaders = getAnalyticsHeaders();
  Object.entries(analyticsHeaders).forEach(([key, value]) => {
    if (value && !headers.has(key)) headers.set(key, value);
  });
  // Transitional fallback: allows one-time migration from legacy localStorage token to cookie session.
  if (authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const controller = new AbortController();
  const timeoutMs = typeof options.timeoutMs === "number" && options.timeoutMs > 0 ? options.timeoutMs : 10000;
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${getApiBase()}${path}`, {
      ...options,
      headers,
      body: options.json ? JSON.stringify(options.json) : options.body,
      signal: controller.signal,
      credentials: options.credentials || "include",
    });
  } catch (error) {
    if (controller.signal.aborted) {
      const timeoutError = new Error("Request timed out");
      (timeoutError as Error & { code?: string }).code = "REQUEST_TIMEOUT";
      throw timeoutError;
    }
    if (process.env.NODE_ENV !== "production") {
      console.debug("[apiRequest]", path, "failed", error);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  if (!res.ok) {
    if (res.status === 401 && !options._retried && !options._skipAuthRefresh) {
      const refreshed = await tryRefreshSession();
      if (refreshed) {
        return apiRequest<T>(path, { ...options, _retried: true });
      }
    }
    const message = await res.json().catch(() => ({}));
    const error = new Error(message?.message || "Request failed");
    (error as Error & { status?: number }).status = res.status;
    if (process.env.NODE_ENV !== "production") {
      console.debug("[apiRequest]", path, "status", res.status);
    }
    throw error;
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
};

export const apiGet = <T>(path: string, options?: PublicApiOptions) => apiRequest<T>(path, options);
export const apiPost = <T>(path: string, json?: unknown, options?: PublicApiOptions) =>
  apiRequest<T>(path, { ...options, method: "POST", json });
export const apiPut = <T>(path: string, json?: unknown, options?: PublicApiOptions) =>
  apiRequest<T>(path, { ...options, method: "PUT", json });
export const apiPatch = <T>(path: string, json?: unknown, options?: PublicApiOptions) =>
  apiRequest<T>(path, { ...options, method: "PATCH", json });
export const apiDelete = <T>(path: string, options?: PublicApiOptions) => apiRequest<T>(path, { ...options, method: "DELETE" });
