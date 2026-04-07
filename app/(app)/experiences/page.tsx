"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { buildCoverObjectPosition } from "@/lib/cover-focus";
import { getOptimizedMediaUrl } from "@/lib/media-url";
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

type HeroSlide = {
  headline: string;
  imageUrl: string;
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

function HeroProofItem({ icon, children }: { icon: string; children: string }) {
  return (
    <span className={styles.heroProofItem}>
      <span aria-hidden="true">{icon}</span>
      <span>{children}</span>
    </span>
  );
}

function ExperiencesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const t = useT();
  const { user } = useAuth();
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const search = searchParams?.get("q") || "";
  const [heroSearch, setHeroSearch] = useState(search);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
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

  useEffect(() => {
    setHeroSearch(search);
  }, [search]);

  const heroSlides = useMemo<HeroSlide[]>(
    () => [
      {
        headline: t("hero_slide_1"),
        imageUrl:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80",
      },
      {
        headline: t("hero_slide_2"),
        imageUrl:
          "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=2000&q=80",
      },
      {
        headline: t("hero_slide_3"),
        imageUrl:
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80",
      },
      {
        headline: t("hero_slide_4"),
        imageUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80",
      },
      {
        headline: t("hero_slide_5"),
        imageUrl:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80",
      },
    ],
    [t]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

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
    { icon: "🏡", label: t("hero_proof_1") },
    { icon: "✨", label: t("hero_proof_2") },
    { icon: "🇷🇴", label: t("hero_proof_3") },
  ];

  const featuredExperienceId = useMemo(() => {
    const featured =
      items.find((item) =>
        [item.title, item.shortDescription, item.description, item.category]
          .join(" ")
          .toLowerCase()
          .match(/tab[aă]r|buc[aă]t|gastr|vin|atelier|sat|tradi|ceramic|foc|drume/)
      ) || items[0];
    return featured?._id || "";
  }, [items]);

  const displayedItems = useMemo(() => {
    if (!featuredExperienceId || search.trim()) return filtered;
    const featuredIndex = filtered.findIndex((item) => item._id === featuredExperienceId);
    if (featuredIndex <= 0) return filtered;
    const next = filtered.slice();
    const [featured] = next.splice(featuredIndex, 1);
    return [featured, ...next];
  }, [featuredExperienceId, filtered, search]);

  const scrollToExperiences = () => {
    const list = document.getElementById("experiences-list");
    if (list) list.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const applySearch = (term: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    const normalized = term.trim();
    if (normalized) {
      params.set("q", normalized);
    } else {
      params.delete("q");
    }
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(nextUrl);
    window.setTimeout(() => {
      scrollToExperiences();
    }, 120);
  };

  const handleHeroSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackEvent({
      eventName: "cta_clicked",
      properties: {
        area: "hero_search",
        cta: "search_submit",
      },
    });
    applySearch(heroSearch);
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
        <div className={styles.heroSlides} aria-hidden="true">
          {heroSlides.map((slide, index) => (
            <div
              key={`${slide.headline}-${index}`}
              className={`${styles.heroSlide} ${index === activeHeroSlide ? styles.heroSlideActive : ""}`}
              style={{ backgroundImage: `url(${slide.imageUrl})` }}
            />
          ))}
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <div className={styles.heroBrand}>
              <span className={styles.heroBrandLogo}>LIVADAI</span>
              <span className={styles.heroBrandTagline}>{t("hero_brand_tagline")}</span>
          </div>
          <div className={styles.heroContent}>
            <div className={styles.heroHeadingStack}>
              <h1 key={`${lang}-${activeHeroSlide}`} className={styles.heroTitle}>
                {heroSlides[activeHeroSlide]?.headline}
              </h1>
            </div>
            <p className={styles.heroSubtitle}>{t("hero_subtitle")}</p>
            <form className={styles.heroSearchForm} onSubmit={handleHeroSearchSubmit}>
              <div className={styles.heroSearchShell}>
                <span className={styles.heroSearchIcon}>⌕</span>
                <input
                  value={heroSearch}
                  onChange={(event) => setHeroSearch(event.target.value)}
                  placeholder={t("hero_search_placeholder")}
                  className={styles.heroSearchInput}
                  aria-label={t("hero_search_placeholder")}
                />
                <button className={styles.heroSearchButton} type="submit">
                  {t("hero_search_cta")}
                </button>
              </div>
            </form>
            <div className={styles.heroProofRow}>
              {heroProofItems.map((item) => (
                <HeroProofItem key={item.label} icon={item.icon}>{item.label}</HeroProofItem>
              ))}
            </div>
            <div className={styles.heroLiveBadge}>{t("hero_live_label")}</div>
          </div>
        </div>
      </section>
      {!user ? <div className={styles.guestHint}>{t("guest_list_hint")}</div> : null}

      {loading ? (
        <div className="muted">{t("common_loading_experiences")}</div>
      ) : displayedItems.length ? (
        <div className={styles.grid} id="experiences-list">
          {displayedItems.map((item, index) => {
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
                    searchResultsCount: displayedItems.length,
                    resultIds: displayedItems.slice(0, 30).map((row) => row._id),
                    properties: {
                      position: index + 1,
                      title: item.title,
                    },
                  })
                }
              >
                {item.coverImageUrl ? (
                  <img
                    src={getOptimizedMediaUrl(item.coverImageUrl)}
                    alt={item.title}
                    className={styles.cover}
                    style={buildCoverObjectPosition(item)}
                  />
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
