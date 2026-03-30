"use client";

import { getAnalyticsContext, getAnalyticsHeaders } from "@/lib/analytics-core";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEventPayload = {
  eventName: string;
  timestamp?: string;
  page?: string;
  path?: string;
  title?: string;
  referrer?: string;
  experienceId?: string;
  hostId?: string;
  bookingId?: string;
  paymentId?: string;
  searchQuery?: string;
  searchResultsCount?: number;
  searchLocation?: string;
  searchCategory?: string;
  searchFilters?: string[];
  resultIds?: string[];
  scrollDepth?: number;
  durationMs?: number;
  ctaName?: string;
  properties?: Record<string, unknown>;
};

const sanitizeForGa = (value: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null && entry !== ""));

const trackGaEvent = (event: AnalyticsEventPayload & Record<string, unknown>) => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const base = sanitizeForGa({
    page_path: event.path,
    page_title: event.title,
    page_location: typeof window !== "undefined" ? window.location.href : "",
  });

  switch (event.eventName) {
    case "page_view":
      window.gtag("event", "page_view", base);
      return;
    case "search_initiated":
      window.gtag(
        "event",
        "search",
        sanitizeForGa({
          ...base,
          search_term: event.searchQuery,
        })
      );
      return;
    case "search_results_viewed":
      window.gtag(
        "event",
        "view_search_results",
        sanitizeForGa({
          ...base,
          search_term: event.searchQuery,
          results_count: event.searchResultsCount,
        })
      );
      return;
    case "experience_viewed":
      window.gtag(
        "event",
        "view_item",
        sanitizeForGa({
          ...base,
          item_id: event.experienceId,
          item_name: event.properties?.title,
        })
      );
      return;
    case "booking_started":
      window.gtag(
        "event",
        "begin_checkout",
        sanitizeForGa({
          ...base,
          item_id: event.experienceId,
          quantity: event.properties?.quantity,
        })
      );
      return;
    case "experience_shared":
      window.gtag(
        "event",
        "share",
        sanitizeForGa({
          ...base,
          method: event.properties?.method,
          content_type: "experience",
          item_id: event.experienceId,
        })
      );
      return;
    default:
      window.gtag("event", event.eventName, sanitizeForGa({ ...base, ...event.properties }));
  }
};

const postAnalyticsEvents = (events: AnalyticsEventPayload[], useBeacon = false) => {
  if (typeof window === "undefined" || !events.length) return;

  const headers = {
    "Content-Type": "application/json",
    ...getAnalyticsHeaders(),
  };
  const body = JSON.stringify({ events });

  if (useBeacon && typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/events/batch", blob);
    return;
  }

  void fetch("/api/analytics/events/batch", {
    method: "POST",
    headers,
    body,
    credentials: "include",
    keepalive: useBeacon,
  }).catch(() => {
    // analytics should never break the UX
  });
};

export const trackEvent = (payload: AnalyticsEventPayload, options?: { beacon?: boolean }) => {
  if (typeof window === "undefined" || !payload.eventName) return;

  const context = getAnalyticsContext();
  const event = {
    timestamp: new Date().toISOString(),
    ...context,
    ...payload,
    properties: payload.properties || {},
  };

  trackGaEvent(event);
  postAnalyticsEvents([event], options?.beacon === true);
};
