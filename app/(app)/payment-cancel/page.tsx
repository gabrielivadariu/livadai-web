"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n";
import styles from "../payment-success/payment-status.module.css";

export default function PaymentCancelPage() {
  const router = useRouter();
  const t = useT();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.kicker}>LIVADAI</div>
        <h1>{t("payment_cancel_title")}</h1>
        <p>{t("payment_cancel_body")}</p>
        <button className={styles.cta} type="button" onClick={() => router.push("/explore")}>
          {t("payment_cancel_cta")}
        </button>
      </div>
    </div>
  );
}
