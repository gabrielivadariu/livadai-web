"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import { useT } from "@/lib/i18n";
import styles from "./payment-status.module.css";

type Booking = {
  _id: string;
  status?: string;
  experience?: { _id?: string };
};

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useT();
  const [statusText, setStatusText] = useState(t("payment_processing"));

  useEffect(() => {
    const stored = window.localStorage.getItem("livadai_last_booking");
    const parsed = stored ? JSON.parse(stored) : null;
    const bookingId = parsed?.bookingId || searchParams?.get("bookingId");
    const experienceId = parsed?.experienceId;
    let attempts = 0;
    const maxAttempts = 6;

    const poll = async () => {
      attempts += 1;
      if (!bookingId) {
        router.replace("/my-activities");
        return;
      }
      try {
        const booking = await apiGet<Booking>(`/bookings/${bookingId}`);
        const expId = booking?.experience?._id || experienceId;
        if (booking?.status && ["PAID", "DEPOSIT_PAID", "COMPLETED", "PENDING_ATTENDANCE"].includes(booking.status)) {
          window.localStorage.removeItem("livadai_last_booking");
          router.replace(`/experiences/${expId}?bookingId=${bookingId}`);
          return;
        }
      } catch {
        // ignore and retry
      }
      if (attempts < maxAttempts) {
        setStatusText(t("payment_processing_retry"));
        setTimeout(poll, 2000);
      } else {
        router.replace(experienceId ? `/experiences/${experienceId}?bookingId=${bookingId}` : "/my-activities");
      }
    };

    poll();
  }, [router, searchParams, t]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.kicker}>LIVADAI</div>
        <h1>{t("payment_success_title")}</h1>
        <p>{t("payment_success_body")}</p>
        <div className={styles.status}>{statusText}</div>
        <div className={styles.note}>{t("payment_success_redirect")}</div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
