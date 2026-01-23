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
  explorer?: { _id?: string; name?: string; email?: string; avatar?: string; profilePhoto?: string };
  experience?: { _id?: string; title?: string; startsAt?: string; startDate?: string; maxParticipants?: number; remainingSpots?: number };
};

export default function HostParticipantsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { lang } = useLang();
  const t = useT();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState<"confirm" | "cancel" | null>(null);

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

  const exp = bookings[0]?.experience;
  const dateLabel = exp?.startsAt || exp?.startDate;
  const bookedSeats = bookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
  const totalSeats =
    typeof exp?.maxParticipants === "number"
      ? exp.maxParticipants
      : typeof exp?.remainingSpots === "number"
        ? exp.remainingSpots + bookedSeats
        : bookedSeats;
  const windowStart = exp?.startsAt || exp?.startDate || dateLabel;
  const windowEnd = exp?.endsAt || exp?.endDate || dateLabel;
  const startDate = windowStart ? new Date(windowStart) : null;
  const endDate = windowEnd ? new Date(windowEnd) : null;
  const isValidStart = startDate && !Number.isNaN(startDate.getTime());
  const isValidEnd = endDate && !Number.isNaN(endDate.getTime());
  const now = new Date();
  const confirmAfter = isValidStart ? new Date(startDate.getTime() + 15 * 60 * 1000) : null;
  const confirmUntil = isValidEnd ? new Date(endDate.getTime() + 48 * 60 * 60 * 1000) : null;
  const isBeforeWindow = confirmAfter ? now < confirmAfter : true;
  const isAfterWindow = confirmUntil ? now > confirmUntil : false;
  const canConfirm = !isBeforeWindow && !isAfterWindow;

  const actionableStatuses = new Set(["PAID", "DEPOSIT_PAID", "PENDING_ATTENDANCE"]);
  const actionableBookings = bookings.filter((b) => actionableStatuses.has(b.status || ""));

  const handleConfirmAll = async () => {
    if (!actionableBookings.length) return;
    if (!window.confirm(t("host_participants_confirm_prompt"))) return;
    try {
      setSavingAction("confirm");
      for (const booking of actionableBookings) {
        await apiPost(`/bookings/${booking._id}/confirm-attendance`);
      }
      await load();
    } finally {
      setSavingAction(null);
    }
  };

  const handleCancelAll = async () => {
    if (!actionableBookings.length) return;
    if (!window.confirm(t("host_participants_cancel_prompt"))) return;
    try {
      setSavingAction("cancel");
      for (const booking of actionableBookings) {
        await apiPost(`/bookings/${booking._id}/cancel-by-host`);
      }
      await load();
    } finally {
      setSavingAction(null);
    }
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
                  onClick={() => b.explorer?._id && router.push(`/users/${b.explorer._id}`)}
                  onKeyDown={(event) => {
                    if ((event.key === "Enter" || event.key === " ") && b.explorer?._id) {
                      router.push(`/users/${b.explorer._id}`);
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
              className={styles.primaryAction}
              type="button"
              onClick={handleConfirmAll}
              disabled={!actionableBookings.length || savingAction === "confirm" || !canConfirm}
            >
              {t("host_participants_confirm_action")}
            </button>
            <button
              className={styles.secondaryAction}
              type="button"
              onClick={handleCancelAll}
              disabled={!actionableBookings.length || savingAction === "cancel"}
            >
              {t("host_participants_cancel_action")}
            </button>
          </div>
          {!canConfirm ? (
            <div className={styles.confirmHint}>
              {isAfterWindow ? t("host_participants_confirm_expired") : t("host_participants_confirm_wait")}
            </div>
          ) : null}
        </>
      ) : (
        <div className={styles.empty}>{t("host_participants_empty")}</div>
      )}
    </div>
  );
}
