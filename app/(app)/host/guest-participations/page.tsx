"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useT } from "@/lib/i18n";
import styles from "./guest-participations.module.css";

type Booking = {
  _id: string;
  status?: string;
  experience?: {
    _id?: string;
    title?: string;
    address?: string;
    startDate?: string;
    startTime?: string;
    endDate?: string;
    startsAt?: string;
    endsAt?: string;
    date?: string;
  };
  explorer?: { _id?: string } | string;
  user?: { _id?: string } | string;
};

const historyStatuses = new Set(["COMPLETED", "AUTO_COMPLETED", "CANCELLED", "REFUNDED", "REFUND_FAILED", "NO_SHOW"]);
const activeStatuses = new Set(["PENDING", "PAID", "DEPOSIT_PAID", "CONFIRMED"]);

const getId = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value) {
    const record = value as { _id?: string; id?: string };
    return record._id || record.id || "";
  }
  return "";
};

const getExperienceEndDate = (exp?: Booking["experience"]) =>
  exp?.endDate || exp?.endsAt || exp?.date || exp?.startDate || exp?.startsAt || "";

const isCompletedVisible = (exp?: Booking["experience"]) => {
  const endDate = getExperienceEndDate(exp);
  if (!endDate) return true;
  const endMs = new Date(endDate).getTime();
  return Date.now() > endMs + 48 * 60 * 60 * 1000;
};

export default function GuestParticipationsPage() {
  const { user } = useAuth();
  const t = useT();
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [history, setHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?._id || "";

  useEffect(() => {
    let active = true;
    if (!userId) {
      setLoading(false);
      return;
    }
    apiGet<Booking[]>("/bookings/me")
      .then((bookingsRes) => {
        if (!active) return;
        const ownParticipantBookings = (bookingsRes || []).filter((b) => {
          const participantId = getId(b.explorer || b.user);
          return participantId && participantId === userId;
        });
        const next: Booking[] = [];
        const past: Booking[] = [];
        ownParticipantBookings.forEach((b) => {
          if (historyStatuses.has(b.status || "")) {
            if (!["COMPLETED", "AUTO_COMPLETED"].includes(b.status || "") || isCompletedVisible(b.experience)) {
              past.push(b);
            }
            return;
          }
          if (activeStatuses.has(b.status || "")) {
            next.push(b);
            return;
          }
          next.push(b);
        });
        setUpcoming(next);
        setHistory(past);
      })
      .catch(() => {
        if (!active) return;
        setUpcoming([]);
        setHistory([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const items = tab === "upcoming" ? upcoming : history;

  const dateText = (exp?: Booking["experience"]) =>
    exp?.startDate ? `${new Date(exp.startDate).toLocaleDateString()} ${exp.startTime || ""}` : "";

  const statusLabel = useMemo(
    () => ({
      COMPLETED: t("guest_completed"),
      AUTO_COMPLETED: t("guest_completed"),
      CANCELLED: t("guest_cancelled"),
      REFUNDED: t("guest_cancelled"),
      REFUND_FAILED: t("guest_cancelled"),
      NO_SHOW: t("guest_no_show"),
    }),
    [t]
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>{t("guest_kicker")}</div>
          <h1>{t("guest_title")}</h1>
          <p>{t("guest_subtitle")}</p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === "upcoming" ? styles.tabActive : ""}`}
          onClick={() => setTab("upcoming")}
        >
          {t("guest_tab_upcoming")}
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === "history" ? styles.tabActive : ""}`}
          onClick={() => setTab("history")}
        >
          {t("guest_tab_history")}
        </button>
      </div>

      {loading ? (
        <div className="muted">{t("common_loading")}</div>
      ) : items.length ? (
        <div className={styles.list}>
          {items.map((b) => {
            const exp = b.experience || {};
            const expId = exp._id;
            if (tab === "history") {
              return (
                <div key={b._id} className={styles.card}>
                  <div>
                    <div className={styles.title}>{exp.title || t("common_experience")}</div>
                    <div className={styles.meta}>{statusLabel[b.status as keyof typeof statusLabel] || b.status}</div>
                    {b.status === "REFUNDED" ? <div className={styles.meta}>{t("guest_refund_initiated")}</div> : null}
                    {b.status === "REFUND_FAILED" ? <div className={styles.meta}>{t("guest_refund_processing")}</div> : null}
                    {dateText(exp) ? <div className={styles.meta}>{dateText(exp)}</div> : null}
                  </div>
                </div>
              );
            }
            return (
              <Link key={b._id} href={expId ? `/experiences/${expId}` : "/host"} className={styles.card}>
                <div>
                  <div className={styles.title}>{exp.title || t("common_experience")}</div>
                  {dateText(exp) ? <div className={styles.meta}>{dateText(exp)}</div> : null}
                  {exp.address ? <div className={styles.meta}>{exp.address}</div> : null}
                </div>
                <span className={styles.chev}>›</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>
          {tab === "upcoming" ? t("guest_empty_upcoming") : t("guest_empty_history")}
        </div>
      )}
    </div>
  );
}
