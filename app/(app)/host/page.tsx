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

export default function HostDashboardPage() {
  const { user } = useAuth();
  const t = useT();
  const [profile, setProfile] = useState<HostProfile | null>(null);

  const hostId = user?._id || "";

  useEffect(() => {
    let active = true;
    if (!hostId) {
      return;
    }
    apiGet<HostProfile>("/hosts/me/profile")
      .then((profileRes) => {
        if (!active) return;
        setProfile(profileRes);
      })
      .catch(() => {
        if (!active) return;
        setProfile(null);
      });
    return () => {
      active = false;
    };
  }, [hostId]);

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
          <Link href="/host/guest-participations" className={styles.menuCard}>
            <div className={styles.menuIcon}>🧑‍🤝‍🧑</div>
            <div>
              <div className={styles.menuTitle}>{t("host_menu_guest")}</div>
              <div className={styles.menuText}>{t("host_menu_guest_text")}</div>
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
