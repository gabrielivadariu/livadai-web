"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import BottomNav from "@/components/bottom-nav";
import TopNav from "@/components/top-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading } = useAuth();

  return (
    <div className="app-shell">
      <TopNav pathname={pathname} />
      <main className="app-main">{children}</main>
      <BottomNav pathname={pathname} />
    </div>
  );
}
