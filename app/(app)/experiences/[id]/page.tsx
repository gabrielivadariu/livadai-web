"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import ReportModal from "@/components/report-modal";
import styles from "./experience-detail.module.css";

type Experience = {
  _id: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  city?: string;
  country?: string;
  address?: string;
  location?: {
    street?: string;
    streetNumber?: string;
    city?: string;
    country?: string;
    formattedAddress?: string;
  };
  price?: number;
  currencyCode?: string;
  rating_avg?: number;
  coverImageUrl?: string;
  images?: string[];
  languages?: string[];
  startsAt?: string;
  endsAt?: string;
  startDate?: string;
  durationMinutes?: number;
  environment?: string;
  activityType?: string;
  maxParticipants?: number;
  remainingSpots?: number;
  availableSpots?: number;
  host?: { _id?: string; name?: string; displayName?: string; profilePhoto?: string; avatar?: string };
};

const formatDuration = (minutes: number | undefined, lang: string) => {
  const total = Number(minutes);
  if (!total || Number.isNaN(total)) return "";
  const isEn = lang === "en";
  const units = isEn
    ? { min: "min", hour: "hour", hours: "hours", day: "day", days: "days" }
    : { min: "min", hour: "oră", hours: "ore", day: "zi", days: "zile" };
  if (total < 60) return `${total} ${units.min}`;
  if (total < 1440) {
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    const hoursLabel = hours === 1 ? units.hour : units.hours;
    return mins ? `${hours} ${hoursLabel} ${mins} ${units.min}` : `${hours} ${hoursLabel}`;
  }
  const days = Math.floor(total / 1440);
  const remaining = total % 1440;
  const hours = Math.floor(remaining / 60);
  const daysLabel = days === 1 ? units.day : units.days;
  const hoursLabel = hours === 1 ? units.hour : units.hours;
  return hours ? `${days} ${daysLabel} ${hours} ${hoursLabel}` : `${days} ${daysLabel}`;
};

const formatGroupInfo = (item: Experience, lang: string) => {
  if (item.activityType !== "GROUP") return "";
  const total = item.maxParticipants || 0;
  const available = item.availableSpots ?? item.remainingSpots ?? item.maxParticipants;
  if (!total || typeof available !== "number") return "";
  const occupied = Math.max(0, total - available);
  const people = lang === "en" ? "participants" : "participanți";
  return `${occupied} / ${total} ${people}`;
};

type Booking = {
  _id: string;
  status?: string;
  experience?: { _id?: string; title?: string } | string;
  explorer?: { name?: string; email?: string; profilePhoto?: string; avatar?: string };
  host?: { name?: string; email?: string; profilePhoto?: string; avatar?: string };
};

export default function ExperienceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const { user } = useAuth();
  const t = useT();
  const [item, setItem] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [bookingInfo, setBookingInfo] = useState<Booking | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const bookingPollRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    apiGet<Experience>(`/experiences/${id}`)
      .then((data) => {
        if (active) setItem(data);
      })
      .catch(() => {
        if (active) setItem(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    const loadBooking = async () => {
      if (!user || !item?._id) {
        if (active) setBookingInfo(null);
        return;
      }
      setBookingLoading(true);
      const bookingId = searchParams?.get("bookingId");
      if (bookingId) {
        try {
          const direct = await apiGet<Booking>(`/bookings/${bookingId}`);
          const exp = direct?.experience;
          const expId = typeof exp === "string" ? exp : exp?._id;
          if (expId === item._id && active) {
            setBookingInfo(direct);
            setBookingLoading(false);
            return;
          }
        } catch {
          // fallback to list search
        }
      }
      const candidates: Booking[] = [];
      const role = user.role || "EXPLORER";
      if (role === "HOST" || role === "BOTH") {
        try {
          const hostBookings = await apiGet<Booking[]>("/bookings/host");
          candidates.push(...(hostBookings || []));
        } catch {
          // ignore
        }
      }
      if (role === "EXPLORER" || role === "BOTH") {
        try {
          const myBookings = await apiGet<Booking[]>("/bookings/me");
          candidates.push(...(myBookings || []));
        } catch {
          // ignore
        }
      }
      const allowedStatuses = new Set([
        "PAID",
        "COMPLETED",
        "DEPOSIT_PAID",
        "PENDING_ATTENDANCE",
        "AUTO_COMPLETED",
        "NO_SHOW",
        "DISPUTED",
      ]);
      const allowedMatch = candidates.find((bk) => {
        const exp = bk.experience;
        const expId = typeof exp === "string" ? exp : exp?._id;
        return expId === item._id && bk.status && allowedStatuses.has(bk.status);
      });
      const fallbackMatch = candidates.find((bk) => {
        const exp = bk.experience;
        const expId = typeof exp === "string" ? exp : exp?._id;
        return expId === item._id;
      });
      if (active) {
        setBookingInfo(allowedMatch || fallbackMatch || null);
        setBookingLoading(false);
      }
    };
    loadBooking();
    return () => {
      active = false;
    };
  }, [item?._id, user, searchParams]);

  const chatAllowed = useMemo(() => {
    if (!bookingInfo?.status) return false;
    return new Set([
      "PAID",
      "COMPLETED",
      "DEPOSIT_PAID",
      "PENDING_ATTENDANCE",
      "AUTO_COMPLETED",
      "NO_SHOW",
      "DISPUTED",
    ]).has(bookingInfo.status);
  }, [bookingInfo?.status]);

  useEffect(() => {
    const bookingId = searchParams?.get("bookingId");
    if (!bookingId || !bookingInfo?._id || bookingInfo.status === "PAID" || bookingInfo.status === "DEPOSIT_PAID") {
      if (bookingPollRef.current) {
        clearTimeout(bookingPollRef.current);
        bookingPollRef.current = null;
      }
      return;
    }
    bookingPollRef.current = setTimeout(async () => {
      try {
        const refreshed = await apiGet<Booking>(`/bookings/${bookingId}`);
        const exp = refreshed?.experience;
        const expId = typeof exp === "string" ? exp : exp?._id;
        if (expId === item?._id) {
          setBookingInfo(refreshed);
        }
      } catch {
        // ignore
      }
    }, 4000);
    return () => {
      if (bookingPollRef.current) {
        clearTimeout(bookingPollRef.current);
        bookingPollRef.current = null;
      }
    };
  }, [bookingInfo?._id, bookingInfo?.status, item?._id, searchParams]);

  const onReportExperience = async ({ reason, comment }: { reason: string; comment: string }) => {
    if (!item?._id) return;
    setReporting(true);
    setReportError("");
    setReportSuccess("");
    try {
      await apiPost("/bookings/report-content", {
        experienceId: item._id,
        reason,
        comment,
      });
      setReportSuccess(t("report_sent"));
      setReportOpen(false);
    } catch (err) {
      setReportError((err as Error).message || t("report_failed"));
    } finally {
      setReporting(false);
    }
  };
  const mediaImages = useMemo(() => {
    const list = [item?.coverImageUrl, ...((item?.images || []) as string[])].filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [item?.coverImageUrl, item?.images]);

  const scrollToIndex = (index: number, ref: React.RefObject<HTMLDivElement | null>) => {
    const container = ref.current;
    if (!container) return;
    const target = container.children[index] as HTMLElement | undefined;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", inline: "center" });
      setActiveIndex(index);
    }
  };

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
    const container = ref.current;
    if (!container) return;
    const width = container.clientWidth;
    if (!width) return;
    const idx = Math.round(container.scrollLeft / width);
    setActiveIndex(Math.max(0, Math.min(idx, mediaImages.length - 1)));
  };

  const totalSeats = item?.maxParticipants ?? 0;
  const availableSeats =
    typeof item?.availableSpots === "number"
      ? item.availableSpots
      : typeof item?.remainingSpots === "number"
        ? item.remainingSpots
        : totalSeats;
  const maxQuantity = item?.activityType === "GROUP" ? Math.max(1, availableSeats || totalSeats || 1) : 1;

  useEffect(() => {
    if (item?.activityType !== "GROUP") {
      setQuantity(1);
      return;
    }
    setQuantity((prev) => Math.min(Math.max(prev, 1), maxQuantity));
  }, [item?.activityType, maxQuantity]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      } else if (event.key === "ArrowRight") {
        scrollToIndex(Math.min(activeIndex + 1, mediaImages.length - 1), lightboxRef);
      } else if (event.key === "ArrowLeft") {
        scrollToIndex(Math.max(activeIndex - 1, 0), lightboxRef);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [activeIndex, lightboxOpen, mediaImages.length]);

  const onBook = async () => {
    if (!item?._id) return;
    if (user?._id && item.host?._id && user._id === item.host._id) {
      setError(t("experience_book_own"));
      return;
    }
    setBooking(true);
    setError("");
    try {
      const seatCount = item.activityType === "GROUP" ? quantity : 1;
      const res = await apiPost<{ checkoutUrl?: string }>("/payments/create-checkout", {
        experienceId: item._id,
        quantity: seatCount,
      });
      if (res?.checkoutUrl) {
        if (res.bookingId) {
          window.localStorage.setItem(
            "livadai_last_booking",
            JSON.stringify({ bookingId: res.bookingId, experienceId: item._id, ts: Date.now() })
          );
        }
        window.location.href = res.checkoutUrl;
      } else {
        setError(t("experience_payment_error"));
      }
    } catch (err) {
      const message = (err as Error).message || "";
      if (message.toLowerCase().includes("own experience")) {
        setError(t("experience_book_own"));
      } else {
        setError(message || t("experience_payment_error"));
      }
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <div className="muted">{t("common_loading_experiences")}</div>;
  }

  if (!item) {
    return (
      <div className={styles.empty}>
        <h2>{t("experience_missing_title")}</h2>
        <button className="button" type="button" onClick={() => router.replace("/experiences")}>
          {t("experience_back")}
        </button>
      </div>
    );
  }

  const start = item.startsAt || item.startDate;
  const end = item.endsAt;
  const location = item.location || {};
  const formattedAddress = location.formattedAddress || item.address || "";
  const streetLine = [location.street, location.streetNumber].filter(Boolean).join(" ").trim();
  const cityLine = location.city || item.city;
  const countryLine = location.country || item.country;
  const addressLines = formattedAddress
    ? [formattedAddress]
    : ([streetLine, cityLine, countryLine].filter(Boolean) as string[]);
  const dateFormatter = new Intl.DateTimeFormat(lang === "en" ? "en-US" : "ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const startLabel = start ? dateFormatter.format(new Date(start)) : "";
  const endLabel = end ? dateFormatter.format(new Date(end)) : "";
  const priceText = !item.price || Number(item.price) <= 0 ? t("experiences_free") : `${item.price} ${item.currencyCode || "RON"}`;
  const isHost = user?.role === "HOST" || user?.role === "BOTH";
  const bookingDisabled = booking || (item.activityType === "GROUP" && availableSeats <= 0);
  const chatDisabledReason = !user
    ? t("chat_login_prompt")
    : bookingLoading
      ? t("chat_loading_booking")
      : !bookingInfo
        ? t("chat_no_booking")
        : !chatAllowed
          ? t("chat_requires_payment")
          : "";
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.media}>
          <div className={styles.carousel}>
            <div
              className={styles.carouselTrack}
              ref={carouselRef}
              onScroll={() => handleScroll(carouselRef)}
            >
              {mediaImages.length ? (
                mediaImages.map((img) => (
                  <button
                    key={img}
                    className={styles.slide}
                    type="button"
                    onClick={() => {
                      setLightboxOpen(true);
                      setTimeout(() => scrollToIndex(activeIndex, lightboxRef), 0);
                    }}
                  >
                    <img src={img} alt={item.title} />
                  </button>
                ))
              ) : (
                <div className={styles.coverPlaceholder} />
              )}
            </div>
            {mediaImages.length > 1 ? (
              <>
                <button
                  type="button"
                  className={`${styles.arrow} ${styles.arrowLeft}`}
                  onClick={() => scrollToIndex(Math.max(activeIndex - 1, 0), carouselRef)}
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={`${styles.arrow} ${styles.arrowRight}`}
                  onClick={() => scrollToIndex(Math.min(activeIndex + 1, mediaImages.length - 1), carouselRef)}
                  aria-label="Next"
                >
                  ›
                </button>
              </>
            ) : null}
            {mediaImages.length > 1 ? (
              <div className={styles.dots}>
                {mediaImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.dot} ${idx === activeIndex ? styles.dotActive : ""}`}
                    onClick={() => scrollToIndex(idx, carouselRef)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className={styles.summary}>
          <div className={styles.kicker}>{t("experience_kicker")}</div>
          <h1>{item.title}</h1>
          <p className={styles.subtitle}>{item.shortDescription || item.description}</p>
          <div className={styles.metaGrid}>
            <div>
              <span>{t("experience_start")}</span>
              <strong>{startLabel || t("experience_flexible")}</strong>
            </div>
            <div>
              <span>{t("experience_end")}</span>
              <strong>{endLabel || "—"}</strong>
            </div>
            <div>
              <span>{t("experience_duration")}</span>
              <strong>{formatDuration(item.durationMinutes, lang) || "—"}</strong>
            </div>
            <div>
              <span>{t("experience_type")}</span>
              <strong>{item.activityType || "INDIVIDUAL"}</strong>
            </div>
            <div>
              <span>{t("experience_seats_label")}</span>
              <strong>
                {item.activityType === "GROUP"
                  ? `${formatGroupInfo(item, lang) || "—"}${typeof availableSeats === "number" ? ` · ${t("experience_spots_left").replace("{{count}}", String(availableSeats))}` : ""}`
                  : t("experience_single_seat")}
              </strong>
            </div>
            <div>
              <span>{t("experience_location")}</span>
              <strong className={styles.address}>
                {addressLines.length
                  ? addressLines.map((line) => (
                      <span key={line} className={styles.addressLine}>
                        {line}
                      </span>
                    ))
                  : "—"}
              </strong>
            </div>
          </div>
          <div className={styles.priceRow}>
            <div className={styles.price}>{priceText}</div>
            {item.rating_avg ? <div className={styles.rating}>⭐ {Number(item.rating_avg).toFixed(1)}</div> : null}
          </div>
          {item.activityType === "GROUP" ? (
            <div className={styles.quantityRow}>
              <span>{lang === "en" ? "Seats" : "Locuri"}</span>
              <div className={styles.quantityControls}>
                <button
                  className={styles.qtyButton}
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  aria-label={lang === "en" ? "Decrease seats" : "Scade locuri"}
                >
                  -
                </button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button
                  className={styles.qtyButton}
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(maxQuantity, prev + 1))}
                  disabled={quantity >= maxQuantity}
                  aria-label={lang === "en" ? "Increase seats" : "Creste locuri"}
                >
                  +
                </button>
              </div>
            </div>
          ) : null}
          {error ? <div className={styles.error}>{error}</div> : null}
          <button className="button" type="button" onClick={onBook} disabled={bookingDisabled}>
            {booking ? t("experience_booking") : t("experience_book")}
          </button>
          <button
            className={styles.chatLink}
            type="button"
            onClick={() => bookingInfo?._id && router.push(`/messages/${bookingInfo._id}`)}
            disabled={!chatAllowed}
          >
            {t("chat_open")}
          </button>
          {!chatAllowed ? <div className={styles.chatHint}>{chatDisabledReason}</div> : null}
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.details}>
          <section>
            <h2>{t("experience_about")}</h2>
            <p>{item.description || item.shortDescription || t("experience_details_fallback")}</p>
          </section>
          <section>
            <h2>{t("experience_host")}</h2>
            {item.host?._id ? (
              <Link href={`/hosts/${item.host._id}`} className={styles.hostChip}>
                <span className={styles.hostAvatar}>
                  {item.host?.profilePhoto || item.host?.avatar ? (
                    <img
                      src={item.host.profilePhoto || item.host.avatar}
                      alt={item.host.displayName || item.host.name || "host"}
                    />
                  ) : (
                    (item.host?.displayName || item.host?.name || t("experience_host_fallback"))
                      .slice(0, 1)
                      .toUpperCase()
                  )}
                </span>
                <span>{item.host?.displayName || item.host?.name || t("experience_host_fallback")}</span>
              </Link>
            ) : (
              <div className={styles.hostChip}>
                <span className={styles.hostAvatar}>?</span>
                <span>{item.host?.name || t("experience_host_fallback")}</span>
              </div>
            )}
          </section>
          <section>
            <h2>{t("experience_languages")}</h2>
            <div className={styles.badges}>
              {(item.languages || []).length ? (item.languages || []).map((lang) => (
                <span key={lang} className={styles.badge}>{lang.toUpperCase()}</span>
              )) : <span className={styles.badge}>RO</span>}
            </div>
          </section>
        </div>
      </div>

      <div className={styles.reportRow}>
        <button className={styles.reportButton} type="button" onClick={() => setReportOpen(true)}>
          <span className={styles.reportIcon}>⚠️</span>
          {t("report_experience")}
        </button>
        {reportSuccess ? <div className={styles.reportSuccess}>{reportSuccess}</div> : null}
      </div>

      <ReportModal
        open={reportOpen}
        title={t("report_experience_title")}
        reasonLabel={t("report_reason")}
        reasonPlaceholder={t("report_reason_placeholder")}
        reasonType="text"
        commentLabel={t("report_comment_optional")}
        commentPlaceholder={t("report_comment_placeholder")}
        submitLabel={t("report_submit")}
        cancelLabel={t("report_cancel")}
        submitting={reporting}
        error={reportError}
        onClose={() => setReportOpen(false)}
        onSubmit={onReportExperience}
      />

      {lightboxOpen ? (
        <div className={styles.lightbox} onClick={() => setLightboxOpen(false)}>
          <button className={styles.lightboxClose} type="button" onClick={() => setLightboxOpen(false)}>
            ×
          </button>
          <div
            className={styles.lightboxTrack}
            ref={lightboxRef}
            onScroll={() => handleScroll(lightboxRef)}
            onClick={(event) => event.stopPropagation()}
          >
            {mediaImages.map((img) => (
              <div key={img} className={styles.lightboxSlide}>
                <img src={img} alt={item.title} />
              </div>
            ))}
          </div>
          {mediaImages.length > 1 ? (
            <>
              <button
                type="button"
                className={`${styles.arrow} ${styles.arrowLeft}`}
                onClick={(event) => {
                  event.stopPropagation();
                  scrollToIndex(Math.max(activeIndex - 1, 0), lightboxRef);
                }}
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                type="button"
                className={`${styles.arrow} ${styles.arrowRight}`}
                onClick={(event) => {
                  event.stopPropagation();
                  scrollToIndex(Math.min(activeIndex + 1, mediaImages.length - 1), lightboxRef);
                }}
                aria-label="Next"
              >
                ›
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
