"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./activities.module.css";

type Booking = {
  _id: string;
  status?: string;
  experience?: { _id?: string; title?: string } | string;
  date?: string;
  reviewEligible?: boolean;
  reviewExists?: boolean;
  host?: { _id?: string } | string;
};

export default function MyActivitiesPage() {
  const { lang } = useLang();
  const t = useT();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState<Record<string, { rating: number | null; comment: string }>>({});
  const [submitBusy, setSubmitBusy] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiGet<Booking[]>("/bookings/me")
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
  }, []);

  const updateForm = (bookingId: string, update: Partial<{ rating: number | null; comment: string }>) => {
    setReviewForm((prev) => {
      const current = prev[bookingId] || { rating: null, comment: "" };
      return {
        ...prev,
        [bookingId]: { ...current, ...update },
      };
    });
  };

  const submitReview = async (booking: Booking) => {
    if (!booking.reviewEligible || !booking.experience || !booking.host) return;
    const exp = booking.experience;
    const expId = typeof exp === "string" ? exp : exp?._id;
    const hostId = typeof booking.host === "string" ? booking.host : booking.host?._id;
    if (!expId || !hostId) return;
    const form = reviewForm[booking._id] || { rating: 5, comment: "" };
    if (!form.rating) return;
    setSubmitBusy(booking._id);
    setSubmitError((prev) => ({ ...prev, [booking._id]: "" }));
    try {
      await apiPost(`/hosts/${hostId}/reviews`, {
        experienceId: expId,
        bookingId: booking._id,
        rating: form.rating,
        comment: form.comment,
      });
      setToastMessage(t("review_saved"));
      setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      setItems((prev) =>
        prev.map((b) => (b._id === booking._id ? { ...b, reviewEligible: false, reviewExists: true } : b))
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || t("review_failed");
      setSubmitError((prev) => ({ ...prev, [booking._id]: msg }));
    } finally {
      setSubmitBusy(null);
    }
  };

  if (loading) return <div className="muted">{t("common_loading_activity")}</div>;

  return (
    <div className={styles.list}>
      {toastMessage ? <div className={styles.toast}>{toastMessage}</div> : null}
      {items.length ? (
        items.map((b) => {
          const exp = b.experience;
          const expId = typeof exp === "string" ? exp : exp?._id;
          const title = typeof exp === "string" ? t("common_experience") : exp?.title || t("common_experience");
          const dateLabel = b.date ? new Date(b.date).toLocaleString(lang === "en" ? "en-US" : "ro-RO") : "";
          const href = expId ? `/experiences/${expId}?bookingId=${b._id}` : "";
          const row = (
            <div className={`${styles.row} ${expId ? styles.rowClickable : ""}`}>
              <div className={styles.title}>{title}</div>
              <div className={styles.meta}>{dateLabel}</div>
              <div className={styles.status}>{b.status || "STATUS"}</div>
            </div>
          );
          return (
            <div key={b._id} className={styles.block}>
              {expId ? (
                <Link href={href} className={styles.rowLink}>
                  {row}
                </Link>
              ) : (
                row
              )}
              {b.reviewEligible ? (
                <div className={styles.reviewCard}>
                  <div className={styles.reviewTitle}>{t("leave_review")}</div>
                  <div className={styles.reviewRow}>
                    <label className={styles.reviewLabel}>{t("review_rating_label")}</label>
                    <input
                      className={styles.reviewInput}
                      type="number"
                      min={1}
                      max={5}
                      value={reviewForm[b._id]?.rating ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (!raw) {
                          updateForm(b._id, { rating: null });
                          return;
                        }
                        updateForm(b._id, { rating: Number(raw) });
                      }}
                    />
                  </div>
                  <textarea
                    className={styles.reviewTextarea}
                    placeholder={t("review_comment_placeholder")}
                    value={reviewForm[b._id]?.comment ?? ""}
                    onChange={(e) => updateForm(b._id, { comment: e.target.value })}
                  />
                  {submitError[b._id] ? <div className={styles.reviewError}>{submitError[b._id]}</div> : null}
                  <button
                    className={styles.reviewButton}
                    type="button"
                    onClick={() => submitReview(b)}
                    disabled={submitBusy === b._id || !reviewForm[b._id]?.rating}
                  >
                    {t("review_submit")}
                  </button>
                </div>
              ) : b.status === "COMPLETED" && !b.reviewExists ? (
                <div className={styles.reviewHint}>{t("review_hint_later")}</div>
              ) : null}
            </div>
          );
        })
      ) : (
        <div className="muted">{t("my_activities_empty")}</div>
      )}
    </div>
  );
}
