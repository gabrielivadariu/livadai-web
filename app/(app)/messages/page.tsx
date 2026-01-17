"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./messages.module.css";

type Conversation = {
  bookingId: string;
  experienceTitle?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  otherUser?: { _id?: string; name?: string; avatar?: string };
};

type Booking = {
  _id: string;
  experience?: { _id?: string };
};

export default function MessagesPage() {
  const t = useT();
  const router = useRouter();
  const { lang } = useLang();
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiGet<Conversation[]>("/messages")
      .then((data) => {
        if (active) setItems(data || []);
      })
      .catch((err) => {
        if (active) setError((err as Error).message || t("messages_error"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  const openChat = async (bookingId: string) => {
    setOpeningId(bookingId);
    setError("");
    try {
      const booking = await apiGet<Booking>(`/bookings/${bookingId}`);
      const expId = booking?.experience?._id;
      if (expId) {
        router.push(`/experiences/${expId}?bookingId=${bookingId}`);
      } else {
        setError(t("messages_error"));
      }
    } catch (err) {
      setError((err as Error).message || t("messages_error"));
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{t("messages_title")}</h1>
        <p>{t("messages_subtitle")}</p>
      </div>

      {loading ? (
        <div className="muted">{t("messages_loading")}</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : items.length ? (
        <div className={styles.list}>
          {items.map((c) => {
            const dateLabel = c.lastMessageAt
              ? new Date(c.lastMessageAt).toLocaleString(lang === "en" ? "en-US" : "ro-RO")
              : "";
            return (
              <div key={c.bookingId} className={styles.card}>
                <div className={styles.avatar}>
                  {c.otherUser?.avatar ? (
                    <img src={c.otherUser.avatar} alt={c.otherUser?.name || "avatar"} />
                  ) : (
                    <span>{(c.otherUser?.name || "?").slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className={styles.meta}>
                  <div className={styles.title}>{c.otherUser?.name || t("experience_host_fallback")}</div>
                  <div className={styles.subtitle}>{c.experienceTitle || t("common_experience")}</div>
                  <div className={styles.preview}>{c.lastMessage || ""}</div>
                </div>
                <div className={styles.side}>
                  <div className={styles.date}>{dateLabel}</div>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => openChat(c.bookingId)}
                    disabled={openingId === c.bookingId}
                  >
                    {openingId === c.bookingId ? t("common_loading") : t("messages_open")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="muted">{t("messages_empty")}</div>
      )}
    </div>
  );
}
