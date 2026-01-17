"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./activities.module.css";

type Booking = {
  _id: string;
  status?: string;
  experience?: { title?: string };
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
        items.map((b) => (
          <div key={b._id} className={styles.row}>
            <div className={styles.title}>{b.experience?.title || t("common_experience")}</div>
            <div className={styles.meta}>{b.date ? new Date(b.date).toLocaleString(lang === "en" ? "en-US" : "ro-RO") : ""}</div>
            <div className={styles.status}>{b.status || "STATUS"}</div>
          </div>
        ))
      ) : (
        <div className="muted">{t("my_activities_empty")}</div>
      )}
    </div>
  );
}
