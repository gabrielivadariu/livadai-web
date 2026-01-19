"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./host.module.css";

type HostProfile = {
  total_events?: number;
  total_participants?: number;
};

type Experience = {
  _id: string;
  title?: string;
  coverImageUrl?: string;
  status?: string;
  startsAt?: string;
};

export default function HostDashboardPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const t = useT();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  const hostId = user?._id || "";

  useEffect(() => {
    let active = true;
    if (!hostId) {
      setLoading(false);
      return;
    }
    Promise.all([
      apiGet<HostProfile>("/hosts/me/profile").catch(() => null),
      apiGet<Experience[]>(`/hosts/${hostId}/activities?limit=6`).catch(() => []),
    ])
      .then(([profileRes, experiencesRes]) => {
        if (!active) return;
        setProfile(profileRes);
        setItems(experiencesRes || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [hostId]);

  const stats = useMemo(
    () => [
      { label: t("host_stats_active"), value: items.length || 0 },
      { label: t("host_stats_bookings"), value: profile?.total_participants || 0 },
      { label: t("host_stats_revenue"), value: "—" },
    ],
    [items.length, profile?.total_participants, t]
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
          <Link href="/host/experiences" className={styles.menuCard}>
            <div className={styles.menuIcon}>📅</div>
            <div>
              <div className={styles.menuTitle}>{t("host_menu_experiences")}</div>
              <div className={styles.menuText}>{t("host_menu_experiences_text")}</div>
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

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{t("host_your_experiences")}</h2>
          <span className={styles.sectionMeta}>{t("host_latest_published")}</span>
        </div>

        {loading ? (
          <div className="muted">{t("common_loading_experiences")}</div>
        ) : items.length ? (
          <div className={styles.grid}>
            {items.map((exp) => (
              <article key={exp._id} className={styles.card}>
                {exp.coverImageUrl ? (
                  <img src={exp.coverImageUrl} alt={exp.title || "experience"} />
                ) : (
                  <div className={styles.coverPlaceholder} />
                )}
                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>{exp.title || t("common_experience")}</div>
                  <div className={styles.cardMeta}>
                    {exp.startsAt ? new Date(exp.startsAt).toLocaleDateString(lang === "en" ? "en-US" : "ro-RO") : t("host_schedule_flexible")}
                    <span>{exp.status || "PUBLISHED"}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🚀</div>
            <div className={styles.emptyTitle}>{t("host_empty_title")}</div>
            <p className={styles.emptyText}>{t("host_empty_text")}</p>
            <Link className="button" href="/host/create-experience">
              {t("host_empty_cta")}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
