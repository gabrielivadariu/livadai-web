"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./notifications.module.css";

type Notification = {
  _id: string;
  title?: string;
  message?: string;
  createdAt?: string;
  isRead?: boolean;
};

export default function NotificationsPage() {
  const t = useT();
  const { lang } = useLang();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet<Notification[]>("/notifications");
      setItems(data || []);
    } catch (err) {
      setError((err as Error).message || t("notifications_error"));
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      await apiPost("/notifications/mark-all-read", {});
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setError((err as Error).message || t("notifications_error"));
    } finally {
      setMarking(false);
    }
  };

  useEffect(() => {
    loadNotifications().then(() => {
      apiPost("/notifications/mark-all-read", {}).catch(() => undefined);
    });
  }, [t]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>{t("notifications_title")}</h1>
          <p>{t("notifications_subtitle")}</p>
        </div>
        <button className="button secondary" type="button" onClick={markAllRead} disabled={marking}>
          {t("notifications_mark_all")}
        </button>
      </div>

      {loading ? (
        <div className="muted">{t("notifications_loading")}</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : items.length ? (
        <div className={styles.list}>
          {items.map((n) => (
            <div key={n._id} className={`${styles.card} ${n.isRead ? styles.read : ""}`}>
              <div className={styles.dot} />
              <div>
                <div className={styles.title}>{n.title || t("notifications_title")}</div>
                <div className={styles.message}>{n.message}</div>
                {n.createdAt ? (
                  <div className={styles.date}>
                    {new Date(n.createdAt).toLocaleString(lang === "en" ? "en-US" : "ro-RO")}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="muted">{t("notifications_empty")}</div>
      )}
    </div>
  );
}
