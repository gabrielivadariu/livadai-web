"use client";

import React from "react";
import { AuthProvider } from "@/context/auth-context";
import { LangProvider } from "@/context/lang-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LangProvider>{children}</LangProvider>
    </AuthProvider>
  );
}
