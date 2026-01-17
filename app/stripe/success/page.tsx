"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StripeSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/host/wallet");
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 520, margin: "80px auto" }}>
        <h2 style={{ marginTop: 0 }}>Stripe conectat</h2>
        <p className="muted">Onboarding-ul a fost finalizat. Te redirecționăm către portofel.</p>
        <button className="button" type="button" onClick={() => router.replace("/host/wallet")}>
          Continuă către Portofel
        </button>
      </div>
    </div>
  );
}
