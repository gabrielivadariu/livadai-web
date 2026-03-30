"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    trackEvent({ eventName: "homepage_visit", path: "/", page: "/" });
    router.replace("/experiences");
  }, [router]);

  return <div className="page screen">Loading...</div>;
}
