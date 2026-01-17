"use client";

import { useRouter } from "next/navigation";

export default function StripeRefreshPage() {
  const router = useRouter();

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 520, margin: "80px auto" }}>
        <h2 style={{ marginTop: 0 }}>Finalizează Stripe</h2>
        <p className="muted">Onboarding-ul Stripe a fost întrerupt. Poți relua procesul din portofel.</p>
        <button className="button" type="button" onClick={() => router.replace("/host/wallet")}>
          Înapoi la Portofel
        </button>
      </div>
    </div>
  );
}
