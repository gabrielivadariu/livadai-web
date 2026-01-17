"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./experience-detail.module.css";

type Experience = {
  _id: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  city?: string;
  country?: string;
  address?: string;
  price?: number;
  currencyCode?: string;
  rating_avg?: number;
  coverImageUrl?: string;
  images?: string[];
  languages?: string[];
  startsAt?: string;
  startDate?: string;
  durationMinutes?: number;
  environment?: string;
  activityType?: string;
  host?: { name?: string };
};

export default function ExperienceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { lang } = useLang();
  const t = useT();
  const [item, setItem] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiGet<Experience>(`/experiences/${id}`)
      .then((data) => {
        if (active) setItem(data);
      })
      .catch(() => {
        if (active) setItem(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const onBook = async () => {
    if (!item?._id) return;
    setBooking(true);
    setError("");
    try {
      const res = await apiPost<{ checkoutUrl?: string }>("/stripe/checkout", {
        experienceId: item._id,
        quantity: 1,
      });
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        setError(t("experience_payment_error"));
      }
    } catch (err) {
      setError((err as Error).message || t("experience_payment_error"));
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <div className="muted">{t("common_loading_experiences")}</div>;
  }

  if (!item) {
    return (
      <div className={styles.empty}>
        <h2>{t("experience_missing_title")}</h2>
        <button className="button" type="button" onClick={() => router.replace("/experiences")}>
          {t("experience_back")}
        </button>
      </div>
    );
  }

  const start = item.startsAt || item.startDate;
  const dateLabel = start ? new Date(start).toLocaleDateString(lang === "en" ? "en-US" : "ro-RO", { day: "numeric", month: "long", year: "numeric" }) : "";
  const priceText = !item.price || Number(item.price) <= 0 ? t("experiences_free") : `${item.price} ${item.currencyCode || "RON"}`;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.media}>
          {item.coverImageUrl ? (
            <img src={item.coverImageUrl} alt={item.title} />
          ) : (
            <div className={styles.coverPlaceholder} />
          )}
          <div className={styles.gallery}>
            {(item.images || []).slice(0, 4).map((img) => (
              <img key={img} src={img} alt="gallery" />
            ))}
          </div>
        </div>
        <div className={styles.summary}>
          <div className={styles.kicker}>{t("experience_kicker")}</div>
          <h1>{item.title}</h1>
          <p className={styles.subtitle}>{item.shortDescription || item.description}</p>
          <div className={styles.metaGrid}>
            <div>
              <span>{t("experience_location")}</span>
              <strong>{item.city || ""} {item.country || item.address || ""}</strong>
            </div>
            <div>
              <span>{t("experience_date")}</span>
              <strong>{dateLabel || t("experience_flexible")}</strong>
            </div>
            <div>
              <span>{t("experience_duration")}</span>
              <strong>{item.durationMinutes ? `${item.durationMinutes} ${t("experience_minutes")}` : "—"}</strong>
            </div>
            <div>
              <span>{t("experience_type")}</span>
              <strong>{item.activityType || "INDIVIDUAL"}</strong>
            </div>
          </div>
          <div className={styles.priceRow}>
            <div className={styles.price}>{priceText}</div>
            {item.rating_avg ? <div className={styles.rating}>⭐ {Number(item.rating_avg).toFixed(1)}</div> : null}
          </div>
          {error ? <div className={styles.error}>{error}</div> : null}
          <button className="button" type="button" onClick={onBook} disabled={booking}>
            {booking ? t("experience_booking") : t("experience_book")}
          </button>
        </div>
      </div>

      <div className={styles.details}>
        <section>
          <h2>{t("experience_about")}</h2>
          <p>{item.description || item.shortDescription || t("experience_details_fallback")}</p>
        </section>
        <section>
          <h2>{t("experience_host")}</h2>
          <p>{item.host?.name || t("experience_host_fallback")}</p>
        </section>
        <section>
          <h2>{t("experience_languages")}</h2>
          <div className={styles.badges}>
            {(item.languages || []).length ? (item.languages || []).map((lang) => (
              <span key={lang} className={styles.badge}>{lang.toUpperCase()}</span>
            )) : <span className={styles.badge}>RO</span>}
          </div>
        </section>
      </div>
    </div>
  );
}
