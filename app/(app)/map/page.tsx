"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { useT } from "@/lib/i18n";
import styles from "./map.module.css";

const MapClient = dynamic(() => import("./MapClient"), { ssr: false });

type MapPoint = {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  latitude: number;
  longitude: number;
  host?: {
    profileImage?: string;
    avatar?: string;
    profilePhoto?: string;
    name?: string;
  };
};

export default function MapPage() {
  const t = useT();
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    apiGet<MapPoint[]>("/experiences/map")
      .then((data) => {
        if (active) setPoints(data || []);
      })
      .catch(() => {
        if (active) setPoints([]);
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
    if (!term) return points;
    return points.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const desc = (p.description || p.shortDescription || "").toLowerCase();
      return title.includes(term) || desc.includes(term);
    });
  }, [points, search]);

  return (
    <>
      <div className={styles.searchBar}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-3.5-3.5" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          className={styles.searchInput}
          placeholder={t("map_search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="muted">{t("common_loading_map")}</div>
      ) : (
        <div className={styles.mapWrap}>
          <MapClient points={filtered} />
        </div>
      )}
    </>
  );
}
