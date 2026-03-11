"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { dedupeBookings } from "@/lib/booking-dedupe";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./host-bookings.module.css";

type Booking = {
  _id: string;
  status?: string;
  quantity?: number;
  explorer?: { _id?: string; name?: string; email?: string };
  experience?: {
    _id?: string;
    title?: string;
    startDate?: string;
    startsAt?: string;
    maxParticipants?: number;
    remainingSpots?: number;
    scheduleGroupId?: string | null;
  };
};

type DayBucket = {
  key: string;
  date: Date;
  bookings: Booking[];
  participants: number;
  experiences: Array<{ id: string; title: string; bookings: number; participants: number }>;
};

const toDateSafe = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export default function HostBookingsPage() {
  const { lang } = useLang();
  const t = useT();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGet<Booking[]>("/bookings/host")
      .then((data) => {
        if (active) setItems(dedupeBookings(data || []));
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

  const groupedByDay = useMemo(() => {
    const map = new Map<string, DayBucket>();
    for (const booking of items) {
      const startValue = booking.experience?.startsAt || booking.experience?.startDate;
      const startDate = toDateSafe(startValue);
      if (!startDate) continue;
      const key = startDate.toISOString().slice(0, 10);
      if (!map.has(key)) {
        map.set(key, {
          key,
          date: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
          bookings: [],
          participants: 0,
          experiences: [],
        });
      }
      const bucket = map.get(key)!;
      bucket.bookings.push(booking);
      bucket.participants += Number(booking.quantity || 1);
    }

    const result = Array.from(map.values());
    for (const bucket of result) {
      const byExperience = new Map<string, { id: string; title: string; bookings: number; participants: number }>();
      for (const booking of bucket.bookings) {
        const expId = booking.experience?._id || "unknown";
        if (!byExperience.has(expId)) {
          byExperience.set(expId, {
            id: expId,
            title: booking.experience?.title || t("common_experience"),
            bookings: 0,
            participants: 0,
          });
        }
        const row = byExperience.get(expId)!;
        row.bookings += 1;
        row.participants += Number(booking.quantity || 1);
      }
      bucket.experiences = Array.from(byExperience.values()).sort((a, b) => b.participants - a.participants);
    }
    return result.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [items, t]);

  const nowDayStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }, []);

  const upcoming = groupedByDay.filter((bucket) => bucket.date.getTime() >= nowDayStart);
  const completed = groupedByDay.filter((bucket) => bucket.date.getTime() < nowDayStart);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>{t("host_kicker")}</div>
          <h1>{t("host_bookings_title")}</h1>
          <p>{t("host_bookings_subtitle")}</p>
        </div>
      </div>

      {loading ? (
        <div className="muted">{t("common_loading_bookings")}</div>
      ) : !groupedByDay.length ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📭</div>
          <div className={styles.emptyTitle}>{t("host_bookings_empty_title")}</div>
          <div className={styles.emptyText}>{t("host_bookings_empty_text")}</div>
        </div>
      ) : (
        <>
          <section className={styles.section}>
            <h2>{lang === "en" ? "Upcoming days" : "Zile viitoare"}</h2>
            {upcoming.length ? (
              <div className={styles.list}>
                {upcoming.map((bucket) => (
                  <DayCard key={bucket.key} bucket={bucket} lang={lang} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyInline}>{lang === "en" ? "No upcoming booking days." : "Nu ai zile viitoare cu booking-uri."}</div>
            )}
          </section>

          <section className={styles.section}>
            <h2>{lang === "en" ? "Completed days" : "Zile încheiate"}</h2>
            {completed.length ? (
              <div className={styles.list}>
                {completed.map((bucket) => (
                  <DayCard key={bucket.key} bucket={bucket} lang={lang} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyInline}>{lang === "en" ? "No completed booking days." : "Nu ai zile încheiate cu booking-uri."}</div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function DayCard({ bucket, lang }: { bucket: DayBucket; lang: string }) {
  const dateLabel = bucket.date.toLocaleDateString(lang === "en" ? "en-US" : "ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className={styles.dayCard}>
      <div className={styles.dayHeader}>
        <div className={styles.dayTitle}>{dateLabel}</div>
        <div className={styles.dayMeta}>
          {lang === "en"
            ? `${bucket.bookings.length} bookings · ${bucket.participants} participants`
            : `${bucket.bookings.length} booking-uri · ${bucket.participants} participanți`}
        </div>
      </div>
      <div className={styles.experienceRows}>
        {bucket.experiences.map((exp) => (
          exp.id !== "unknown" ? (
            <Link key={exp.id} href={`/host/bookings/experience/${exp.id}`} className={styles.expRowLink}>
              <div className={styles.expRow}>
                <div className={styles.expTitle}>{exp.title}</div>
                <div className={styles.expMeta}>
                  {lang === "en"
                    ? `${exp.bookings} bookings · ${exp.participants} participants`
                    : `${exp.bookings} booking-uri · ${exp.participants} participanți`}
                </div>
              </div>
            </Link>
          ) : (
            <div key={exp.id} className={styles.expRow}>
              <div className={styles.expTitle}>{exp.title}</div>
              <div className={styles.expMeta}>
                {lang === "en"
                  ? `${exp.bookings} bookings · ${exp.participants} participants`
                  : `${exp.bookings} booking-uri · ${exp.participants} participanți`}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
