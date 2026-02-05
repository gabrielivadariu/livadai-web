"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import BottomNav from "@/components/bottom-nav";
import TopNav from "@/components/top-nav";
import SiteFooter from "@/components/site-footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.host === "livadai.com") {
      setRedirecting(true);
      const { pathname, search, hash } = window.location;
      window.location.replace(`https://www.livadai.com${pathname}${search}${hash}`);
    }
  }, []);

  if (redirecting) {
    return null;
  }

  return (
    <div className="app-shell">
      <TopNav pathname={pathname} />
      <main className="app-main">{children}</main>
      <SiteFooter />
      <BottomNav pathname={pathname} />
    </div>
  );
}
