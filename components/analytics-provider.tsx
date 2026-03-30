"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getAnalyticsPath } from "@/lib/analytics-core";
import { trackEvent } from "@/lib/analytics";

const SCROLL_THRESHOLDS = [25, 50, 75, 90];

const buildCurrentPath = (pathname: string | null, searchParams: ReturnType<typeof useSearchParams>) => {
  const basePath = pathname || "/";
  const query = searchParams?.toString() || "";
  return query ? `${basePath}?${query}` : basePath;
};

export default function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = buildCurrentPath(pathname, searchParams);
  const currentPathRef = useRef("");
  const pageEnteredAtRef = useRef<number>(0);
  const trackedDepthsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const previousPath = currentPathRef.current;
    const now = Date.now();

    if (previousPath && previousPath !== currentPath) {
      trackEvent(
        {
          eventName: "page_exit",
          path: previousPath,
          page: previousPath,
          durationMs: now - pageEnteredAtRef.current,
          properties: {
            toPath: currentPath,
          },
        },
        { beacon: true }
      );

      trackEvent({
        eventName: "navigation_transition",
        path: currentPath,
        page: currentPath,
        properties: {
          fromPath: previousPath,
          toPath: currentPath,
        },
      });
    }

    currentPathRef.current = currentPath;
    pageEnteredAtRef.current = now;
    trackedDepthsRef.current = new Set();

    trackEvent({
      eventName: "page_view",
      path: currentPath,
      page: currentPath,
    });
  }, [currentPath]);

  useEffect(() => {
    const emitExit = () => {
      const path = currentPathRef.current || getAnalyticsPath();
      if (!path) return;
      trackEvent(
        {
          eventName: "page_exit",
          path,
          page: path,
          durationMs: Date.now() - pageEnteredAtRef.current,
        },
        { beacon: true }
      );
    };

    window.addEventListener("pagehide", emitExit);
    window.addEventListener("beforeunload", emitExit);
    return () => {
      window.removeEventListener("pagehide", emitExit);
      window.removeEventListener("beforeunload", emitExit);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const pageHeight = document.documentElement.scrollHeight || 0;
      const maxScrollable = Math.max(pageHeight - viewportHeight, 1);
      const depth = Math.round(((scrollTop + viewportHeight) / maxScrollable) * 100);

      for (const threshold of SCROLL_THRESHOLDS) {
        if (depth >= threshold && !trackedDepthsRef.current.has(threshold)) {
          trackedDepthsRef.current.add(threshold);
          const path = currentPathRef.current || getAnalyticsPath();
          trackEvent({
            eventName: "scroll_depth",
            path,
            page: path,
            scrollDepth: threshold,
          });
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.setTimeout(onScroll, 150);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [currentPath]);

  return null;
}
