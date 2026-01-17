"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import BottomNav from "@/components/bottom-nav";
import TopNav from "@/components/top-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!token) router.replace("/login");
  }, [loading, token, router]);

  return (
    <div className="app-shell">
      <TopNav pathname={pathname} />
      <main className="app-main">{children}</main>
      <BottomNav pathname={pathname} />
    </div>
  );
}
