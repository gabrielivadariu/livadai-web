"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { buildCoverObjectPosition } from "@/lib/cover-focus";
import { useLang } from "@/context/lang-context";
import { useAuth } from "@/context/auth-context";
import { useT } from "@/lib/i18n";
import styles from "./experiences.module.css";

const EXPERIENCE_CREATED_KEY = "livadai-experience-created";

type Experience = {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  city?: string;
  country?: string;
  address?: string;
  price?: number;
  currencyCode?: string;
  rating_avg?: number;
  coverImageUrl?: string;
  coverFocusX?: number;
  coverFocusY?: number;
  category?: string;
  languages?: string[];
  startsAt?: string;
  startDate?: string;
  startTime?: string;
  durationMinutes?: number;
  activityType?: string;
  environment?: "INDOOR" | "OUTDOOR" | "BOTH" | string;
  maxParticipants?: number;
  remainingSpots?: number;
  availableSpots?: number;
  pricingMode?: "PER_PERSON" | "PER_GROUP" | string;
  groupPackageSize?: number | null;
  isSeries?: boolean;
  seriesId?: string | null;
  seriesSlotsCount?: number;
  seriesAvailableSlots?: number;
  seriesNextStartsAt?: string | null;
};

const HERO_LIFE_PATH = "M40 138c60 10 120 10 180 4 80-8 160-10 240-4 52 4 98 4 160-6";

function HeroLifeJourneyArt() {
  return (
    <svg className={styles.heroJourneyArt} viewBox="0 0 640 180" aria-hidden="true">
      <defs>
        <linearGradient id="heroJourneyTone" x1="36" y1="0" x2="610" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#11bfd1" stopOpacity="0.92" />
          <stop offset="48%" stopColor="#37cada" stopOpacity="0.72" />
          <stop offset="78%" stopColor="#dffcff" stopOpacity="0.94" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>
        <radialGradient id="heroJourneySpark" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="48%" stopColor="#dcfbff" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#dcfbff" stopOpacity="0" />
        </radialGradient>
        <filter id="heroJourneyGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className={styles.heroJourneyTraveler}>
        <animate attributeName="opacity" values="0;0.46;0.54;0.5;0.18;0" keyTimes="0;0.06;0.38;0.78;0.94;1" dur="15s" repeatCount="indefinite" />
        <animateMotion dur="15s" repeatCount="indefinite" path={HERO_LIFE_PATH} rotate="auto" />
        <g className={styles.heroJourneyScale}>
          <animateTransform attributeName="transform" additive="sum" type="translate" values="-10 -36; -12 -44; -16 -52; -22 -56" keyTimes="0;0.28;0.66;1" dur="15s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" additive="sum" type="scale" values="0.62;0.78;0.98;1.12" keyTimes="0;0.28;0.66;1" dur="15s" repeatCount="indefinite" />

          <g fill="url(#heroJourneyTone)" stroke="url(#heroJourneyTone)" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
            <g className={styles.heroJourneyStage}>
              <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.2;0.32;1" dur="15s" repeatCount="indefinite" />
              <circle cx="0" cy="-25.5" r="4.8" />
              <path d="M-3.4-20.8c1.2-2.2 3.1-3.3 4.2-3.3 1.3 0 3.2 1.1 4.4 3.3l1.3 6.4-3.4 2.8 1.4 8.8H1l-1.2-5.9h-1.2l-1.4 5.9h-3.5l1.4-8.8-3.2-2.8 1.1-6.4Z" />
              <path d="M-1.8-17.8l-6 7.2" />
              <path d="M2.2-17.8l5.6 6.8" />
              <path d="M-1.8-2.8l-3.9 10.4" />
              <path d="M1.8-2.8l4.6 10.8" />
            </g>

            <g className={styles.heroJourneyStage}>
              <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.16;0.28;0.44;0.56;1" dur="15s" repeatCount="indefinite" />
              <circle cx="0" cy="-27.6" r="4.9" />
              <path d="M4.3-31.6c2.8 0 4.8 2.2 5 4.6-1.3 0-2.6-.5-3.8-1.6" />
              <path d="M-2.9-22.6c1.2-2.5 3.3-3.8 5-3.8 1.8 0 4 1.3 5.2 3.8l1.4 7-2.6 1.8-.5 10.5H2.6l-1.4-7.8h-1.3l-1.8 7.8h-4.1l-.3-11.1-2.3-1.2 1.4-6.9Z" />
              <path d="M-1.4-19.8l-6.4 6.4" />
              <path d="M4.2-18.8l5.8 7" />
              <path d="M-0.8-3.4l-3.2 10.8" />
              <path d="M2.6-3.2l5 10.2" />
            </g>

            <g className={styles.heroJourneyStage}>
              <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.42;0.56;0.76;0.88;1" dur="15s" repeatCount="indefinite" />
              <circle cx="0" cy="-29.2" r="5" />
              <path d="M-4.4-23.2c1.2-2.7 3.7-4.2 5.8-4.2 2.1 0 4.7 1.4 6 4.1l1.2 6-2.7 1.8-.6 12.4 1.4 10.8H2.5L.9 1.2H-.8l-2.3 8.4h-4.4l1.7-12.7-.4-11.2-2.8-1.7 1.2-7.2Z" />
              <path d="M-2.6-21.2l-7 8.2" />
              <path d="M4.7-21.2l6.2 8.1" />
              <path d="M-0.2-3.4l-4.2 11.6" />
              <path d="M2.4-3.4l5.8 9.9" />
            </g>

            <g className={styles.heroJourneyStage} transform="translate(4 0)">
              <animate attributeName="opacity" values="0;0;0;1;1;0" keyTimes="0;0.64;0.76;0.88;0.94;1" dur="15s" repeatCount="indefinite" />
              <circle cx="0" cy="-28.2" r="4.8" />
              <path d="M-2.8-21.8c1.2-2.3 2.9-3.7 4.7-3.7 1.8 0 4.2 1.2 5.3 4.1l1.4 6.4-3 1.6-.6 12.5-1.6 8.8h-4L.7.6h-1.9l-2.5 8.1h-4.2l2.2-11.3-.2-9.6-2.4-2 1.7-7.6Z" />
              <path d="M0.8-20.6c3.9 1.1 6.9 4.1 8 8.2" />
              <path d="M-1.2-0.8l-3.4 8.8" />
              <path d="M2.6-0.6l2.5 8.2" />
              <path d="M8.2-10.6l6.1 18.8" />
            </g>
          </g>

          <g filter="url(#heroJourneyGlow)">
            <circle className={styles.heroJourneyLight} cx="2" cy="-12" r="0">
              <animate attributeName="r" values="0;0;0;1.6;3.8;2.4;0" keyTimes="0;0.84;0.9;0.94;0.97;0.99;1" dur="15s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0;0;0.72;1;0.68;0" keyTimes="0;0.84;0.9;0.94;0.97;0.99;1" dur="15s" repeatCount="indefinite" />
            </circle>
          </g>
        </g>
      </g>
    </svg>
  );
}

const formatSeatsInfo = (item: Experience) => {
  const total = item.maxParticipants || 0;
  const available = item.availableSpots ?? item.remainingSpots ?? item.maxParticipants;
  if (!total || typeof available !== "number") return "";
  const occupied = Math.max(0, total - available);
  return `${occupied}/${total}`;
};

const formatEnvironment = (item: Experience, t: (key: string) => string) => {
  const env = String(item.environment || "").toUpperCase();
  if (env === "INDOOR") return t("environment_indoor");
  if (env === "OUTDOOR") return t("environment_outdoor");
  if (env === "BOTH") return t("environment_both");
  return "";
};

const formatPricing = (item: Experience, lang: string, t: (key: string) => string) => {
  const isFree = !item.price || Number(item.price) <= 0;
  const currency = item.currencyCode || "RON";
  const pricingMode = String(item.pricingMode || "").toUpperCase() === "PER_GROUP" ? "PER_GROUP" : "PER_PERSON";
  const packageSize = Math.max(1, Number(item.groupPackageSize) || Number(item.maxParticipants) || 1);
  if (isFree) {
    if (pricingMode === "PER_GROUP") {
      return lang === "en" ? `${t("experiences_free")} / group` : `${t("experiences_free")} / grup`;
    }
    return t("experiences_free");
  }
  if (pricingMode === "PER_GROUP") {
    return lang === "en"
      ? `${item.price || 0} ${currency} / group (${packageSize})`
      : `${item.price || 0} ${currency} / grup (${packageSize})`;
  }
  return `${item.price || 0} ${currency}`;
};

const normalizeTimeValue = (value?: string) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = ampmMatch[2];
    const marker = ampmMatch[3].toUpperCase();
    if (marker === "PM" && hours < 12) hours += 12;
    if (marker === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  const hhmmMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmmMatch) {
    return `${String(Number(hhmmMatch[1])).padStart(2, "0")}:${hhmmMatch[2]}`;
  }

  return raw;
};

const formatStartTimeLabel = (item: Experience, lang: string) => {
  const start = item.seriesNextStartsAt || item.startsAt || item.startDate;
  if (start) {
    const date = new Date(start);
    if (!Number.isNaN(date.getTime())) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      if (hours !== 0 || minutes !== 0) {
        return date.toLocaleTimeString(lang === "en" ? "en-US" : "ro-RO", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
    }
  }
  return normalizeTimeValue(item.startTime);
};

function ExperiencesPageContent() {
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const t = useT();
  const { user } = useAuth();
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const search = searchParams?.get("q") || "";
  const [showCreated, setShowCreated] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem(EXPERIENCE_CREATED_KEY));
  });

  useEffect(() => {
    let active = true;
    apiGet<Experience[]>("/experiences")
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

  useEffect(() => {
    if (!showCreated) return;
    window.localStorage.removeItem(EXPERIENCE_CREATED_KEY);
  }, [showCreated]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((it) => {
      const title = (it.title || "").toLowerCase();
      const address = (it.address || "").toLowerCase();
      const desc = (it.description || "").toLowerCase();
      return title.includes(term) || address.includes(term) || desc.includes(term);
    });
  }, [items, search]);

  useEffect(() => {
    if (loading) return;
    const term = search.trim();
    if (!term) return;

    const resultIds = filtered.slice(0, 30).map((item) => item._id);
    trackEvent({
      eventName: "search_initiated",
      searchQuery: term,
      searchResultsCount: filtered.length,
      resultIds,
    });
    trackEvent({
      eventName: "search_results_viewed",
      searchQuery: term,
      searchResultsCount: filtered.length,
      resultIds,
    });
    if (!filtered.length) {
      trackEvent({
        eventName: "search_no_results",
        searchQuery: term,
        searchResultsCount: 0,
      });
    }
  }, [filtered, loading, search]);

  const heroSupportPoints = [
    t("hero_support_point_1"),
    t("hero_support_point_2"),
    t("hero_support_point_3"),
  ];

  return (
    <div className={styles.page}>
      {showCreated ? (
        <div className={styles.banner}>
          <div>
            <strong>{t("experience_created_title")}</strong>
            <div>{t("experience_created_text")}</div>
          </div>
          <button className={styles.bannerClose} type="button" onClick={() => setShowCreated(false)}>
            ✕
          </button>
        </div>
      ) : null}
      <section className={styles.hero}>
        <svg className={styles.heroIllustration} viewBox="0 0 640 180" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d={HERO_LIFE_PATH} />
          </g>
        </svg>
        <HeroLifeJourneyArt />
        <div className={styles.heroText}>
          <div className={`${styles.heroBadge} ${styles.fadeIn}`}>{t("hero_badge")}</div>
          <h1 className={`${styles.heroTitle} ${styles.fadeIn}`}>{t("hero_title")}</h1>
          <p className={`${styles.heroSubtitle} ${styles.fadeIn} ${styles.delay1}`}>
            {t("hero_subtitle_line1")}
            <br />
            {t("hero_subtitle_line2")}
          </p>
          <div className={`${styles.heroActions} ${styles.fadeIn} ${styles.delay2}`}>
            <button
              className={`button ${styles.heroCta}`}
              type="button"
              onClick={() => {
                const list = document.getElementById("experiences-list");
                if (list) list.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {t("hero_cta_primary")}
            </button>
            <Link href="/how-it-works" className={`button secondary ${styles.heroSecondaryCta}`}>
              {t("hero_cta_secondary")}
            </Link>
          </div>
          <div className={styles.heroMicrocopy}>{t("hero_cta_microcopy")}</div>
        </div>
        <div className={`${styles.heroVisual} ${styles.fadeIn} ${styles.delay1}`}>
          <div className={styles.supportCard}>
            <div className={styles.supportBadge}>{t("hero_support_badge")}</div>
            <div className={styles.supportTitle}>{t("hero_support_title")}</div>
            <div className={styles.supportBody}>{t("hero_support_body")}</div>
            <div className={styles.supportPoints}>
              {heroSupportPoints.map((point) => (
                <span key={point} className={styles.supportPoint}>
                  {point}
                </span>
              ))}
            </div>
            <div className={styles.supportImpact}>{t("hero_support_impact")}</div>
          </div>
        </div>
      </section>
      {!user ? <div className={styles.guestHint}>{t("guest_list_hint")}</div> : null}

      {loading ? (
        <div className="muted">{t("common_loading_experiences")}</div>
      ) : filtered.length ? (
        <div className={styles.grid} id="experiences-list">
          {filtered.map((item, index) => {
            const priceText = formatPricing(item, lang, t);
            const start = item.seriesNextStartsAt || item.startsAt || item.startDate;
            const dateLabel = start ? new Date(start).toLocaleDateString(lang === "en" ? "en-US" : "ro-RO", { day: "numeric", month: "short" }) : "";
            const timeLabel = formatStartTimeLabel(item, lang);
            const seats = formatSeatsInfo(item);
            const environmentLabel = formatEnvironment(item, t);
            return (
              <Link
                key={item._id}
                href={`/experiences/${item._id}`}
                className={styles.card}
                onClick={() =>
                  trackEvent({
                    eventName: "experience_result_clicked",
                    experienceId: item._id,
                    searchQuery: search.trim() || undefined,
                    searchResultsCount: filtered.length,
                    resultIds: filtered.slice(0, 30).map((row) => row._id),
                    properties: {
                      position: index + 1,
                      title: item.title,
                    },
                  })
                }
              >
                {item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt={item.title} className={styles.cover} style={buildCoverObjectPosition(item)} />
                ) : (
                  <div className={styles.coverPlaceholder} />
                )}
                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <div>
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                      <div className={styles.cardLocation}>
                        {item.city || ""} {item.country || item.address || ""}
                      </div>
                      {item.shortDescription ? <div className={styles.cardDesc}>{item.shortDescription}</div> : null}
                    </div>
                    <div className={styles.priceBadge}>
                      {priceText}
                    </div>
                  </div>
                  <div className={styles.cardMeta}>
                    {dateLabel ? <span className={styles.metaPill}>📅 {dateLabel}</span> : null}
                    {timeLabel ? <span className={styles.metaPill}>🕒 {timeLabel}</span> : null}
                    {item.languages?.length ? <span className={styles.metaPill}>🗣 {item.languages.slice(0, 2).join(" · ")}</span> : null}
                    {environmentLabel ? <span className={styles.metaPill}>🍃 {environmentLabel}</span> : null}
                    {seats ? <span className={styles.metaPill}>👥 {seats}</span> : null}
                    {item.rating_avg ? <span className={styles.rating}>⭐ {Number(item.rating_avg).toFixed(1)}</span> : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✨</div>
          <div className={styles.emptyTitle}>
            {search.trim() ? t("experiences_search_empty_title") : t("experiences_empty_title")}
          </div>
          <div className={styles.emptyText}>
            {search.trim() ? t("experiences_search_empty_text") : t("experiences_empty_text")}
          </div>
          <button className="button" type="button">
            {t("experiences_view_map")}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ExperiencesPage() {
  return (
    <Suspense fallback={<div className="muted">Loading...</div>}>
      <ExperiencesPageContent />
    </Suspense>
  );
}
