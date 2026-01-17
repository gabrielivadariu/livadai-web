"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/app-header";
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
    <>
      <AppHeader searchValue={search} onSearchChange={setSearch} />
      {loading ? (
        <div className="muted">Se încarcă experiențele…</div>
      ) : filtered.length ? (
        <div className={styles.list}>
          {filtered.map((item) => {
            const isFree = !item.price || Number(item.price) <= 0;
            const priceText = isFree ? "Gratuit" : `${item.price || 0} ${item.currencyCode || "RON"}`;
            const start = item.startsAt || item.startDate;
            const dateLabel = start ? new Date(start).toLocaleDateString("ro-RO", { day: "numeric", month: "short" }) : "";
            return (
              <div key={item._id} className={styles.card}>
                {item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt={item.title} className={styles.cover} />
                ) : (
                  <div className={styles.cover} />
                )}
                <div className={styles.body}>
                  <div className={styles.headerRow}>
                    <div>
                      <div className={styles.title}>{item.title}</div>
                      <div className={styles.location}>
                        {item.city || ""} {item.country || item.address || ""}
                      </div>
                      {item.shortDescription ? <div className={styles.shortDesc}>{item.shortDescription}</div> : null}
                    </div>
                    <div className={styles.priceBadge} style={isFree ? { background: "#10b981" } : undefined}>
                      {priceText}
                    </div>
                  </div>
                  <div className={styles.metaRow}>
                    {dateLabel ? <div className={styles.metaItem}>📅 {dateLabel}</div> : null}
                    {item.languages?.length ? <div className={styles.metaItem}>🗣 {item.languages.slice(0, 2).join(" · ")}</div> : null}
                    {item.rating_avg ? <div className={styles.rating}>⭐ {Number(item.rating_avg).toFixed(1)}</div> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty}>Nu există experiențe momentan.</div>
      )}
    </>
  );
}
