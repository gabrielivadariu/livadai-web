"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./activities.module.css";

type Booking = {
  _id: string;
  status?: string;
  experience?: { _id?: string; title?: string } | string;
  date?: string;
};

export default function MyActivitiesPage() {
  const { lang } = useLang();
  const t = useT();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGet<Booking[]>("/bookings/me")
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

  if (loading) return <div className="muted">{t("common_loading_activity")}</div>;

  return (
    <div className={styles.list}>
      {items.length ? (
        items.map((b) => {
          const exp = b.experience;
          const expId = typeof exp === "string" ? exp : exp?._id;
          const title = typeof exp === "string" ? t("common_experience") : exp?.title || t("common_experience");
          const dateLabel = b.date ? new Date(b.date).toLocaleString(lang === "en" ? "en-US" : "ro-RO") : "";
          const href = expId ? `/experiences/${expId}?bookingId=${b._id}` : "";
          return expId ? (
            <Link key={b._id} href={href} className={styles.rowLink}>
              <div className={`${styles.row} ${styles.rowClickable}`}>
                <div className={styles.title}>{title}</div>
                <div className={styles.meta}>{dateLabel}</div>
                <div className={styles.status}>{b.status || "STATUS"}</div>
              </div>
            </Link>
          ) : (
            <div key={b._id} className={styles.row}>
              <div className={styles.title}>{title}</div>
              <div className={styles.meta}>{dateLabel}</div>
              <div className={styles.status}>{b.status || "STATUS"}</div>
            </div>
          );
        })
      ) : (
        <div className="muted">{t("my_activities_empty")}</div>
      )}
    </div>
  );
}
