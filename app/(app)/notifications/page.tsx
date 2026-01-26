"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { getMessage, useT } from "@/lib/i18n";
import styles from "./notifications.module.css";

type Notification = {
  _id: string;
  title?: string;
  message?: string;
  createdAt?: string;
  isRead?: boolean;
  type?: string;
  data?: {
    bookingId?: string;
    activityId?: string;
    activityTitle?: string;
    experienceTitle?: string;
    senderName?: string;
  };
};

export default function NotificationsPage() {
  const t = useT();
  const { lang } = useLang();
  const { loading: authLoading, token, user } = useAuth();
  const isHost = user?.role === "HOST" || user?.role === "BOTH";
  const router = useRouter();
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

  const formatTemplate = (template: string, vars: Record<string, string>) =>
    template.replace(/\{(\w+)\}/g, (_, key) => vars[key] || "");

  const formatNotification = (n: Notification) => {
    const experience =
      n.data?.activityTitle || n.data?.experienceTitle || t("common_experience");
    const sender = n.data?.senderName || getMessage(lang, "notif_someone");
    switch (n.type) {
      case "MESSAGE_NEW":
        return {
          title: getMessage(lang, "notif_message_new_title"),
          message: formatTemplate(getMessage(lang, "notif_message_new_body"), {
            name: sender,
            experience,
          }),
        };
      case "BOOKING_CONFIRMED":
        return {
          title: getMessage(lang, "notif_booking_confirmed_title"),
          message: formatTemplate(getMessage(lang, "notif_booking_confirmed_body"), { experience }),
        };
      case "BOOKING_RECEIVED":
        return {
          title: getMessage(lang, "notif_booking_received_title"),
          message: formatTemplate(getMessage(lang, "notif_booking_received_body"), { experience }),
        };
      case "BOOKING_CANCELLED":
        return {
          title: getMessage(lang, "notif_booking_cancelled_title"),
          message: formatTemplate(getMessage(lang, "notif_booking_cancelled_body"), { experience }),
        };
      case "EVENT_REMINDER_HOST":
        return {
          title: getMessage(lang, "notif_event_reminder_host_title"),
          message: formatTemplate(getMessage(lang, "notif_event_reminder_host_body"), { experience }),
        };
      case "EVENT_REMINDER_EXPLORER":
        return {
          title: getMessage(lang, "notif_event_reminder_explorer_title"),
          message: formatTemplate(getMessage(lang, "notif_event_reminder_explorer_body"), { experience }),
        };
      default:
        return {
          title: n.title || t("notifications_title"),
          message: n.message || "",
        };
    }
  };

  const notificationLink = (n: Notification) => {
    const bookingId = n.data?.bookingId;
    const activityId = n.data?.activityId;
    if (n.type === "MESSAGE_NEW" && bookingId) return `/messages/${bookingId}`;
    if (activityId && bookingId) return `/experiences/${activityId}?bookingId=${bookingId}`;
    if (activityId) return `/experiences/${activityId}`;
    if (n.type === "BOOKING_RECEIVED") return "/host/bookings";
    if (n.type === "EVENT_REMINDER_HOST") return "/host/bookings";
    return isHost ? "/host/guest-participations" : "/profile";
  };

  const onOpenNotification = async (n: Notification) => {
    try {
      await apiPost("/notifications/mark-read", { ids: [n._id] });
      setItems((prev) => prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item)));
    } catch (_e) {
      // ignore
    }
    router.push(notificationLink(n));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.replace("/login?reason=auth&next=/notifications");
      return;
    }
    loadNotifications();
  }, [authLoading, token, router]);

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
          {items.map((n) => {
            const formatted = formatNotification(n);
            return (
              <button
                key={n._id}
                type="button"
                className={`${styles.card} ${styles.cardClickable} ${n.isRead ? styles.read : ""}`}
                onClick={() => onOpenNotification(n)}
              >
                <div className={styles.dot} />
                <div>
                  <div className={styles.title}>{formatted.title}</div>
                  <div className={styles.message}>{formatted.message}</div>
                  {n.createdAt ? (
                    <div className={styles.date}>
                      {new Date(n.createdAt).toLocaleString(lang === "en" ? "en-US" : "ro-RO")}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="muted">{t("notifications_empty")}</div>
      )}
    </div>
  );
}
