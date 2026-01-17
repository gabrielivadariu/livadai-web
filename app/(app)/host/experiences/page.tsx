"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiGet } from "@/lib/api";
import styles from "./host-experiences.module.css";

type Experience = {
  _id: string;
  title?: string;
  coverImageUrl?: string;
  startsAt?: string;
  status?: string;
};

export default function HostExperiencesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user?._id) {
      setLoading(false);
      return;
    }
    apiGet<Experience[]>(`/hosts/${user._id}/activities?limit=50`)
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
  }, [user?._id]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>Host</div>
          <h1>Experiențele tale</h1>
          <p>Gestionează experiențele publicate și creează altele noi.</p>
        </div>
        <Link className="button" href="/host/create-experience">
          ➕ Creează experiență
        </Link>
      </div>

      {loading ? (
        <div className="muted">Se încarcă experiențele…</div>
      ) : items.length ? (
        <div className={styles.grid}>
          {items.map((exp) => (
            <article key={exp._id} className={styles.card}>
              {exp.coverImageUrl ? <img src={exp.coverImageUrl} alt={exp.title || "experience"} /> : <div className={styles.coverPlaceholder} />}
              <div className={styles.cardBody}>
                <div className={styles.title}>{exp.title || "Experiență"}</div>
                <div className={styles.meta}>
                  {exp.startsAt ? new Date(exp.startsAt).toLocaleDateString("ro-RO") : "Program flexibil"}
                </div>
                <div className={styles.status}>{exp.status || "PUBLISHED"}</div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🗺️</div>
          <div className={styles.emptyTitle}>Nu ai experiențe publicate încă</div>
          <div className={styles.emptyText}>Creează prima ta experiență și începe să primești rezervări.</div>
          <Link className="button" href="/host/create-experience">
            Creează prima experiență
          </Link>
        </div>
      )}
    </div>
  );
}
