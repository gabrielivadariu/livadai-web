"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useT } from "@/lib/i18n";
import styles from "./hosted-experiences.module.css";

type HostExperience = {
  _id: string;
  title?: string;
  startDate?: string;
  startTime?: string;
  city?: string;
  address?: string;
};

export default function HostedExperiencesPage() {
  const { user } = useAuth();
  const t = useT();
  const [items, setItems] = useState<HostExperience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user?._id) {
      setLoading(false);
      return;
    }
    apiGet<HostExperience[]>(`/hosts/${user._id}/activities`)
      .then((res) => {
        if (!active) return;
        setItems(res || []);
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
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
        <div className={styles.kicker}>{t("hosted_experiences_kicker")}</div>
        <h1>{t("hosted_experiences_title")}</h1>
        <p>{t("hosted_experiences_subtitle")}</p>
      </div>

      {loading ? (
        <div className="muted">{t("common_loading")}</div>
      ) : items.length ? (
        <div className={styles.list}>
          {items.map((exp) => {
            const startDate = exp.startDate ? new Date(exp.startDate) : null;
            const statusLabel =
              startDate && startDate.getTime() > Date.now()
                ? t("hosted_experiences_upcoming")
                : t("hosted_experiences_completed");
            return (
              <div key={exp._id} className={styles.card}>
                <div className={styles.title}>{exp.title || t("hosted_experiences_untitled")}</div>
                <div className={styles.meta}>
                  {startDate ? startDate.toLocaleDateString() : ""} {exp.startTime || ""}
                </div>
                <div className={styles.meta}>{exp.city || exp.address || ""}</div>
                <div className={styles.status}>{statusLabel}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>{t("hosted_experiences_empty")}</div>
      )}
    </div>
  );
}
