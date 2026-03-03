"use client";

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

type ApiOptions = RequestInit & { json?: unknown };
type InternalApiOptions = ApiOptions & { _retried?: boolean; _skipAuthRefresh?: boolean };

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
  // Transitional fallback: allows one-time migration from legacy localStorage token to cookie session.
  if (authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);
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

export const apiGet = <T>(path: string) => apiRequest<T>(path);
export const apiPost = <T>(path: string, json?: unknown) => apiRequest<T>(path, { method: "POST", json });
export const apiPut = <T>(path: string, json?: unknown) => apiRequest<T>(path, { method: "PUT", json });
export const apiPatch = <T>(path: string, json?: unknown) => apiRequest<T>(path, { method: "PATCH", json });
export const apiDelete = <T>(path: string) => apiRequest<T>(path, { method: "DELETE" });
