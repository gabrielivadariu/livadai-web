"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./participants.module.css";

type Booking = {
  _id: string;
  status?: string;
  quantity?: number;
  explorer?: { _id?: string; name?: string; email?: string };
  experience?: { _id?: string; title?: string; startsAt?: string; startDate?: string };
};

export default function HostParticipantsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { lang } = useLang();
  const t = useT();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Booking[]>(`/bookings/host/experience/${id}`);
      setBookings(data || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const confirmAttendance = async (bookingId: string) => {
    if (!window.confirm(t("host_participants_confirm_prompt"))) return;
    try {
      setSaving(bookingId);
      await apiPost(`/bookings/${bookingId}/confirm-attendance`, {});
      await load();
    } finally {
      setSaving(null);
    }
  };

  const cancelParticipation = async (bookingId: string) => {
    if (!window.confirm(t("host_participants_cancel_prompt"))) return;
    try {
      setSaving(bookingId);
      await apiPost(`/bookings/${bookingId}/cancel-by-host`, {});
      await load();
    } finally {
      setSaving(null);
    }
  };

  const exp = bookings[0]?.experience;
  const dateLabel = exp?.startsAt || exp?.startDate;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} type="button" onClick={() => router.back()}>
          ← {t("common_back")}
        </button>
        <h1>{exp?.title || t("host_participants_title")}</h1>
        <p>
          {dateLabel ? new Date(dateLabel).toLocaleString(lang === "en" ? "en-US" : "ro-RO") : t("host_bookings_date_fallback")}
        </p>
      </div>

      {loading ? (
        <div className="muted">{t("common_loading_booking")}</div>
      ) : bookings.length ? (
        <div className={styles.list}>
          {bookings.map((b) => (
            <div key={b._id} className={styles.card}>
              <div>
                <div className={styles.title}>{b.explorer?.name || b.explorer?.email || "—"}</div>
                <div className={styles.meta}>
                  {t("host_bookings_seats")}: {b.quantity || 1}
                </div>
                <div className={styles.meta}>
                  {t("host_participants_status")}: {b.status || "—"}
                </div>
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => confirmAttendance(b._id)}
                  disabled={saving === b._id}
                >
                  {t("host_participants_confirm")}
                </button>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => cancelParticipation(b._id)}
                  disabled={saving === b._id}
                >
                  {t("host_participants_cancel")}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>{t("host_participants_empty")}</div>
      )}
    </div>
  );
}
