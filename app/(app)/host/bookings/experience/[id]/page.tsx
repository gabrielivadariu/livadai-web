"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { dedupeBookings } from "@/lib/booking-dedupe";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./participants.module.css";

type Booking = {
  _id: string;
  status?: string;
  quantity?: number;
  explorer?: { _id?: string; name?: string; email?: string; avatar?: string; profilePhoto?: string };
  experience?: {
    _id?: string;
    title?: string;
    startsAt?: string;
    startDate?: string;
    endsAt?: string;
    endDate?: string;
    maxParticipants?: number;
    remainingSpots?: number;
  };
};

export default function HostParticipantsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { lang } = useLang();
  const t = useT();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState<"cancel" | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Booking[]>(`/bookings/host/experience/${id}`);
      setBookings(dedupeBookings(data || []));
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const exp = bookings[0]?.experience;
  const dateLabel = exp?.startsAt || exp?.startDate;
  const bookedSeats = bookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
  const totalSeats =
    typeof exp?.maxParticipants === "number"
      ? exp.maxParticipants
      : typeof exp?.remainingSpots === "number"
        ? exp.remainingSpots + bookedSeats
        : bookedSeats;
  const handleCancelAll = async () => {
    if (!window.confirm(t("host_participants_cancel_prompt"))) return;
    try {
      setSavingAction("cancel");
      await apiPost(`/experiences/${id}/cancel`);
      await load();
      router.refresh();
    } finally {
      setSavingAction(null);
    }
  };

  const openExplorerProfile = (booking: Booking) => {
    const explorerId = booking.explorer?._id;
    if (!explorerId) return;
    router.push(`/users/${explorerId}?bookingId=${booking._id}`);
  };

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
        <div className={styles.seats}>{t("host_participants_occupied")}: {bookedSeats} / {totalSeats}</div>
      </div>

      {loading ? (
        <div className="muted">{t("common_loading_booking")}</div>
      ) : bookings.length ? (
        <>
          <div className={styles.list}>
            {bookings.map((b) => {
              const avatar = b.explorer?.avatar || b.explorer?.profilePhoto;
              return (
                <div
                  key={b._id}
                  className={styles.card}
                  role="button"
                  tabIndex={0}
                  onClick={() => openExplorerProfile(b)}
                  onKeyDown={(event) => {
                    if ((event.key === "Enter" || event.key === " ") && b.explorer?._id) {
                      openExplorerProfile(b);
                    }
                  }}
                >
                  <div className={styles.avatar}>
                    {avatar ? <img src={avatar} alt="" /> : <span>{(b.explorer?.name || b.explorer?.email || "?").slice(0, 1).toUpperCase()}</span>}
                  </div>
                  <div>
                    <div className={styles.title}>{b.explorer?.name || b.explorer?.email || "—"}</div>
                    <div className={styles.meta}>
                      {t("host_bookings_seats")}: {b.quantity || 1}
                    </div>
                    <div className={styles.meta}>
                      {t("host_participants_status")}: {b.status || "—"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.actions}>
            <button
              className={styles.secondaryAction}
              type="button"
              onClick={handleCancelAll}
              disabled={savingAction === "cancel"}
            >
              {t("host_participants_cancel_action")}
            </button>
          </div>
          <div className={styles.confirmHint}>{t("host_participants_auto_complete_hint")}</div>
        </>
      ) : (
        <div className={styles.empty}>{t("host_participants_empty")}</div>
      )}
    </div>
  );
}
