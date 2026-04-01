"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { dedupeBookings } from "@/lib/booking-dedupe";
import { buildCoverObjectPosition } from "@/lib/cover-focus";
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
  coverFocusX?: number;
  coverFocusY?: number;
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
  pricingMode?: "PER_PERSON" | "PER_GROUP" | string;
  groupPackageSize?: number | null;
  isSeries?: boolean;
  seriesId?: string | null;
  seriesSlotsCount?: number;
  seriesAvailableSlots?: number;
  seriesNextStartsAt?: string | null;
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
  paymentConfirmed?: boolean;
  experience?: { _id?: string; title?: string } | string;
  explorer?: { name?: string; email?: string; profilePhoto?: string; avatar?: string };
  host?: { name?: string; email?: string; profilePhoto?: string; avatar?: string };
};

type AvailabilitySlot = {
  _id: string;
  startsAt?: string;
  endsAt?: string;
  startDate?: string;
  endDate?: string;
  city?: string;
  country?: string;
  address?: string;
  availableSpots?: number;
  remainingSpots?: number;
  bookedSpots?: number;
  maxParticipants?: number;
  soldOut?: boolean;
  bookable?: boolean;
};

function ExperienceDetailPageContent() {
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
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [selectedDayKey, setSelectedDayKey] = useState<string>("");
  const [shareNotice, setShareNotice] = useState("");
  const bookingPollRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const shareTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (!item?._id) return;
    trackEvent({
      eventName: "experience_viewed",
      experienceId: item._id,
      hostId: item.host?._id,
      properties: {
        title: item.title,
        price: item.price,
        city: item.city || item.location?.city || "",
      },
    });
  }, [item?._id, item?.city, item?.host?._id, item?.location?.city, item?.price, item?.title]);

  useEffect(() => {
    let active = true;
    if (!item?._id) {
      setAvailabilitySlots([]);
      setSelectedSlotId("");
      return;
    }
    setAvailabilityLoading(true);
    apiGet<{ slots?: AvailabilitySlot[] }>(`/experiences/${item._id}/availability`)
      .then((response) => {
        if (!active) return;
        const slots = (response?.slots || []).slice().sort((a, b) => {
          const aStart = new Date(a.startsAt || a.startDate || 0).getTime();
          const bStart = new Date(b.startsAt || b.startDate || 0).getTime();
          return aStart - bStart;
        });
        setAvailabilitySlots(slots);
        if (!slots.length) {
          setSelectedSlotId("");
          setSelectedDayKey("");
          return;
        }
        setSelectedSlotId((current) => {
          if (current && slots.some((slot) => slot._id === current)) return current;
          const firstBookable = slots.find((slot) => slot.bookable && Number(slot.availableSpots || 0) > 0);
          return firstBookable?._id || slots[0]._id;
        });
      })
      .catch(() => {
        if (!active) return;
        setAvailabilitySlots([]);
        setSelectedSlotId("");
        setSelectedDayKey("");
      })
      .finally(() => {
        if (active) setAvailabilityLoading(false);
      });
    return () => {
      active = false;
    };
  }, [item?._id]);

  useEffect(() => {
    let active = true;
    const loadBooking = async () => {
      if (!user || !item?._id) {
        if (active) setBookingInfo(null);
        return;
      }
      setBookingLoading(true);
      const eligibleExperienceIds = new Set<string>([item._id, ...availabilitySlots.map((slot) => slot._id)]);
      const bookingId = searchParams?.get("bookingId");
      if (bookingId) {
        try {
          const direct = await apiGet<Booking>(`/bookings/${bookingId}`);
          const exp = direct?.experience;
          const expId = typeof exp === "string" ? exp : exp?._id;
          if (expId && eligibleExperienceIds.has(expId) && active) {
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
          candidates.push(...dedupeBookings(hostBookings || []));
        } catch {
          // ignore
        }
      }
      if (role === "EXPLORER" || role === "BOTH") {
        try {
          const myBookings = await apiGet<Booking[]>("/bookings/me");
          candidates.push(...dedupeBookings(myBookings || []));
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
        return !!expId && eligibleExperienceIds.has(expId) && bk.status && allowedStatuses.has(bk.status);
      });
      const fallbackMatch = candidates.find((bk) => {
        const exp = bk.experience;
        const expId = typeof exp === "string" ? exp : exp?._id;
        return !!expId && eligibleExperienceIds.has(expId);
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
  }, [item?._id, user, searchParams, availabilitySlots]);

  const chatAllowed = useMemo(() => {
    if (!bookingInfo?.status && !bookingInfo?.paymentConfirmed) return false;
    if (bookingInfo?.paymentConfirmed) return true;
    return new Set([
      "PAID",
      "COMPLETED",
      "DEPOSIT_PAID",
      "PENDING_ATTENDANCE",
      "AUTO_COMPLETED",
      "NO_SHOW",
      "DISPUTED",
    ]).has(bookingInfo.status || "");
  }, [bookingInfo?.status, bookingInfo?.paymentConfirmed]);

  useEffect(() => {
    const bookingId = searchParams?.get("bookingId");
    if (!bookingId || !bookingInfo?._id || bookingInfo.status === "PAID" || bookingInfo.status === "DEPOSIT_PAID") {
      if (bookingPollRef.current) {
        clearTimeout(bookingPollRef.current);
        bookingPollRef.current = null;
      }
      return;
    }
    const eligibleExperienceIds = new Set<string>([item?._id || "", ...availabilitySlots.map((slot) => slot._id)]);
    bookingPollRef.current = setTimeout(async () => {
      try {
        const refreshed = await apiGet<Booking>(`/bookings/${bookingId}`);
        const exp = refreshed?.experience;
        const expId = typeof exp === "string" ? exp : exp?._id;
        if (expId && eligibleExperienceIds.has(expId)) {
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
  }, [bookingInfo?._id, bookingInfo?.status, item?._id, searchParams, availabilitySlots]);

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

  const selectedSlot = useMemo(
    () => availabilitySlots.find((slot) => slot._id === selectedSlotId) || availabilitySlots[0] || null,
    [availabilitySlots, selectedSlotId]
  );
  useEffect(() => {
    if (!selectedSlot) {
      if (!availabilitySlots.length) setSelectedDayKey("");
      return;
    }
    const slotDateValue = selectedSlot.startsAt || selectedSlot.startDate;
    const slotDate = slotDateValue ? new Date(slotDateValue) : null;
    if (!slotDate || Number.isNaN(slotDate.getTime())) return;
    const dayKey = slotDate.toISOString().slice(0, 10);
    setSelectedDayKey((current) => current || dayKey);
  }, [selectedSlot, availabilitySlots.length]);

  const dayGroups = useMemo(() => {
    const groups = new Map<string, AvailabilitySlot[]>();
    for (const slot of availabilitySlots) {
      const dateValue = slot.startsAt || slot.startDate;
      if (!dateValue) continue;
      const dateObj = new Date(dateValue);
      if (Number.isNaN(dateObj.getTime())) continue;
      const key = dateObj.toISOString().slice(0, 10);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(slot);
    }
    return Array.from(groups.entries())
      .map(([dayKey, slots]) => ({ dayKey, slots }))
      .sort((a, b) => a.dayKey.localeCompare(b.dayKey));
  }, [availabilitySlots]);

  const slotsForSelectedDay = useMemo(() => {
    if (!dayGroups.length) return [];
    const activeDay = selectedDayKey && dayGroups.some((group) => group.dayKey === selectedDayKey)
      ? selectedDayKey
      : dayGroups[0].dayKey;
    const group = dayGroups.find((entry) => entry.dayKey === activeDay);
    return group?.slots || [];
  }, [dayGroups, selectedDayKey]);

  useEffect(() => {
    if (!slotsForSelectedDay.length) return;
    if (selectedSlotId && slotsForSelectedDay.some((slot) => slot._id === selectedSlotId)) return;
    setSelectedSlotId(slotsForSelectedDay[0]._id);
  }, [slotsForSelectedDay, selectedSlotId]);

  const activeExperience = selectedSlot || item;
  const pricingMode = String(item?.pricingMode || "").toUpperCase() === "PER_GROUP" ? "PER_GROUP" : "PER_PERSON";
  const groupPackageSize = Math.max(
    1,
    Number(item?.groupPackageSize) || Number(item?.maxParticipants) || Number(activeExperience?.maxParticipants) || 1
  );
  const totalSeats = activeExperience?.maxParticipants ?? item?.maxParticipants ?? 0;
  const availableSeats =
    typeof activeExperience?.availableSpots === "number"
      ? activeExperience.availableSpots
      : typeof activeExperience?.remainingSpots === "number"
        ? activeExperience.remainingSpots
        : totalSeats;
  const maxQuantity =
    item?.activityType === "GROUP" && pricingMode !== "PER_GROUP"
      ? Math.max(1, availableSeats || totalSeats || 1)
      : 1;

  useEffect(() => {
    if (item?.activityType !== "GROUP") {
      setQuantity(1);
      return;
    }
    if (pricingMode === "PER_GROUP") {
      setQuantity(1);
      return;
    }
    setQuantity((prev) => Math.min(Math.max(prev, 1), maxQuantity));
  }, [item?.activityType, maxQuantity, pricingMode]);

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
    if (item?.isSeries && !selectedSlot?._id) {
      setError(lang === "en" ? "Select a slot first." : "Selectează un slot înainte de rezervare.");
      return;
    }
    if (!user) {
      router.replace(`/login?reason=auth&next=${encodeURIComponent(`/experiences/${item._id}`)}`);
      return;
    }
    if (user?._id && item.host?._id && user._id === item.host._id) {
      setError(t("experience_book_own"));
      return;
    }
    setBooking(true);
    setError("");
    try {
      const targetExperienceId = selectedSlot?._id || item._id;
      const seatCount = item.activityType === "GROUP" ? (pricingMode === "PER_GROUP" ? groupPackageSize : quantity) : 1;
      trackEvent({
        eventName: "booking_started",
        experienceId: targetExperienceId,
        hostId: item.host?._id,
        properties: {
          title: item.title,
          quantity: seatCount,
          pricingMode,
        },
      });
      const res = await apiPost<{ checkoutUrl?: string; bookingId?: string }>("/payments/create-checkout", {
        experienceId: targetExperienceId,
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

  const handleShare = async () => {
    if (!item?._id || typeof window === "undefined") return;
    const origin = window.location.origin.replace(/\/$/, "");
    const shareUrl = `${origin}/experiences/${item._id}`;
    const cityLabel = (item.city || (item.address || "").split(",")[0] || "").trim();
    const shareText = cityLabel ? `${item.title} • ${cityLabel} • LIVADAI` : `${item.title} • LIVADAI`;
    const canUseNativeShare = typeof navigator.share === "function";
    const canUseClipboard = typeof navigator.clipboard?.writeText === "function";
    try {
      const method = canUseNativeShare ? "native" : canUseClipboard ? "clipboard" : "manual";
      if (canUseNativeShare) {
        await navigator.share({ title: item.title, text: shareText, url: shareUrl });
      } else if (canUseClipboard) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setShareNotice(t("share_copied"));
      } else {
        window.prompt(t("share_experience"), `${shareText}\n${shareUrl}`);
      }
      trackEvent({
        eventName: "experience_shared",
        experienceId: item._id,
        hostId: item.host?._id,
        properties: {
          method,
          title: item.title,
        },
      });
    } finally {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
      shareTimeoutRef.current = setTimeout(() => setShareNotice(""), 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    };
  }, []);

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

  const storyText = (item.description || item.shortDescription || t("experience_details_fallback"))
    .replace(/\s+/g, " ")
    .replace(/([,.;!?])(?=\S)/g, "$1 ")
    .trim();
  const storyParagraphs = (() => {
    if (!storyText) return [];
    const words = storyText.split(" ").filter(Boolean);
    if (words.length <= 40) return [storyText];
    const paragraphs: string[] = [];
    let current: string[] = [];
    words.forEach((word, index) => {
      current.push(word);
      const wordCount = current.length;
      const isSentenceEnd = /[.!?]["']?$/.test(word);
      const isSoftBreak = /[,;:]["']?$/.test(word);
      const isLastWord = index === words.length - 1;
      if (
        isLastWord ||
        (wordCount >= 26 && isSentenceEnd) ||
        (wordCount >= 34 && isSoftBreak) ||
        wordCount >= 42
      ) {
        paragraphs.push(current.join(" "));
        current = [];
      }
    });
    if (current.length) paragraphs.push(current.join(" "));
    return paragraphs;
  })();
  const hostLabel = item.host?.displayName || item.host?.name || t("experience_host_fallback");

  const start = activeExperience?.startsAt || activeExperience?.startDate || item.seriesNextStartsAt || item.startsAt || item.startDate;
  const end = activeExperience?.endsAt || activeExperience?.endDate || item.endsAt;
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
  const isFree = !item.price || Number(item.price) <= 0;
  const priceText = isFree
    ? pricingMode === "PER_GROUP"
      ? lang === "en"
        ? `${t("experience_free_label")} / group`
        : `${t("experience_free_label")} / grup`
      : t("experience_free_label")
    : pricingMode === "PER_GROUP"
      ? lang === "en"
        ? `${item.price} ${item.currencyCode || "RON"} / group (${groupPackageSize})`
        : `${item.price} ${item.currencyCode || "RON"} / grup (${groupPackageSize})`
      : `${item.price} ${item.currencyCode || "RON"}`;
  const payableSeats = item.activityType === "GROUP" ? (pricingMode === "PER_GROUP" ? groupPackageSize : quantity) : 1;
  const serviceFeeTotal = payableSeats * 2;
  const serviceFeeTotalLabel = t("experience_service_fee_total").replace("{{amount}}", String(serviceFeeTotal));
  const bookingDisabled =
    booking ||
    (item.isSeries && (!!selectedSlot && !selectedSlot.bookable)) ||
    (item.activityType === "GROUP" &&
      (availableSeats <= 0 || (pricingMode === "PER_GROUP" && availableSeats < groupPackageSize)));
  const chatRequiresAuth = !user;
  const chatDisabledReason = chatRequiresAuth
    ? t("chat_login_prompt")
    : bookingLoading
      ? t("chat_loading_booking")
      : !bookingInfo
        ? t("chat_no_booking")
        : !chatAllowed
          ? t("chat_requires_payment")
          : "";
  const chatActionText = chatAllowed ? t("chat_ready_hint") : chatDisabledReason;
  const shareActionText = shareNotice || t("share_experience_hint");
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
                    <img src={img} alt={item.title} style={img === item.coverImageUrl ? buildCoverObjectPosition(item) : undefined} />
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
          {item.isSeries ? (
            <div className={styles.seriesPicker}>
              <div className={styles.seriesPickerTitle}>
                {lang === "en" ? "Choose day and slot" : "Alege ziua și slotul"}
              </div>
              {availabilityLoading ? (
                <div className={styles.seriesHint}>{lang === "en" ? "Loading slots..." : "Se încarcă sloturile..."}</div>
              ) : dayGroups.length ? (
                <>
                  <div className={styles.dayChips}>
                    {dayGroups.map((group) => {
                      const asDate = new Date(`${group.dayKey}T00:00:00`);
                      const label = asDate.toLocaleDateString(lang === "en" ? "en-US" : "ro-RO", {
                        day: "numeric",
                        month: "short",
                      });
                      const isActiveDay = (selectedDayKey || dayGroups[0]?.dayKey) === group.dayKey;
                      return (
                        <button
                          key={group.dayKey}
                          type="button"
                          className={`${styles.dayChip} ${isActiveDay ? styles.dayChipActive : ""}`}
                          onClick={() => setSelectedDayKey(group.dayKey)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <div className={styles.slotChips}>
                    {slotsForSelectedDay.map((slot) => {
                      const startAt = slot.startsAt || slot.startDate;
                      const startDate = startAt ? new Date(startAt) : null;
                      const slotLabel =
                        startDate && !Number.isNaN(startDate.getTime())
                          ? startDate.toLocaleTimeString(lang === "en" ? "en-US" : "ro-RO", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "—";
                      const isSelected = selectedSlot?._id === slot._id;
                      const isDisabled = !slot.bookable || Number(slot.availableSpots || 0) <= 0;
                      return (
                        <button
                          key={slot._id}
                          type="button"
                          className={`${styles.slotChip} ${isSelected ? styles.slotChipActive : ""}`}
                          onClick={() => setSelectedSlotId(slot._id)}
                          disabled={isDisabled}
                        >
                          {slotLabel}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className={styles.seriesHint}>
                  {lang === "en" ? "No future slots available right now." : "Nu există sloturi viitoare disponibile momentan."}
                </div>
              )}
            </div>
          ) : null}
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
                  ? `${
                      pricingMode === "PER_GROUP"
                        ? lang === "en"
                          ? `Group package: ${groupPackageSize}`
                          : `Pachet grup: ${groupPackageSize}`
                        : formatGroupInfo({ ...item, ...activeExperience }, lang) || "—"
                    }${
                      typeof availableSeats === "number" ? ` · ${t("experience_spots_left").replace("{{count}}", String(availableSeats))}` : ""
                    }`
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
          {isFree ? (
            <div className={styles.serviceFee}>
              <span>{t("experience_service_fee_per_participant")}</span>
              <strong>{serviceFeeTotalLabel}</strong>
            </div>
          ) : null}
          {item.activityType === "GROUP" && pricingMode !== "PER_GROUP" ? (
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
          {item.activityType === "GROUP" && pricingMode === "PER_GROUP" ? (
            <div className={styles.seriesHint}>
              {lang === "en"
                ? `This booking reserves a fixed group package of ${groupPackageSize} participants.`
                : `Această rezervare ocupă un pachet fix de grup de ${groupPackageSize} participanți.`}
            </div>
          ) : null}
          {error ? <div className={styles.error}>{error}</div> : null}
          <div className={styles.refundNotice}>{t("refund_policy_notice")}</div>
          <button className="button" type="button" onClick={onBook} disabled={bookingDisabled}>
            {booking ? t("experience_booking") : t("experience_book")}
          </button>
          {!user ? <div className={styles.guestReserveHint}>{t("guest_reserve_hint")}</div> : null}
          <div className={styles.supportTray}>
            <div className={styles.supportIntro}>
              <div className={styles.supportKicker}>{t("experience_support_kicker")}</div>
              <p className={styles.supportTitle}>{t("experience_support_title")}</p>
            </div>
            <div className={styles.supportActions}>
              <button
                className={`${styles.supportCard} ${!chatRequiresAuth && !chatAllowed ? styles.supportCardMuted : ""}`}
                type="button"
                onClick={() => {
                  trackEvent({
                    eventName: "cta_clicked",
                    ctaName: "chat_with_host",
                    experienceId: item?._id,
                    hostId: item.host?._id,
                    properties: {
                      chatAllowed,
                      requiresAuth: chatRequiresAuth,
                    },
                  });
                  if (chatRequiresAuth) {
                    router.replace(`/login?reason=auth&next=${encodeURIComponent(`/experiences/${item?._id}`)}`);
                    return;
                  }
                  if (bookingInfo?._id && chatAllowed) router.push(`/messages/${bookingInfo._id}`);
                }}
                disabled={!chatRequiresAuth && !chatAllowed}
              >
                <span className={`${styles.supportAccent} ${styles.supportAccentChat}`} aria-hidden="true" />
                <span className={styles.supportCardLabel}>{t("chat_open")}</span>
                <span className={styles.supportCardText}>{chatActionText}</span>
              </button>
              <button
                className={`${styles.supportCard} ${shareNotice ? styles.supportCardSuccess : ""}`}
                type="button"
                onClick={handleShare}
              >
                <span className={`${styles.supportAccent} ${styles.supportAccentShare}`} aria-hidden="true" />
                <span className={styles.supportCardLabel}>{t("share_experience")}</span>
                <span className={styles.supportCardText} aria-live="polite">
                  {shareActionText}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.details}>
          <div className={styles.detailsShell}>
            <section className={styles.storySection}>
              <div className={styles.storyHeader}>
                <h2>{t("experience_about")}</h2>
                {item.shortDescription && item.shortDescription !== item.description ? (
                  <p className={styles.storyLead}>{item.shortDescription}</p>
                ) : null}
              </div>
              <div className={styles.storyBody}>
                {storyParagraphs.map((paragraph, index) => (
                  <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
                ))}
              </div>
            </section>

            <aside className={styles.detailsAside}>
              <section className={styles.infoCard}>
                <div className={styles.infoCardHeader}>
                  <h2>{t("experience_host")}</h2>
                  <span className={styles.infoCardHint}>{t("experience_kicker")}</span>
                </div>
                {item.host?._id ? (
                  <Link href={`/hosts/${item.host._id}`} className={`${styles.hostChip} ${styles.hostCard}`}>
                    <span className={styles.hostAvatar}>
                      {item.host?.profilePhoto || item.host?.avatar ? (
                        <img
                          src={item.host.profilePhoto || item.host.avatar}
                          alt={hostLabel}
                        />
                      ) : (
                        hostLabel.slice(0, 1).toUpperCase()
                      )}
                    </span>
                    <span className={styles.hostMeta}>
                      <span className={styles.hostMetaLabel}>{t("experience_host")}</span>
                      <span className={styles.hostName}>{hostLabel}</span>
                    </span>
                  </Link>
                ) : (
                  <div className={`${styles.hostChip} ${styles.hostCard}`}>
                    <span className={styles.hostAvatar}>?</span>
                    <span className={styles.hostMeta}>
                      <span className={styles.hostMetaLabel}>{t("experience_host")}</span>
                      <span className={styles.hostName}>{hostLabel}</span>
                    </span>
                  </div>
                )}
              </section>

              <section className={styles.infoCard}>
                <div className={styles.infoCardHeader}>
                  <h2>{t("experience_languages")}</h2>
                  <span className={styles.infoCardHint}>
                    {lang === "en" ? "Spoken during the experience" : "Vorbite în timpul experienței"}
                  </span>
                </div>
                <div className={styles.badges}>
                  {(item.languages || []).length ? (item.languages || []).map((lang) => (
                    <span key={lang} className={styles.badge}>{lang.toUpperCase()}</span>
                  )) : <span className={styles.badge}>RO</span>}
                </div>
              </section>

              <section className={`${styles.infoCard} ${styles.reportCard}`}>
                <div className={styles.infoCardHeader}>
                  <h2>{t("report_experience")}</h2>
                  <span className={styles.infoCardHint}>
                    {lang === "en" ? "Let us know if something feels wrong." : "Spune-ne dacă ceva pare în neregulă."}
                  </span>
                </div>
                <button className={styles.reportButton} type="button" onClick={() => setReportOpen(true)}>
                  <span className={styles.reportIcon}>⚠️</span>
                  {t("report_experience")}
                </button>
                {reportSuccess ? <div className={styles.reportSuccess}>{reportSuccess}</div> : null}
              </section>
            </aside>
          </div>
        </div>
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
                <img src={img} alt={item.title} style={img === item.coverImageUrl ? buildCoverObjectPosition(item) : undefined} />
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

export default function ExperienceDetailPage() {
  return (
    <Suspense fallback={<div className="muted">Loading...</div>}>
      <ExperienceDetailPageContent />
    </Suspense>
  );
}
