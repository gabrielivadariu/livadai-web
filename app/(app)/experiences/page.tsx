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

function HeroProofItem({
  icon,
  children,
  live = false,
}: {
  icon?: string;
  children: string;
  live?: boolean;
}) {
  return (
    <span className={`${styles.heroProofItem} ${live ? styles.heroProofLiveItem : ""}`.trim()}>
      {live ? (
        <span className={styles.heroProofLiveDot} aria-hidden="true" />
      ) : icon ? (
        <span aria-hidden="true">{icon}</span>
      ) : null}
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

  const heroHeadlines = useMemo<string[]>(
    () => [
      t("hero_slide_1"),
      t("hero_slide_2"),
      t("hero_slide_3"),
      t("hero_slide_4"),
      t("hero_slide_5"),
    ],
    [t]
  );

  const heroSlides = useMemo<Array<{ url: string; position?: string }>>(
    () => [
      { url: "/hero/fain-camp-hero.png", position: "center top" },
      { url: "/hero/fain-wayfinding-sign.jpg" },
      { url: "/hero/fain-lounge-pandas.jpg" },
      { url: "/hero/fain-dreamcatcher-camp.jpg" },
      { url: "/hero/fain-campfire-night.jpg" },
      {
        url: "https://plus.unsplash.com/premium_photo-1677621682631-9bfdcffaacb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzc1NjY1ODU3fA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        url: "https://images.unsplash.com/photo-1646282994817-1f1949198d2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzc1NjY1ODU3fA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        url: "https://images.unsplash.com/photo-1759719441268-7d807f21a4ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzc1NjY1ODU4fA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        url: "https://images.unsplash.com/photo-1775403908748-8557013c8e1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzc1NjY1ODU4fA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        url: "https://plus.unsplash.com/premium_photo-1661425600674-39ea92c9d667?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzc1NjY1ODU5fA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        url: "https://plus.unsplash.com/premium_photo-1671282997395-9d912dc2133f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzc1NjY1ODU5fA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        url: "https://images.unsplash.com/photo-1771523350538-29baf74f710c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzc1NjY1ODYwfA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        url: "https://images.unsplash.com/photo-1739713894951-6ab5f864e4cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzc1NjY1ODYwfA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        url: "https://images.unsplash.com/photo-1739713894545-8bc8babbb3fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzc1NjY1ODYwfA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        url: "https://images.unsplash.com/photo-1739713894536-6afdca5c267b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzc1NjY1ODYxfA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        url: "https://images.unsplash.com/photo-1737564483280-15481c31608a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzc1NjY1ODYxfA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        url: "https://images.unsplash.com/photo-1727409493351-05859b3195f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzc1NjY1ODYyfA&ixlib=rb-4.1.0&q=80&w=1080",
      },
      {
        url: "https://images.unsplash.com/photo-1579792808953-85b3438c450d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzc1NjY1ODYyfA&ixlib=rb-4.1.0&q=80&w=1080",
      },
    ],
    []
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
    { icon: "🏡", label: t("hero_proof_1"), live: false },
    { icon: "✨", label: t("hero_proof_2"), live: false },
    { icon: "🇷🇴", label: t("hero_proof_3"), live: false },
    { label: t("hero_live_label"), live: true },
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

  const clearSearchAndShowAll = () => {
    setHeroSearch("");
    applySearch("");
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

  const showSearchFallback = !loading && Boolean(search.trim()) && displayedItems.length < 3;
  const noResultsCtaTitle =
    lang === "en" ? "Didn't find what you're looking for?" : "Nu ai găsit ce cauți?";
  const noResultsCtaButton =
    lang === "en" ? "✨ See all available experiences" : "✨ Vezi toate experiențele disponibile";

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
              key={`hero-slide-${index}`}
              className={`${styles.heroSlide} ${index === activeHeroSlide ? styles.heroSlideActive : ""}`}
              style={{ backgroundImage: `url(${slide.url})`, backgroundPosition: slide.position || "center center" }}
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
                {heroHeadlines[activeHeroSlide % heroHeadlines.length]}
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
                <HeroProofItem key={item.label} icon={item.icon} live={item.live}>
                  {item.label}
                </HeroProofItem>
              ))}
            </div>
          </div>
        </div>
      </section>
      {!user ? <div className={styles.guestHint}>{t("guest_list_hint")}</div> : null}

      <div className={styles.resultsBlock} id="experiences-list">
        {loading ? (
          <div className="muted">{t("common_loading_experiences")}</div>
        ) : displayedItems.length ? (
          <div className={styles.grid}>
            {displayedItems.map((item, index) => {
              const priceText = formatPricing(item, lang, t);
              const start = item.seriesNextStartsAt || item.startsAt || item.startDate;
              const dateLabel = start
                ? new Date(start).toLocaleDateString(lang === "en" ? "en-US" : "ro-RO", {
                    day: "numeric",
                    month: "short",
                  })
                : "";
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
                        {item.shortDescription ? (
                          <div className={styles.cardDesc}>{item.shortDescription}</div>
                        ) : null}
                      </div>
                      <div className={styles.priceBadge}>{priceText}</div>
                    </div>
                    <div className={styles.cardMeta}>
                      {dateLabel ? <span className={styles.metaPill}>📅 {dateLabel}</span> : null}
                      {timeLabel ? <span className={styles.metaPill}>🕒 {timeLabel}</span> : null}
                      {item.languages?.length ? (
                        <span className={styles.metaPill}>🗣 {item.languages.slice(0, 2).join(" · ")}</span>
                      ) : null}
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

        {showSearchFallback ? (
          <div className={styles.noResultsCta}>
            <p>{noResultsCtaTitle}</p>
            <button type="button" onClick={clearSearchAndShowAll}>
              {noResultsCtaButton}
            </button>
          </div>
        ) : null}
      </div>
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
