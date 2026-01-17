"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import styles from "./host-bookings.module.css";

type Booking = {
  _id: string;
  status?: string;
  date?: string;
  timeSlot?: string;
  explorer?: { name?: string; email?: string };
  experience?: { title?: string; startDate?: string; startsAt?: string };
};

export default function HostBookingsPage() {
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
          <div className={styles.kicker}>Host</div>
          <h1>Booking-uri</h1>
          <p>Solicitări și rezervări confirmate pentru experiențele tale.</p>
        </div>
      </div>

      {loading ? (
        <div className="muted">Se încarcă booking-urile…</div>
      ) : items.length ? (
        <div className={styles.list}>
          {items.map((b) => {
            const dateLabel = b.experience?.startsAt || b.experience?.startDate || b.date;
            return (
              <div key={b._id} className={styles.card}>
                <div>
                  <div className={styles.title}>{b.experience?.title || "Experiență"}</div>
                  <div className={styles.meta}>
                    {dateLabel ? new Date(dateLabel).toLocaleString("ro-RO") : "Data neconfirmată"}
                  </div>
                  <div className={styles.meta}>Explorer: {b.explorer?.name || b.explorer?.email || "—"}</div>
                </div>
                <div className={styles.status}>{b.status || "STATUS"}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📭</div>
          <div className={styles.emptyTitle}>Nu ai booking-uri încă</div>
          <div className={styles.emptyText}>Când cineva rezervă o experiență, o vei vedea aici.</div>
        </div>
      )}
    </div>
  );
}
