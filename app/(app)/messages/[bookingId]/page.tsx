"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./chat.module.css";

type Booking = {
  _id: string;
  status?: string;
  experience?: { title?: string };
  explorer?: { name?: string; displayName?: string; avatar?: string; profilePhoto?: string };
  host?: { name?: string; displayName?: string; avatar?: string; profilePhoto?: string };
};

type ChatMessage = {
  _id: string;
  senderId?: string;
  senderProfile?: { name?: string; profileImage?: string };
  message?: string;
  createdAt?: string;
};

type Conversation = {
  bookingId: string;
  experienceTitle?: string;
  otherUser?: { _id?: string; name?: string; avatar?: string };
};

export default function ChatPage() {
  const { bookingId } = useParams();
  const resolvedBookingId = Array.isArray(bookingId) ? bookingId[0] : bookingId;
  const { user, loading: authLoading, token } = useAuth();
  const { lang } = useLang();
  const t = useT();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    if (authLoading) return;
    if (!resolvedBookingId || !token) {
      setBooking(null);
      setBookingLoading(false);
      return;
    }
    setBookingLoading(true);
    setBookingError("");
    apiGet<Booking>(`/bookings/${resolvedBookingId}`)
      .then((data) => {
        if (active) setBooking(data || null);
      })
      .catch((err) => {
        if (active) setBookingError((err as Error).message || t("messages_error"));
      })
      .finally(() => {
        if (active) setBookingLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authLoading, resolvedBookingId, token, t]);

  useEffect(() => {
    let active = true;
    if (authLoading || !token || !resolvedBookingId) return;
    apiGet<Conversation[]>("/messages")
      .then((data) => {
        if (!active) return;
        const match = (data || []).find((c) => c.bookingId === resolvedBookingId) || null;
        setConversation(match);
      })
      .catch(() => {
        if (active) setConversation(null);
      });
    return () => {
      active = false;
    };
  }, [authLoading, resolvedBookingId, token]);

  const chatAllowed = useMemo(() => {
    if (!booking?.status) return false;
    return ["PAID", "COMPLETED", "DEPOSIT_PAID"].includes(booking.status);
  }, [booking?.status]);

  const otherUserName = useMemo(() => {
    if (!booking && !conversation) return "";
    if (conversation?.otherUser?.name) return conversation.otherUser.name;
    if (!booking) return "";
    const isHost = user?.role === "HOST" || user?.role === "BOTH";
    const other = isHost ? booking.explorer : booking.host;
    return other?.displayName || other?.name || "";
  }, [booking, conversation, user?.role]);

  const otherUserAvatar = useMemo(() => {
    if (conversation?.otherUser?.avatar) return conversation.otherUser.avatar;
    if (!booking) return "";
    const isHost = user?.role === "HOST" || user?.role === "BOTH";
    const other = isHost ? booking.explorer : booking.host;
    return other?.avatar || other?.profilePhoto || "";
  }, [booking, conversation, user?.role]);

  useEffect(() => {
    let active = true;
    let interval: ReturnType<typeof setInterval> | undefined;
    const loadMessages = async (silent = false) => {
      if (!booking?._id || !chatAllowed) return;
      if (!silent) setChatLoading(true);
      try {
        const data = await apiGet<ChatMessage[]>(`/messages/${booking._id}`);
        if (active) {
          setChatMessages(data || []);
          setChatError("");
        }
      } catch (err) {
        if (!active) return;
        const status = (err as Error & { status?: number }).status;
        if (status === 403) {
          setChatError(t("chat_requires_payment"));
        } else {
          setChatError(t("chat_load_error"));
        }
      } finally {
        if (active && !silent) setChatLoading(false);
      }
    };
    if (booking?._id && chatAllowed) {
      loadMessages();
      interval = setInterval(() => {
        loadMessages(true);
      }, 8000);
    }
    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [booking?._id, chatAllowed, t]);

  const onSendMessage = async () => {
    if (!booking?._id || !draft.trim()) return;
    setSending(true);
    try {
      const created = await apiPost<ChatMessage>(`/messages/${booking._id}`, { message: draft.trim() });
      setChatMessages((prev) => [...prev, created]);
      setDraft("");
      setChatError("");
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      setChatError(status === 403 ? t("chat_requires_payment") : t("chat_send_error"));
    } finally {
      setSending(false);
    }
  };

  const experienceTitle = booking?.experience?.title || conversation?.experienceTitle;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{t("chat_title")}</h1>
        <p>{t("chat_subtitle")}</p>
      </div>

      <div className={styles.chatPanel}>
        <div className={styles.chatHeader}>
          <div className={styles.chatBadge}>{t("chat_kicker")}</div>
          <div className={styles.chatIdentity}>
            <div className={styles.identityAvatar}>
              {otherUserAvatar ? (
                <img src={otherUserAvatar} alt={otherUserName || "avatar"} />
              ) : (
                <span>{(otherUserName || "?").slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className={styles.chatTitle}>
                {otherUserName ? `${t("chat_with")} ${otherUserName}` : t("chat_title")}
              </div>
              <div className={styles.chatSubtitle}>{experienceTitle || t("common_experience")}</div>
            </div>
          </div>
        </div>

        <div className={styles.chatBody}>
          {!user ? (
            <div className={styles.chatHint}>{t("chat_login_prompt")}</div>
          ) : bookingLoading ? (
            <div className={styles.chatHint}>{t("chat_loading_booking")}</div>
          ) : bookingError ? (
            <div className={styles.chatHint}>{bookingError}</div>
          ) : !booking?._id ? (
            <div className={styles.chatHint}>{t("chat_no_booking")}</div>
          ) : !chatAllowed ? (
            <div className={styles.chatHint}>{t("chat_requires_payment")}</div>
          ) : chatLoading ? (
            <div className={styles.chatHint}>{t("chat_loading")}</div>
          ) : chatMessages.length === 0 ? (
            <div className={styles.chatHint}>{t("chat_empty")}</div>
          ) : (
            <div className={styles.chatMessages}>
              {chatMessages.map((msg) => {
                const isMine = user?._id && msg.senderId === user._id;
                const initial =
                  (msg.senderProfile?.name || otherUserName || "?").slice(0, 1).toUpperCase();
                const timestamp = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString(lang === "en" ? "en-US" : "ro-RO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";
                return (
                  <div key={msg._id} className={`${styles.chatRow} ${isMine ? styles.chatRowMine : ""}`}>
                    {!isMine ? (
                      <div className={styles.chatAvatar}>
                        {msg.senderProfile?.profileImage ? (
                          <img src={msg.senderProfile.profileImage} alt={msg.senderProfile?.name || "avatar"} />
                        ) : (
                          <span>{initial}</span>
                        )}
                      </div>
                    ) : null}
                    <div className={styles.chatBubble}>
                      <div className={styles.chatText}>{msg.message}</div>
                      {timestamp ? <div className={styles.chatTime}>{timestamp}</div> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.chatComposer}>
          <div className={styles.composerRow}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("chat_placeholder")}
              disabled={!user || !booking || !chatAllowed || sending}
            />
            <button type="button" onClick={onSendMessage} disabled={!draft.trim() || sending || !chatAllowed}>
              {sending ? t("chat_sending") : t("chat_send")}
            </button>
          </div>
          {chatError ? <div className={styles.chatError}>{chatError}</div> : null}
        </div>
      </div>
    </div>
  );
}
