"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isHost = user?.role === "HOST" || user?.role === "BOTH";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?reason=auth&next=${encodeURIComponent(pathname || "/host")}`);
      return;
    }
    if (!isHost) {
      router.replace("/profile");
    }
  }, [loading, user, isHost, router]);

  if (loading || !user || !isHost) {
    return null;
  }

  return <>{children}</>;
}
