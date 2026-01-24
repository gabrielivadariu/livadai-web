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
  endsAt?: string;
  endDate?: string;
  startsAt?: string;
  city?: string;
  address?: string;
  bookedSpots?: number;
  maxParticipants?: number;
  availableSpots?: number;
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

  const visibleItems = items.filter((exp) => {
    const dateValue = exp.endsAt || exp.endDate || exp.startsAt || exp.startDate;
    if (!dateValue) return true;
    const ts = new Date(dateValue).getTime();
    return Number.isNaN(ts) ? true : ts <= Date.now();
  });

  const getParticipantsCount = (exp: HostExperience) => {
    if (typeof exp.bookedSpots === "number") return exp.bookedSpots;
    if (typeof exp.maxParticipants === "number" && typeof exp.availableSpots === "number") {
      return Math.max(0, exp.maxParticipants - exp.availableSpots);
    }
    return 0;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.kicker}>{t("hosted_experiences_kicker")}</div>
        <h1>{t("hosted_experiences_title")}</h1>
        <p>{t("hosted_experiences_subtitle")}</p>
      </div>

      {loading ? (
        <div className="muted">{t("common_loading")}</div>
      ) : visibleItems.length ? (
        <div className={styles.list}>
          {visibleItems.map((exp) => {
            const startDate = exp.startDate ? new Date(exp.startDate) : null;
            const participantsCount = getParticipantsCount(exp);
            return (
              <div key={exp._id} className={styles.card}>
                <div className={styles.title}>{exp.title || t("hosted_experiences_untitled")}</div>
                <div className={styles.meta}>
                  {startDate ? startDate.toLocaleDateString() : ""} {exp.startTime || ""}
                </div>
                <div className={styles.meta}>{exp.city || exp.address || ""}</div>
                <div className={styles.meta}>{t("hosted_experiences_participants", { count: participantsCount })}</div>
                <div className={styles.status}>{t("hosted_experiences_status_completed")}</div>
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
