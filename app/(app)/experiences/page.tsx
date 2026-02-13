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
  environment?: "INDOOR" | "OUTDOOR" | "BOTH" | string;
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

  const totalSeconds = useMemo(() => Math.floor(80 * 365 * 24 * 60 * 60), []);
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [timerStarted, setTimerStarted] = useState(false);

  useEffect(() => {
    const startTimer = window.setTimeout(() => setTimerStarted(true), 1000);
    return () => window.clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!timerStarted) return;
    const tick = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(tick);
  }, [timerStarted]);

  const formattedHours = useMemo(() => {
    const locale = lang === "en" ? "en-US" : "ro-RO";
    const hours = Math.floor(remainingSeconds / 3600);
    return new Intl.NumberFormat(locale).format(hours);
  }, [lang, remainingSeconds]);

  const formattedMinutes = useMemo(() => {
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    return String(minutes).padStart(2, "0");
  }, [remainingSeconds]);

  const formattedSeconds = useMemo(() => {
    const seconds = remainingSeconds % 60;
    return String(seconds).padStart(2, "0");
  }, [remainingSeconds]);

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
            <path d="M40 138c60 10 120 10 180 4 80-8 160-10 240-4 52 4 98 4 160-6" />

            <circle cx="80" cy="98" r="7" />
            <path d="M74 110l14 10" />
            <path d="M70 118l-10 22" />
            <path d="M90 118l14 22" />
            <path d="M86 100l18-8 8 16" />

            <circle cx="180" cy="104" r="7" />
            <path d="M172 114l16 10" />
            <path d="M168 126l-10 18" />
            <path d="M192 126l10 18" />
            <path d="M170 122l28-6" />
            <path d="M162 134c18 6 38 6 56 0" />

            <circle cx="290" cy="100" r="7" />
            <path d="M282 112l16 10" />
            <path d="M276 124l-10 18" />
            <path d="M302 124l12 18" />
            <path d="M290 114l8 22" />
            <path d="M300 114l10 22" />

            <circle cx="400" cy="98" r="7" />
            <path d="M392 110l16 10" />
            <path d="M386 122l-10 18" />
            <path d="M414 122l12 18" />
            <path d="M388 114c10-10 24-10 34 0" />

            <circle cx="520" cy="92" r="7" />
            <path d="M512 104l16 10" />
            <path d="M506 116l-10 18" />
            <path d="M534 116l12 18" />
            <path d="M520 104l-8 18" />
            <path d="M528 104l10 18" />
          </g>
        </svg>
        <div className={styles.heroText}>
          <h1 className={`${styles.heroTitle} ${styles.fadeIn}`}>{t("hero_title")}</h1>
          <p className={`${styles.heroSubtitle} ${styles.fadeIn} ${styles.delay1}`}>
            {t("hero_subtitle_line1")}
            <br />
            {t("hero_subtitle_line2")}
          </p>
          <button
            className={`button ${styles.heroCta} ${styles.fadeIn} ${styles.delay2}`}
            type="button"
            onClick={() => {
              const list = document.getElementById("experiences-list");
              if (list) list.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            {t("hero_cta_primary")}
          </button>
          <div className={styles.heroMicrocopy}>{t("hero_cta_microcopy")}</div>
        </div>
        <div className={`${styles.heroVisual} ${styles.fadeIn} ${styles.delay1}`}>
          <div className={styles.timerCard}>
            <div className={styles.timerLabel}>{t("hero_timer_label")}</div>
            <div className={styles.heroTimer}>
              {formattedHours}
              <span className={styles.heroTimerDelimiter}>:</span>
              <span className={styles.heroTimerMinutes}>{formattedMinutes}</span>
              <span className={styles.heroTimerDelimiter}>:</span>
              <span className={styles.heroTimerSeconds}>{formattedSeconds}</span>
              <span className={styles.heroTimerUnit}>{t("hero_timer_unit")}</span>
            </div>
            <div className={styles.heroTimerNote}>{t("hero_timer_note")}</div>
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
            const seats = formatSeatsInfo(item);
            const environmentLabel = formatEnvironment(item, t);
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
                    {dateLabel ? <span className={styles.metaPill}>📅 {dateLabel}</span> : null}
                    {item.languages?.length ? <span className={styles.metaPill}>🗣 {item.languages.slice(0, 2).join(" · ")}</span> : null}
                    {environmentLabel ? <span className={styles.metaPill}>🍃 {environmentLabel}</span> : null}
                    {seats ? <span className={styles.metaPill}>👥 {seats}</span> : null}
                    {item.rating_avg ? <span className={styles.rating}>⭐ {Number(item.rating_avg).toFixed(1)}</span> : null}
                  </div>
                  {groupLabel ? <div className={styles.groupLine}>{groupLabel}</div> : null}
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
