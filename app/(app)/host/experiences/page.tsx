"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiGet } from "@/lib/api";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./host-experiences.module.css";

type Experience = {
  _id: string;
  title?: string;
  coverImageUrl?: string;
  startsAt?: string;
  status?: string;
};

export default function HostExperiencesPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const t = useT();
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user?._id) {
      setLoading(false);
      return;
    }
    apiGet<Experience[]>(`/hosts/${user._id}/activities?limit=50`)
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
  }, [user?._id]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>Host</div>
          <h1>{t("host_experiences_title")}</h1>
          <p>{t("host_experiences_subtitle")}</p>
        </div>
        <Link className="button" href="/host/create-experience">
          {t("host_dashboard_cta")}
        </Link>
      </div>

      {loading ? (
        <div className="muted">{t("common_loading_experiences")}</div>
      ) : items.length ? (
        <div className={styles.grid}>
          {items.map((exp) => (
            <article key={exp._id} className={styles.card}>
              {exp.coverImageUrl ? <img src={exp.coverImageUrl} alt={exp.title || "experience"} /> : <div className={styles.coverPlaceholder} />}
              <div className={styles.cardBody}>
                <div className={styles.title}>{exp.title || t("common_experience")}</div>
                <div className={styles.meta}>
                  {exp.startsAt ? new Date(exp.startsAt).toLocaleDateString(lang === "en" ? "en-US" : "ro-RO") : t("host_schedule_flexible")}
                </div>
                <div className={styles.status}>{exp.status || "PUBLISHED"}</div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🗺️</div>
          <div className={styles.emptyTitle}>{t("host_experiences_empty_title")}</div>
          <div className={styles.emptyText}>{t("host_experiences_empty_text")}</div>
          <Link className="button" href="/host/create-experience">
            {t("host_experiences_empty_cta")}
          </Link>
        </div>
      )}
    </div>
  );
}
