"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import styles from "./host.module.css";

type HostProfile = {
  total_events?: number;
  total_participants?: number;
};

type Experience = {
  _id: string;
  title?: string;
  coverImageUrl?: string;
  status?: string;
  startsAt?: string;
};

export default function HostDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  const hostId = user?._id || "";

  useEffect(() => {
    let active = true;
    if (!hostId) {
      setLoading(false);
      return;
    }
    Promise.all([
      apiGet<HostProfile>("/hosts/me/profile").catch(() => null),
      apiGet<Experience[]>(`/hosts/${hostId}/activities?limit=6`).catch(() => []),
    ])
      .then(([profileRes, experiencesRes]) => {
        if (!active) return;
        setProfile(profileRes);
        setItems(experiencesRes || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [hostId]);

  const stats = useMemo(
    () => [
      { label: "Experiențe active", value: items.length || 0 },
      { label: "Rezervări", value: profile?.total_participants || 0 },
      { label: "Venituri", value: "—" },
    ],
    [items.length, profile?.total_participants]
  );

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.kicker}>HOST</div>
          <h1 className={styles.title}>Host Dashboard</h1>
          <p className={styles.subtitle}>Gestionează experiențele tale și construiește o comunitate de exploratori fideli.</p>
        </div>
        <Link className="button" href="/host/create-experience">
          ➕ Creează experiență
        </Link>
      </div>

      <div className={styles.stats}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue}>{s.value}</div>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Experiențele tale</h2>
          <span className={styles.sectionMeta}>Ultimele publicate</span>
        </div>

        {loading ? (
          <div className="muted">Se încarcă experiențele…</div>
        ) : items.length ? (
          <div className={styles.grid}>
            {items.map((exp) => (
              <article key={exp._id} className={styles.card}>
                {exp.coverImageUrl ? (
                  <img src={exp.coverImageUrl} alt={exp.title || "experience"} />
                ) : (
                  <div className={styles.coverPlaceholder} />
                )}
                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>{exp.title || "Experiență"}</div>
                  <div className={styles.cardMeta}>
                    {exp.startsAt ? new Date(exp.startsAt).toLocaleDateString("ro-RO") : "Program flexibil"}
                    <span>{exp.status || "PUBLISHED"}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🚀</div>
          <div className={styles.emptyTitle}>E timpul să publici prima ta experiență</div>
          <p className={styles.emptyText}>
            Transformă pasiunea ta în experiențe memorabile. Creează o ofertă premium și începe să primești rezervări.
          </p>
          <Link className="button" href="/host/create-experience">
            Creează prima experiență
          </Link>
        </div>
      )}
    </section>
    </div>
  );
}
