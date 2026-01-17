"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";

export default function StripeSuccessPage() {
  const router = useRouter();
  const t = useT();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/host/wallet");
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 520, margin: "80px auto" }}>
        <h2 style={{ marginTop: 0 }}>{t("stripe_success_title")}</h2>
        <p className="muted">{t("stripe_success_text")}</p>
        <button className="button" type="button" onClick={() => router.replace("/host/wallet")}>
          {t("stripe_success_back")}
        </button>
      </div>
    </div>
  );
}
