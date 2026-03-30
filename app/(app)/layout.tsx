"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import BottomNav from "@/components/bottom-nav";
import TopNav from "@/components/top-nav";
import SiteFooter from "@/components/site-footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useAuth();

  return (
    <div className="app-shell">
      <Suspense fallback={null}>
        <TopNav pathname={pathname} />
      </Suspense>
      <main className="app-main">{children}</main>
      <SiteFooter />
      <BottomNav pathname={pathname} />
    </div>
  );
}
