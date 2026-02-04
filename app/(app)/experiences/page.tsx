"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
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
  category?: string;
  languages?: string[];
  startsAt?: string;
  startDate?: string;
  durationMinutes?: number;
  activityType?: string;
  maxParticipants?: number;
  remainingSpots?: number;
  availableSpots?: number;
};

const formatDuration = (minutes: number | undefined, lang: string) => {
  const total = Number(minutes);
  if (!total || Number.isNaN(total)) return "";
  const isEn = lang === "en";
  const units = isEn
    ? { min: "min", hour: "hour", hours: "hours", day: "day", days: "days" }
    : { min: "min", hour: "oră", hours: "ore", day: "zi", days: "zile" };
  if (total < 60) return `${total} ${units.min}`;
  if (total < 1440) {
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    const hoursLabel = hours === 1 ? units.hour : units.hours;
    return mins ? `${hours} ${hoursLabel} ${mins} ${units.min}` : `${hours} ${hoursLabel}`;
  }
  const days = Math.floor(total / 1440);
  const remaining = total % 1440;
  const hours = Math.floor(remaining / 60);
  const daysLabel = days === 1 ? units.day : units.days;
  const hoursLabel = hours === 1 ? units.hour : units.hours;
  return hours ? `${days} ${daysLabel} ${hours} ${hoursLabel}` : `${days} ${daysLabel}`;
};

const formatGroupInfo = (item: Experience, lang: string) => {
  if (item.activityType !== "GROUP") return "";
  const total = item.maxParticipants || 0;
  const available = item.availableSpots ?? item.remainingSpots ?? item.maxParticipants;
  if (!total || typeof available !== "number") return "";
  const occupied = Math.max(0, total - available);
  const label = lang === "en" ? "Group" : "Grup";
  const people = lang === "en" ? "participants" : "participanți";
  return `👥 ${label} · ${occupied} / ${total} ${people}`;
};

export default function ExperiencesPage() {
  const { lang } = useLang();
  const t = useT();
  const { user } = useAuth();
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreated, setShowCreated] = useState(false);

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
    const created = window.localStorage.getItem(EXPERIENCE_CREATED_KEY);
    if (created) {
      setShowCreated(true);
      window.localStorage.removeItem(EXPERIENCE_CREATED_KEY);
    }
  }, []);

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

  const headlineOptions = [t("hero_headline_1"), t("hero_headline_2"), t("hero_headline_3")];
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % headlineOptions.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [headlineOptions.length]);

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
        <div className={styles.heroCopy}>
          <div className={styles.heroHeadlineWrap}>
            <h1 className={`${styles.title} ${styles.fadeIn}`}>
              <span className={styles.heroHeadlineAnimated}>{headlineOptions[headlineIndex]}</span>
            </h1>
            <div className={styles.accentLine} />
          </div>
          <p className={`${styles.subtitle} ${styles.fadeIn} ${styles.delay1}`}>{t("hero_subheadline")}</p>
          <p className={`${styles.heroParagraph} ${styles.fadeIn} ${styles.delay1}`}>{t("hero_paragraph")}</p>

          <div className={`${styles.heroSearch} ${styles.fadeIn} ${styles.delay1}`}>
            <input
              className={styles.heroSearchInput}
              placeholder={t("hero_search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Link className={`button ${styles.heroSearchButton}`} href="#experiences-list">
              {t("hero_cta")}
            </Link>
          </div>

          <div className={`${styles.heroCards} ${styles.fadeIn} ${styles.delay1}`}>
            <Link className={styles.heroCard} href="#experiences-list">
              <div className={styles.heroCardTitle}>{t("hero_card_explore_title")}</div>
              <div className={styles.heroCardText}>{t("hero_card_explore_text")}</div>
            </Link>
            <Link className={styles.heroCard} href="/host/create-experience">
              <div className={styles.heroCardTitle}>{t("hero_card_create_title")}</div>
              <div className={styles.heroCardText}>{t("hero_card_create_text")}</div>
            </Link>
            <Link className={styles.heroCard} href="/messages">
              <div className={styles.heroCardTitle}>{t("hero_card_meet_title")}</div>
              <div className={styles.heroCardText}>{t("hero_card_meet_text")}</div>
            </Link>
          </div>

          <div className={`${styles.heroSection} ${styles.fadeIn} ${styles.delay1}`}>
            <div className={styles.heroSectionTitle}>{t("hero_built_title")}</div>
            <p className={styles.heroSectionText}>{t("hero_built_text")}</p>
          </div>
        </div>
      </section>
      {!user ? <div className={styles.guestHint}>{t("guest_list_hint")}</div> : null}

      {loading ? (
        <div className="muted">{t("common_loading_experiences")}</div>
      ) : filtered.length ? (
        <div className={styles.grid} id="experiences-list">
          {filtered.map((item) => {
            const isFree = !item.price || Number(item.price) <= 0;
            const priceText = isFree ? t("experiences_free") : `${item.price || 0} ${item.currencyCode || "RON"}`;
            const start = item.startsAt || item.startDate;
            const dateLabel = start ? new Date(start).toLocaleDateString(lang === "en" ? "en-US" : "ro-RO", { day: "numeric", month: "short" }) : "";
            const groupLabel = formatGroupInfo(item, lang);
            const seats = groupLabel ? groupLabel.match(/\d+\/\d+/)?.[0] : null;
            return (
              <Link key={item._id} href={`/experiences/${item._id}`} className={styles.card}>
                {item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt={item.title} className={styles.cover} />
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
                    <div className={styles.priceBadge} style={isFree ? { background: "#0ea37d" } : undefined}>
                      {priceText}
                    </div>
                  </div>
                  <div className={styles.cardMeta}>
                    {dateLabel ? <span>📅 {dateLabel}</span> : null}
                    {item.languages?.length ? <span>🗣 {item.languages.slice(0, 2).join(" · ")}</span> : null}
                    {seats ? <span>👥 {seats}</span> : null}
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
