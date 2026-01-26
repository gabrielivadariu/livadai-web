"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace("/experiences");
  }, [loading, router]);

  return <div className="page screen">Loading...</div>;
}
