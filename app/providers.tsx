"use client";

import React, { Suspense } from "react";
import AnalyticsProvider from "@/components/analytics-provider";
import { AuthProvider } from "@/context/auth-context";
import { LangProvider } from "@/context/lang-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LangProvider>
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        {children}
      </LangProvider>
    </AuthProvider>
  );
}
