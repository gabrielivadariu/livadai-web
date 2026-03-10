"use client";

import { useEffect, useState } from "react";
import { apiDelete, apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
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
  scheduleGroupId?: string | null;
  status?: string;
  isActive?: boolean;
  scheduleType?: "ONE_TIME" | "LONG_TERM";
};

export default function HostedExperiencesPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const t = useT();
  const [items, setItems] = useState<HostExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const loadActivities = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiGet<HostExperience[]>(`/hosts/${user._id}/activities?limit=500`);
      setItems(res || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (!user?._id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFeedback(null);
    apiGet<HostExperience[]>(`/hosts/${user._id}/activities?limit=500`)
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

  const getExperienceTime = (exp: HostExperience) => {
    const raw = exp.endsAt || exp.endDate || exp.startsAt || exp.startDate;
    if (!raw) return null;
    const ts = new Date(raw).getTime();
    return Number.isNaN(ts) ? null : ts;
  };

  const now = Date.now();
  const upcomingItems = items
    .filter((exp) => {
      const ts = getExperienceTime(exp);
      return ts === null ? true : ts > now;
    })
    .sort((a, b) => (getExperienceTime(a) || 0) - (getExperienceTime(b) || 0));

  const completedItems = items
    .filter((exp) => {
      const ts = getExperienceTime(exp);
      return ts !== null && ts <= now;
    })
    .sort((a, b) => (getExperienceTime(b) || 0) - (getExperienceTime(a) || 0));

  const formatDateTime = (value?: string) => {
    if (!value) return t("host_bookings_date_fallback");
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return t("host_bookings_date_fallback");
    return parsed.toLocaleString(lang === "en" ? "en-US" : "ro-RO");
  };

  const getParticipantsCount = (exp: HostExperience) => {
    if (typeof exp.bookedSpots === "number") return exp.bookedSpots;
    if (typeof exp.maxParticipants === "number" && typeof exp.availableSpots === "number") {
      return Math.max(0, exp.maxParticipants - exp.availableSpots);
    }
    return 0;
  };

  const onDeleteSingle = async (experienceId: string) => {
    const ok = window.confirm(t("hosted_experiences_delete_confirm_slot"));
    if (!ok) return;
    setFeedback(null);
    setBusyAction(`slot:${experienceId}`);
    try {
      await apiDelete(`/experiences/${experienceId}`);
      setFeedback({ type: "success", text: t("hosted_experiences_delete_slot_success") });
      await loadActivities();
    } catch (err) {
      setFeedback({
        type: "error",
        text: (err as Error)?.message || t("hosted_experiences_delete_error"),
      });
    } finally {
      setBusyAction(null);
    }
  };

  const onDeleteSeries = async (groupId: string) => {
    const ok = window.confirm(t("hosted_experiences_delete_confirm_series"));
    if (!ok) return;
    setFeedback(null);
    setBusyAction(`series:${groupId}`);
    try {
      const response = await apiDelete<{ deletedCount?: number; skippedWithBookings?: number }>(
        `/experiences/group/${groupId}`
      );
      const template = t("hosted_experiences_delete_series_success");
      setFeedback({
        type: "success",
        text: template
          .replace("{deleted}", String(response?.deletedCount || 0))
          .replace("{skipped}", String(response?.skippedWithBookings || 0)),
      });
      await loadActivities();
    } catch (err) {
      setFeedback({
        type: "error",
        text: (err as Error)?.message || t("hosted_experiences_delete_error"),
      });
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.kicker}>{t("hosted_experiences_kicker")}</div>
        <h1>{t("hosted_experiences_title")}</h1>
        <p>{t("hosted_experiences_subtitle")}</p>
      </div>

      {feedback ? <div className={feedback.type === "success" ? styles.success : styles.error}>{feedback.text}</div> : null}

      {loading ? (
        <div className="muted">{t("common_loading")}</div>
      ) : !upcomingItems.length && !completedItems.length ? (
        <div className={styles.empty}>{t("hosted_experiences_empty")}</div>
      ) : (
        <>
          <section className={styles.section}>
            <h2>{t("hosted_experiences_upcoming")}</h2>
            {upcomingItems.length ? (
              <div className={styles.list}>
                {upcomingItems.map((exp) => {
                  const participantsCount = getParticipantsCount(exp);
                  const seriesActionBusy = busyAction === `series:${exp.scheduleGroupId || ""}`;
                  const singleActionBusy = busyAction === `slot:${exp._id}`;
                  return (
                    <div key={exp._id} className={styles.card}>
                      <div className={styles.title}>{exp.title || t("hosted_experiences_untitled")}</div>
                      <div className={styles.meta}>{formatDateTime(exp.startsAt || exp.startDate)}</div>
                      <div className={styles.meta}>{exp.city || exp.address || ""}</div>
                      <div className={styles.meta}>
                        {t("hosted_experiences_participants_label")} {participantsCount}
                      </div>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          disabled={singleActionBusy}
                          onClick={() => onDeleteSingle(exp._id)}
                        >
                          {singleActionBusy ? t("common_loading") : t("hosted_experiences_delete_slot")}
                        </button>
                        {exp.scheduleGroupId ? (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            disabled={seriesActionBusy}
                            onClick={() => onDeleteSeries(exp.scheduleGroupId as string)}
                          >
                            {seriesActionBusy ? t("common_loading") : t("hosted_experiences_delete_series")}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyInline}>{t("hosted_experiences_upcoming_empty")}</div>
            )}
          </section>

          <section className={styles.section}>
            <h2>{t("hosted_experiences_completed")}</h2>
            {completedItems.length ? (
              <div className={styles.list}>
                {completedItems.map((exp) => {
                  const participantsCount = getParticipantsCount(exp);
                  const statusLabel =
                    participantsCount === 0
                      ? t("hosted_experiences_status_no_participants")
                      : t("hosted_experiences_status_completed");
                  return (
                    <div key={exp._id} className={styles.card}>
                      <div className={styles.title}>{exp.title || t("hosted_experiences_untitled")}</div>
                      <div className={styles.meta}>{formatDateTime(exp.startsAt || exp.startDate)}</div>
                      <div className={styles.meta}>{exp.city || exp.address || ""}</div>
                      <div className={styles.meta}>
                        {t("hosted_experiences_participants_label")} {participantsCount}
                      </div>
                      <div className={styles.status}>{statusLabel}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyInline}>{t("hosted_experiences_completed_empty")}</div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
