"use client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://livadai-backend-production.up.railway.app";

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

type ApiOptions = RequestInit & { json?: unknown };

const apiRequest = async <T>(path: string, options: ApiOptions = {}) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.json ? JSON.stringify(options.json) : options.body,
  });

  if (!res.ok) {
    const message = await res.json().catch(() => ({}));
    const error = new Error(message?.message || "Request failed");
    (error as Error & { status?: number }).status = res.status;
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
