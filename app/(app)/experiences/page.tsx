"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { useLang } from "@/context/lang-context";
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
};

export default function ExperiencesPage() {
  const { lang } = useLang();
  const t = useT();
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
        <div>
          <div className={styles.kicker}>{t("experiences_kicker")}</div>
          <h1 className={styles.title}>{t("experiences_title")}</h1>
          <p className={styles.subtitle}>
            {t("experiences_subtitle")}
          </p>
          <div className={styles.searchWrap}>
            <input
              className={styles.searchInput}
              placeholder={t("experiences_search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroBadge}>{t("experiences_badge")}</div>
          <div className={styles.heroStat}>
            <span>{t("experiences_stat_new")}</span>
            <strong>+24%</strong>
          </div>
          <div className={styles.heroStat}>
            <span>{t("experiences_stat_trusted")}</span>
            <strong>4.8/5</strong>
          </div>
          <button className="button" type="button">
            {t("experiences_cta")}
          </button>
        </div>
      </section>

      {loading ? (
        <div className="muted">{t("common_loading_experiences")}</div>
      ) : filtered.length ? (
        <div className={styles.grid}>
          {filtered.map((item) => {
            const isFree = !item.price || Number(item.price) <= 0;
            const priceText = isFree ? t("experiences_free") : `${item.price || 0} ${item.currencyCode || "RON"}`;
            const start = item.startsAt || item.startDate;
            const dateLabel = start ? new Date(start).toLocaleDateString(lang === "en" ? "en-US" : "ro-RO", { day: "numeric", month: "short" }) : "";
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
          <div className={styles.emptyTitle}>{t("experiences_empty_title")}</div>
          <div className={styles.emptyText}>{t("experiences_empty_text")}</div>
          <button className="button" type="button">
            {t("experiences_view_map")}
          </button>
        </div>
      )}
    </div>
  );
}
