"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

type HeroStory = {
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  href: string;
  badge: string;
  label: string;
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

function HeroProofItem({ children }: { children: string }) {
  return <span className={styles.heroProofItem}>{children}</span>;
}

function HeroStoryCard({ story }: { story: HeroStory }) {
  return (
    <Link href={story.href} className={styles.heroStoryCard}>
      <div className={styles.heroStoryMedia}>
        <img src={story.imageUrl} alt={story.title} className={styles.heroStoryImage} />
        <span className={styles.heroStoryLabel}>{story.label}</span>
        <span className={styles.heroStoryBadge}>{story.badge}</span>
      </div>
      <div className={styles.heroStoryBody}>
        <div className={styles.heroStoryMeta}>
          <div>
            <strong>{story.title}</strong>
            <span>{story.location}</span>
          </div>
          <em>{story.price}</em>
        </div>
        <span className={styles.heroStoryAction}>Rezervă acum</span>
      </div>
    </Link>
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

  const heroStory = useMemo<HeroStory>(() => {
    const fallbackImage =
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";
    const storyCandidate =
      items.find((item) =>
        [item.title, item.shortDescription, item.description, item.category]
          .join(" ")
          .toLowerCase()
          .match(/buc[aă]t|gastr|bunic|atelier|sat|tradi|tab[aă]r|ceramic|mește|mestes/)
      ) ||
      items.find((item) => Boolean(item.coverImageUrl)) ||
      items[0];

    return {
      label: t("hero_story_label"),
      badge: t("hero_story_badge"),
      title: storyCandidate?.title || t("hero_story_title"),
      location: storyCandidate?.city || t("hero_story_location"),
      price: storyCandidate ? formatPricing(storyCandidate, lang, t) : t("hero_story_price"),
      imageUrl: storyCandidate?.coverImageUrl || fallbackImage,
      href: storyCandidate?._id ? `/experiences/${storyCandidate._id}` : "/experiences?q=bucătărie",
    };
  }, [items, lang, t]);

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
        <div className={styles.heroBackdrop} />
        <div className={styles.heroPoster} />
        <video
          className={styles.heroVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="https://picsum.photos/id/1015/2000/1200"
          aria-hidden="true"
        >
          <source src="https://player.vimeo.com/external/371433846.sd.mp4?s=2367514475414f1b77d278e41b1a086e346f4eb6&profile_id=139&oauth2_token_id=57447761" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <div className={`${styles.heroBrand} ${styles.fadeIn}`}>
              <span className={styles.heroBrandLogo}>LIVADAI</span>
              <span className={styles.heroBrandTagline}>{t("hero_brand_tagline")}</span>
            </div>
            <div className={`${styles.heroBadge} ${styles.fadeIn} ${styles.delay1}`}>{t("hero_badge")}</div>
            <h1 className={`${styles.heroTitle} ${styles.fadeIn} ${styles.delay1}`}>
              <span>{t("hero_title_line1")}</span>
              <span>{t("hero_title_line2")}</span>
            </h1>
            <p className={`${styles.heroSubtitle} ${styles.fadeIn} ${styles.delay2}`}>
              {t("hero_subtitle_line1")}
              {" "}
              {t("hero_subtitle_line2")}
            </p>
            <form className={`${styles.heroSearchForm} ${styles.fadeIn} ${styles.delay2}`} onSubmit={handleHeroSearchSubmit}>
              <div className={styles.heroSearchShell}>
                <span className={styles.heroSearchIcon}>⌕</span>
                <input
                  value={heroSearch}
                  onChange={(event) => setHeroSearch(event.target.value)}
                  placeholder={t("hero_search_placeholder")}
                  className={styles.heroSearchInput}
                  aria-label={t("hero_search_placeholder")}
                />
                <Link href="/map" className={styles.heroNearMeChip}>
                  {t("hero_search_nearby")}
                </Link>
              </div>
            </form>
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
                  if (heroSearch.trim()) {
                    applySearch(heroSearch);
                    return;
                  }
                  scrollToExperiences();
                }}
              >
                {t("hero_cta_primary")}
              </button>
              <Link href="/map" className={styles.heroSecondaryButton}>
                {t("hero_search_map")}
              </Link>
            </div>
            <div className={styles.heroProofRow}>
              {heroProofItems.map((item) => (
                <HeroProofItem key={item}>{item}</HeroProofItem>
              ))}
            </div>
          </div>
          <div className={`${styles.heroVisual} ${styles.fadeIn} ${styles.delay1}`}>
            <div className={styles.heroVisualWrap}>
              <div className={styles.heroVisualFrame}>
                <HeroStoryCard story={heroStory} />
              </div>
            </div>
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
