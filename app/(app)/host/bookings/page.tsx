"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./host-bookings.module.css";
import Link from "next/link";

type Booking = {
  _id: string;
  status?: string;
  date?: string;
  timeSlot?: string;
  explorer?: { _id?: string; name?: string; email?: string };
  experience?: { title?: string; startDate?: string; startsAt?: string };
};

export default function HostBookingsPage() {
  const { lang } = useLang();
  const t = useT();
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
          {items.map((b) => {
            const dateLabel = b.experience?.startsAt || b.experience?.startDate || b.date;
            return (
              <div key={b._id} className={styles.card}>
                <div>
                  <div className={styles.title}>{b.experience?.title || t("common_experience")}</div>
                  <div className={styles.meta}>
                    {dateLabel ? new Date(dateLabel).toLocaleString(lang === "en" ? "en-US" : "ro-RO") : t("host_bookings_date_fallback")}
                  </div>
                  <div className={styles.meta}>
                    {t("host_bookings_explorer")}:{" "}
                    {b.explorer?._id ? (
                      <Link href={`/users/${b.explorer._id}`}>{b.explorer?.name || b.explorer?.email || "—"}</Link>
                    ) : (
                      b.explorer?.name || b.explorer?.email || "—"
                    )}
                  </div>
                </div>
                <div className={styles.status}>{b.status || "STATUS"}</div>
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
