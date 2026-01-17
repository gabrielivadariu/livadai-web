"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import styles from "./activities.module.css";

type Booking = {
  _id: string;
  status?: string;
  experience?: { title?: string };
  date?: string;
};

export default function MyActivitiesPage() {
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

  if (loading) return <div className="muted">Se încarcă rezervările…</div>;

  return (
    <div className={styles.list}>
      {items.length ? (
        items.map((b) => (
          <div key={b._id} className={styles.row}>
            <div className={styles.title}>{b.experience?.title || "Experiență"}</div>
            <div className={styles.meta}>{b.date ? new Date(b.date).toLocaleString("ro-RO") : ""}</div>
            <div className={styles.status}>{b.status || "STATUS"}</div>
          </div>
        ))
      ) : (
        <div className="muted">Nu ai activități încă.</div>
      )}
    </div>
  );
}
