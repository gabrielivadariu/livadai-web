"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./host-bookings.module.css";
import { useRouter } from "next/navigation";

type Booking = {
  _id: string;
  status?: string;
  date?: string;
  timeSlot?: string;
  quantity?: number;
  explorer?: { _id?: string; name?: string; email?: string };
  experience?: {
    _id?: string;
    title?: string;
    startDate?: string;
    startsAt?: string;
    maxParticipants?: number;
    remainingSpots?: number;
  };
};

export default function HostBookingsPage() {
  const { lang } = useLang();
  const t = useT();
  const router = useRouter();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGet<Booking[]>("/bookings/host")
      .then((data) => {
        if (active) setItems(data || []);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>{t("host_kicker")}</div>
          <h1>{t("host_bookings_title")}</h1>
          <p>{t("host_bookings_subtitle")}</p>
        </div>
      </div>

      {loading ? (
        <div className="muted">{t("common_loading_bookings")}</div>
      ) : items.length ? (
        <div className={styles.list}>
          {Object.values(
            items.reduce<Record<string, { experience: NonNullable<Booking["experience"]>; bookings: Booking[] }>>((acc, booking) => {
              const exp = booking.experience;
              const expId = exp?._id || "unknown";
              if (!exp) return acc;
              if (!acc[expId]) {
                acc[expId] = { experience: exp, bookings: [] };
              }
              acc[expId].bookings.push(booking);
              return acc;
            }, {})
          ).map((group) => {
            const exp = group.experience;
            const dateLabel = exp?.startsAt || exp?.startDate;
            const bookedSeats = group.bookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
            const totalSeats =
              typeof exp?.maxParticipants === "number"
                ? exp.maxParticipants
                : typeof exp?.remainingSpots === "number"
                  ? exp.remainingSpots + bookedSeats
                  : bookedSeats;
            return (
              <div
                key={exp?._id}
                className={styles.card}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/host/bookings/experience/${exp?._id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    router.push(`/host/bookings/experience/${exp?._id}`);
                  }
                }}
              >
                <div>
                  <div className={styles.title}>{exp?.title || t("common_experience")}</div>
                  <div className={styles.meta}>
                    {dateLabel ? new Date(dateLabel).toLocaleString(lang === "en" ? "en-US" : "ro-RO") : t("host_bookings_date_fallback")}
                  </div>
                  <div className={styles.meta}>
                    {t("host_bookings_occupied")}: {bookedSeats} / {totalSeats}
                  </div>
                </div>
                <div className={styles.status}>{t("host_bookings_participants")}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📭</div>
          <div className={styles.emptyTitle}>{t("host_bookings_empty_title")}</div>
          <div className={styles.emptyText}>{t("host_bookings_empty_text")}</div>
        </div>
      )}
    </div>
  );
}
