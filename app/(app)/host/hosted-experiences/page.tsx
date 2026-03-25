"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
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
  isSeries?: boolean;
  seriesId?: string | null;
  seriesSlotsCount?: number;
  seriesAvailableSlots?: number;
  seriesNextStartsAt?: string | null;
  pricingMode?: "PER_PERSON" | "PER_GROUP" | string;
  groupPackageSize?: number | null;
  price?: number;
  currencyCode?: string;
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
    const raw = exp.seriesNextStartsAt || exp.endsAt || exp.endDate || exp.startsAt || exp.startDate;
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

  const onSingleAction = async (experienceId: string, hasBookings: boolean) => {
    const ok = window.confirm(
      hasBookings ? t("hosted_experiences_cancel_confirm_experience") : t("hosted_experiences_delete_confirm_experience")
    );
    if (!ok) return;
    setFeedback(null);
    setBusyAction(`slot:${experienceId}`);
    try {
      if (hasBookings) {
        await apiPost(`/experiences/${experienceId}/cancel`, {});
        setFeedback({ type: "success", text: t("hosted_experiences_cancel_experience_success") });
      } else {
        await apiDelete(`/experiences/${experienceId}`);
        setFeedback({ type: "success", text: t("hosted_experiences_delete_experience_success") });
      }
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
                  const seriesKey = exp.scheduleGroupId || exp.seriesId || "";
                  const seriesActionBusy = busyAction === `series:${seriesKey}`;
                  const singleActionBusy = busyAction === `slot:${exp._id}`;
                  const isSeries = !!(exp.isSeries || exp.scheduleGroupId || exp.seriesId);
                  const hasBookings = participantsCount > 0;
                  const isCancelled = String(exp.status || "").toLowerCase() === "cancelled";
                  const canEdit = !isSeries && !isCancelled;
                  const startsAtValue = exp.seriesNextStartsAt || exp.startsAt || exp.startDate;
                  const pricingMode = String(exp.pricingMode || "").toUpperCase() === "PER_GROUP" ? "PER_GROUP" : "PER_PERSON";
                  const packageSize = Math.max(1, Number(exp.groupPackageSize) || Number(exp.maxParticipants) || 1);
                  const priceLabel =
                    exp.price && Number(exp.price) > 0
                      ? pricingMode === "PER_GROUP"
                        ? lang === "en"
                          ? `${exp.price} ${exp.currencyCode || "RON"} / group (${packageSize})`
                          : `${exp.price} ${exp.currencyCode || "RON"} / grup (${packageSize})`
                        : `${exp.price} ${exp.currencyCode || "RON"}`
                      : t("experiences_free");
                  return (
                    <div key={exp._id} className={styles.card}>
                      <div className={styles.title}>{exp.title || t("hosted_experiences_untitled")}</div>
                      <div className={styles.meta}>{formatDateTime(startsAtValue || undefined)}</div>
                      <div className={styles.meta}>{exp.city || exp.address || ""}</div>
                      <div className={styles.meta}>{priceLabel}</div>
                      {isSeries ? (
                        <div className={styles.meta}>
                          {lang === "en"
                            ? `Series slots: ${exp.seriesSlotsCount || 0} · available now: ${exp.seriesAvailableSlots || 0}`
                            : `Sloturi serie: ${exp.seriesSlotsCount || 0} · disponibile acum: ${exp.seriesAvailableSlots || 0}`}
                        </div>
                      ) : null}
                      <div className={styles.meta}>
                        {t("hosted_experiences_participants_label")} {participantsCount}
                      </div>
                      <div className={styles.actions}>
                        {isSeries ? (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            disabled={seriesActionBusy || !seriesKey}
                            onClick={() => {
                              if (seriesKey) onDeleteSeries(seriesKey);
                            }}
                          >
                            {seriesActionBusy ? t("common_loading") : t("hosted_experiences_delete_series")}
                          </button>
                        ) : (
                          <>
                            {canEdit ? (
                              <Link className={styles.actionBtn} href={`/host/create-experience?edit=${exp._id}`}>
                                {t("hosted_experiences_edit")}
                              </Link>
                            ) : null}
                            {!isCancelled ? (
                              <button
                                type="button"
                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                disabled={singleActionBusy}
                                onClick={() => onSingleAction(exp._id, hasBookings)}
                              >
                                {singleActionBusy
                                  ? t("common_loading")
                                  : hasBookings
                                    ? t("hosted_experiences_cancel_experience")
                                    : t("hosted_experiences_delete_experience")}
                              </button>
                            ) : null}
                          </>
                        )}
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
                  const startsAtValue = exp.seriesNextStartsAt || exp.startsAt || exp.startDate;
                  return (
                    <div key={exp._id} className={styles.card}>
                      <div className={styles.title}>{exp.title || t("hosted_experiences_untitled")}</div>
                      <div className={styles.meta}>{formatDateTime(startsAtValue || undefined)}</div>
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
