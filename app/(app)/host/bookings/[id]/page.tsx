"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./host-booking-detail.module.css";

type Booking = {
  _id: string;
  status?: string;
  quantity?: number;
  explorer?: { _id?: string; name?: string; email?: string; phone?: string };
  experience?: { _id?: string; title?: string; startsAt?: string; startDate?: string; endsAt?: string; endDate?: string };
};

export default function HostBookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { lang } = useLang();
  const t = useT();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGet<Booking>(`/bookings/${id}`)
      .then((data) => {
        if (active) setBooking(data || null);
      })
      .catch(() => {
        if (active) setBooking(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const exp = booking?.experience;
  const startLabel = exp?.startsAt || exp?.startDate;
  const endLabel = exp?.endsAt || exp?.endDate;
  const dateText = startLabel ? new Date(startLabel).toLocaleString(lang === "en" ? "en-US" : "ro-RO") : "—";
  const endText = endLabel ? new Date(endLabel).toLocaleString(lang === "en" ? "en-US" : "ro-RO") : "—";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} type="button" onClick={() => router.back()}>
          ← {t("common_back")}
        </button>
        <h1>{t("host_booking_detail_title")}</h1>
        <p>{t("host_booking_detail_subtitle")}</p>
      </div>

      {loading ? (
        <div className="muted">{t("common_loading_booking")}</div>
      ) : !booking ? (
        <div className={styles.empty}>{t("host_booking_detail_missing")}</div>
      ) : (
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.kicker}>{t("host_booking_detail_experience")}</div>
            <div className={styles.title}>{exp?.title || t("common_experience")}</div>
            <div className={styles.meta}>{t("host_booking_detail_start")}: {dateText}</div>
            <div className={styles.meta}>{t("host_booking_detail_end")}: {endText}</div>
            {exp?._id ? (
              <Link className={styles.link} href={`/experiences/${exp._id}`}>
                {t("host_booking_detail_view_experience")}
              </Link>
            ) : null}
          </div>

          <div className={styles.card}>
            <div className={styles.kicker}>{t("host_booking_detail_explorer")}</div>
            <div className={styles.title}>{booking.explorer?.name || booking.explorer?.email || "—"}</div>
            {booking.explorer?.phone ? <div className={styles.meta}>{booking.explorer.phone}</div> : null}
            {booking.explorer?._id ? (
              <Link className={styles.link} href={`/users/${booking.explorer._id}`}>
                {t("host_booking_detail_view_profile")}
              </Link>
            ) : null}
          </div>

          <div className={styles.card}>
            <div className={styles.kicker}>{t("host_booking_detail_booking")}</div>
            <div className={styles.meta}>
              {t("host_booking_detail_seats")}: <strong>{booking.quantity || 1}</strong>
            </div>
            <div className={styles.meta}>
              {t("host_booking_detail_status")}: <strong>{booking.status || "—"}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
