"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
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

function HeroProofItem({ children }: { children: ReactNode }) {
  return <span className={styles.heroProofItem}>{children}</span>;
}

function HeroVisualCard({
  item,
  chip,
  className,
}: {
  item?: Experience;
  chip: string;
  className?: string;
}) {
  const title = item?.title || chip;
  const location = [item?.city, item?.country].filter(Boolean).join(", ");

  return (
    <div className={`${styles.heroVisualCard} ${className || ""}`}>
      {item?.coverImageUrl ? (
        <img
          src={item.coverImageUrl}
          alt={title}
          className={styles.heroVisualImage}
          style={buildCoverObjectPosition(item)}
        />
      ) : (
        <div className={styles.heroVisualPlaceholder} />
      )}
      <div className={styles.heroVisualOverlay} />
      <span className={styles.heroVisualChip}>{chip}</span>
      <div className={styles.heroVisualMeta}>
        <strong>{title}</strong>
        {location ? <span>{location}</span> : null}
      </div>
    </div>
  );
}

function HeroVisualCommentCard({
  item,
  className,
  label,
}: {
  item?: Experience;
  className?: string;
  label: string;
}) {
  const title = item?.title || label;
  const snippet = item?.shortDescription || item?.description || label;
  const trimmedSnippet = snippet.trim().replace(/\s+/g, " ");
  const preview = trimmedSnippet.length > 120 ? `${trimmedSnippet.slice(0, 117).trim()}...` : trimmedSnippet;
  const location = [item?.city, item?.country].filter(Boolean).join(", ");
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className={`${styles.heroVisualCommentCard} ${className || ""}`}>
      <span className={styles.heroVisualCommentLabel}>{label}</span>
      <div className={styles.heroVisualCommentBody}>
        <div className={styles.heroVisualCommentIcon}>💬</div>
        <p>{preview}</p>
      </div>
      <div className={styles.heroVisualCommentMeta}>
        <span className={styles.heroVisualCommentAvatar}>{initials || "L"}</span>
        <div>
          <strong>{title}</strong>
          {location ? <span>{location}</span> : null}
        </div>
      </div>
    </div>
  );
}

function HeroVisualMomentCard({
  item,
  chip,
  className,
  label,
}: {
  item?: Experience;
  chip: string;
  className?: string;
  label: string;
}) {
  const title = item?.title || chip;
  const location = [item?.city, item?.country].filter(Boolean).join(", ");

  return (
    <div className={`${styles.heroVisualMomentCard} ${className || ""}`}>
      <div className={styles.heroVisualMomentMedia}>
        {item?.coverImageUrl ? (
          <img
            src={item.coverImageUrl}
            alt={title}
            className={styles.heroVisualImage}
            style={buildCoverObjectPosition(item)}
          />
        ) : (
          <div className={styles.heroVisualPlaceholder} />
        )}
        <div className={styles.heroVisualMomentOverlay} />
        <span className={styles.heroVisualMomentPlay}>▶</span>
        <span className={styles.heroVisualMomentChip}>{chip}</span>
      </div>
      <div className={styles.heroVisualMomentMeta}>
        <span>{label}</span>
        <strong>{title}</strong>
        {location ? <small>{location}</small> : null}
      </div>
    </div>
  );
}

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

  const searchFiltered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((it) => {
      const title = (it.title || "").toLowerCase();
      const address = (it.address || "").toLowerCase();
      const desc = (it.description || "").toLowerCase();
      return title.includes(term) || address.includes(term) || desc.includes(term);
    });
  }, [items, search]);

  const filtered = useMemo(() => searchFiltered, [searchFiltered]);

  useEffect(() => {
    if (loading) return;
    const term = search.trim();
    if (!term) return;

    const resultIds = searchFiltered.slice(0, 30).map((item) => item._id);
    trackEvent({
      eventName: "search_initiated",
      searchQuery: term,
      searchResultsCount: searchFiltered.length,
      resultIds,
    });
    trackEvent({
      eventName: "search_results_viewed",
      searchQuery: term,
      searchResultsCount: searchFiltered.length,
      resultIds,
    });
    if (!searchFiltered.length) {
      trackEvent({
        eventName: "search_no_results",
        searchQuery: term,
        searchResultsCount: 0,
      });
    }
  }, [loading, search, searchFiltered]);

  const heroProofItems = [
    t("hero_proof_1"),
    t("hero_proof_2"),
    t("hero_proof_3"),
    t("hero_proof_4"),
  ];

  const heroVisualItems = useMemo(() => {
    const seen = new Set<string>();
    return items
      .filter((item) => item.coverImageUrl)
      .filter((item) => {
        const signature = `${item.city || ""}-${item.title || ""}`;
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
      })
      .slice(0, 3);
  }, [items]);

  const scrollToExperiences = () => {
    const list = document.getElementById("experiences-list");
    if (list) list.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
        <div className={styles.heroText}>
          <div className={`${styles.heroBadge} ${styles.fadeIn}`}>{t("hero_badge")}</div>
          <h1 className={`${styles.heroTitle} ${styles.fadeIn}`}>{t("hero_title")}</h1>
          <p className={`${styles.heroSubtitle} ${styles.fadeIn} ${styles.delay1}`}>
            {t("hero_subtitle_line1")}
            {" "}
            {t("hero_subtitle_line2")}
          </p>
          <div className={`${styles.heroActions} ${styles.fadeIn} ${styles.delay2}`}>
            <button
              className={`button ${styles.heroCta}`}
              type="button"
              onClick={() => {
                trackEvent({
                  eventName: "cta_clicked",
                  properties: {
                    area: "experiences_hero",
                    cta: "primary",
                  },
                });
                scrollToExperiences();
              }}
            >
              {t("hero_cta_primary")}
            </button>
            <Link href="/how-it-works" className={styles.heroSecondaryLink}>
              {t("hero_cta_secondary")}
            </Link>
          </div>
          <div className={styles.heroProofRow}>
            {heroProofItems.map((item) => (
              <HeroProofItem key={item}>{item}</HeroProofItem>
            ))}
          </div>
          <div className={styles.heroMicrocopy}>{t("hero_cta_microcopy")}</div>
        </div>
        <div className={`${styles.heroVisual} ${styles.fadeIn} ${styles.delay1}`}>
          <div className={styles.heroVisualStage}>
            <HeroVisualCard item={heroVisualItems[0]} chip={t("hero_visual_chip_1")} className={styles.heroVisualPrimary} />
            <HeroVisualMomentCard
              item={heroVisualItems[1] || heroVisualItems[0]}
              chip={t("hero_visual_chip_2")}
              label={t("hero_visual_story_label")}
              className={styles.heroVisualSecondary}
            />
            <HeroVisualCommentCard
              item={heroVisualItems[2] || heroVisualItems[1] || heroVisualItems[0]}
              label={t("hero_visual_comment_label")}
              className={styles.heroVisualTertiary}
            />
            <div className={styles.heroVisualBadge}>{t("hero_visual_badge")}</div>
            <div className={styles.heroVisualSupport}>{t("hero_visual_support")}</div>
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
