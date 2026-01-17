"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";

export default function StripeRefreshPage() {
  const router = useRouter();
  const t = useT();

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 520, margin: "80px auto" }}>
        <h2 style={{ marginTop: 0 }}>{t("stripe_refresh_title")}</h2>
        <p className="muted">{t("stripe_refresh_text")}</p>
        <button className="button" type="button" onClick={() => router.replace("/host/wallet")}>
          {t("stripe_refresh_back")}
        </button>
      </div>
    </div>
  );
}
