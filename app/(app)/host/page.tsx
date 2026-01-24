"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useT } from "@/lib/i18n";
import styles from "./host.module.css";

type HostProfile = {
  total_events?: number;
  total_participants?: number;
};

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

const purchasedExcludedStatuses = new Set(["COMPLETED", "CANCELLED", "REFUNDED"]);

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

export default function HostDashboardPage() {
  const { user } = useAuth();
  const t = useT();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [purchasedTab, setPurchasedTab] = useState<"upcoming" | "history">("upcoming");
  const [purchasedUpcoming, setPurchasedUpcoming] = useState<Booking[]>([]);
  const [purchasedHistory, setPurchasedHistory] = useState<Booking[]>([]);

  const hostId = user?._id || "";

  useEffect(() => {
    let active = true;
    if (!hostId) {
      return;
    }
    Promise.all([apiGet<HostProfile>("/hosts/me/profile"), apiGet<Booking[]>("/bookings/me")])
      .then(([profileRes, bookingsRes]) => {
        if (!active) return;
        setProfile(profileRes);
        const meId = getId(user?._id);
        const ownParticipantBookings = (bookingsRes || []).filter((b) => {
          const participantId = getId(b.explorer || b.user);
          return participantId && participantId === meId;
        });
        const upcoming: Booking[] = [];
        const history: Booking[] = [];
        ownParticipantBookings.forEach((b) => {
          if (b.status === "COMPLETED" && isCompletedVisible(b.experience)) {
            history.push(b);
          } else if (!purchasedExcludedStatuses.has(b.status || "")) {
            upcoming.push(b);
          }
        });
        setPurchasedUpcoming(upcoming);
        setPurchasedHistory(history);
      })
      .catch(() => {
        if (!active) return;
        setProfile(null);
        setPurchasedUpcoming([]);
        setPurchasedHistory([]);
      });
    return () => {
      active = false;
    };
  }, [hostId, user?._id]);

  const stats = useMemo(
    () => [
      { label: t("host_stats_bookings"), value: profile?.total_participants || 0 },
      { label: t("host_stats_revenue"), value: "—" },
    ],
    [profile?.total_participants, t]
  );

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.kicker}>{t("host_kicker")}</div>
          <h1 className={styles.title}>{t("host_dashboard_title")}</h1>
          <p className={styles.subtitle}>{t("host_dashboard_subtitle")}</p>
        </div>
        <Link className="button" href="/host/create-experience">
          {t("host_dashboard_cta")}
        </Link>
      </div>

      <div className={styles.stats}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue}>{s.value}</div>
          </div>
        ))}
      </div>

      <section className={styles.purchasedSection}>
        <div className={styles.purchasedHeader}>
          <h2>{t("host_purchased_title")}</h2>
        </div>
        <div className={styles.purchasedTabs}>
          <button
            type="button"
            className={`${styles.purchasedTab} ${purchasedTab === "upcoming" ? styles.purchasedTabActive : ""}`}
            onClick={() => setPurchasedTab("upcoming")}
          >
            {t("host_purchased_upcoming")}
          </button>
          <button
            type="button"
            className={`${styles.purchasedTab} ${purchasedTab === "history" ? styles.purchasedTabActive : ""}`}
            onClick={() => setPurchasedTab("history")}
          >
            {t("host_purchased_history")}
          </button>
        </div>
        <div className={styles.purchasedList}>
          {(purchasedTab === "upcoming" ? purchasedUpcoming : purchasedHistory).length ? (
            (purchasedTab === "upcoming" ? purchasedUpcoming : purchasedHistory).map((b) => {
              const exp = b.experience || {};
              const expId = exp._id;
              const dateText = exp.startDate
                ? `${new Date(exp.startDate).toLocaleDateString()} ${exp.startTime || ""}`
                : "";
              if (purchasedTab === "history") {
                return (
                  <div key={b._id} className={styles.purchasedCard}>
                    <div>
                      <div className={styles.purchasedTitle}>{exp.title || t("common_experience")}</div>
                      <div className={styles.purchasedMeta}>{t("host_purchased_completed")}</div>
                    </div>
                  </div>
                );
              }
              return (
                <Link key={b._id} href={expId ? `/experiences/${expId}` : "/host"} className={styles.purchasedCard}>
                  <div>
                    <div className={styles.purchasedTitle}>{exp.title || t("common_experience")}</div>
                    {dateText ? <div className={styles.purchasedMeta}>{dateText}</div> : null}
                    {exp.address ? <div className={styles.purchasedMeta}>{exp.address}</div> : null}
                  </div>
                  <span className={styles.chev}>›</span>
                </Link>
              );
            })
          ) : (
            <div className={styles.purchasedEmpty}>
              {purchasedTab === "upcoming" ? t("host_purchased_empty_upcoming") : t("host_purchased_empty_history")}
            </div>
          )}
        </div>
      </section>

      <section className={styles.menuSection}>
        <h2>{t("host_manage")}</h2>
        <div className={styles.menuGrid}>
          <Link href="/host/profile" className={styles.menuCard}>
            <div className={styles.menuIcon}>👤</div>
            <div>
              <div className={styles.menuTitle}>{t("host_menu_profile")}</div>
              <div className={styles.menuText}>{t("host_menu_profile_text")}</div>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
          <Link href="/host/bookings" className={styles.menuCard}>
            <div className={styles.menuIcon}>🧾</div>
            <div>
              <div className={styles.menuTitle}>{t("host_menu_bookings")}</div>
              <div className={styles.menuText}>{t("host_menu_bookings_text")}</div>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
          <Link href="/host/wallet" className={styles.menuCard}>
            <div className={styles.menuIcon}>💳</div>
            <div>
              <div className={styles.menuTitle}>{t("host_menu_wallet")}</div>
              <div className={styles.menuText}>{t("host_menu_wallet_text")}</div>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
          <Link href="/host/create-experience" className={styles.menuCardAlt}>
            <div className={styles.menuIcon}>➕</div>
            <div>
              <div className={styles.menuTitle}>{t("host_menu_create")}</div>
              <div className={styles.menuText}>{t("host_menu_create_text")}</div>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
