"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import styles from "./experiences.module.css";

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
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
      <section className={styles.hero}>
        <div>
          <div className={styles.kicker}>LIVADAI · Experiențe autentice</div>
          <h1 className={styles.title}>Explorează experiențe autentice</h1>
          <p className={styles.subtitle}>
            Trăiește momente reale alături de oameni pasionați. Descoperă experiențe locale curate, sigure și memorabile.
          </p>
          <div className={styles.searchWrap}>
            <input
              className={styles.searchInput}
              placeholder="Caută orașe, activități sau gazde"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroBadge}>Curated · Local · Trusted</div>
          <div className={styles.heroStat}>
            <span>Experiențe noi în fiecare săptămână</span>
            <strong>+24%</strong>
          </div>
          <div className={styles.heroStat}>
            <span>Hosts verificați și recenzii reale</span>
            <strong>4.8/5</strong>
          </div>
          <button className="button" type="button">
            Descoperă acum
          </button>
        </div>
      </section>

      {loading ? (
        <div className="muted">Se încarcă experiențele…</div>
      ) : filtered.length ? (
        <div className={styles.grid}>
          {filtered.map((item) => {
            const isFree = !item.price || Number(item.price) <= 0;
            const priceText = isFree ? "Gratuit" : `${item.price || 0} ${item.currencyCode || "RON"}`;
            const start = item.startsAt || item.startDate;
            const dateLabel = start ? new Date(start).toLocaleDateString("ro-RO", { day: "numeric", month: "short" }) : "";
            return (
              <article key={item._id} className={styles.card}>
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
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✨</div>
          <div className={styles.emptyTitle}>Nicio experiență disponibilă încă</div>
          <div className={styles.emptyText}>În curând vor apărea experiențe noi, selectate cu grijă pentru exploratori.</div>
          <button className="button" type="button">
            Vezi harta
          </button>
        </div>
      )}
    </div>
  );
}
