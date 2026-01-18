"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiGet, apiPost } from "@/lib/api";
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
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [error, setError] = useState("");

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

  const onCancel = async (id: string) => {
    const confirmed = window.confirm(t("experience_cancel_confirm"));
    if (!confirmed) return;
    setCancelingId(id);
    setError("");
    try {
      await apiPost(`/experiences/${id}/cancel`, {});
      setItems((prev) =>
        prev.map((exp) => (exp._id === id ? { ...exp, status: "cancelled" } : exp))
      );
    } catch (err) {
      setError((err as Error).message || t("experience_cancel_error"));
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>{t("host_kicker")}</div>
          <h1>{t("host_experiences_title")}</h1>
          <p>{t("host_experiences_subtitle")}</p>
        </div>
        <Link className="button" href="/host/create-experience">
          {t("host_dashboard_cta")}
        </Link>
      </div>

      {loading ? (
        <div className="muted">{t("common_loading_experiences")}</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
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
                <div className={styles.actions}>
                  <Link className="button secondary" href={`/host/create-experience?edit=${exp._id}`}>
                    {t("experience_edit")}
                  </Link>
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => onCancel(exp._id)}
                    disabled={cancelingId === exp._id || exp.status === "cancelled"}
                  >
                    {cancelingId === exp._id ? t("common_loading") : t("experience_cancel")}
                  </button>
                </div>
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
