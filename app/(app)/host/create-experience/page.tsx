"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { DEFAULT_COVER_FOCUS, buildCoverObjectPosition, normalizeCoverFocusValue, resolveCoverFocus } from "@/lib/cover-focus";
import { useLang } from "@/context/lang-context";
import { getMessage, useT } from "@/lib/i18n";
import styles from "./create-experience.module.css";

const EXPERIENCE_CREATED_KEY = "livadai-experience-created";
const TITLE_MAX_LENGTH = 30;
const SHORT_DESCRIPTION_MAX_LENGTH = 50;

const languages = [
  { code: "ro", label: "Română" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "hu", label: "Magyar" },
  { code: "el", label: "Ελληνικά" },
  { code: "tr", label: "Türkçe" },
  { code: "ru", label: "Русский" },
  { code: "uk", label: "Українська" },
  { code: "bg", label: "Български" },
  { code: "sr", label: "Srpski" },
  { code: "hr", label: "Hrvatski" },
  { code: "cs", label: "Čeština" },
  { code: "sk", label: "Slovenčina" },
  { code: "sv", label: "Svenska" },
  { code: "no", label: "Norsk" },
  { code: "fi", label: "Suomi" },
  { code: "da", label: "Dansk" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));

const environmentOptions: { key: "OUTDOOR" | "INDOOR" | "BOTH"; labelKey: string }[] = [
  { key: "OUTDOOR", labelKey: "environment_outdoor" },
  { key: "INDOOR", labelKey: "environment_indoor" },
  { key: "BOTH", labelKey: "environment_both" },
];

const activityOptions: { key: "INDIVIDUAL" | "GROUP"; labelKey: string }[] = [
  { key: "INDIVIDUAL", labelKey: "activity_individual" },
  { key: "GROUP", labelKey: "activity_group" },
];

type GeoSuggestion = {
  label?: string;
  countryCode?: string;
  country?: string;
  city?: string;
  street?: string;
  streetNumber?: string;
  lat?: number;
  lng?: number;
};

type EditableExperienceResponse = Partial<FormState> & {
  startsAt?: string;
  startDate?: string;
  endsAt?: string;
  endDate?: string;
  description?: string;
  longDescription?: string;
  price?: number;
  groupPackageSize?: number;
  maxParticipants?: number;
  durationMinutes?: number;
  recurrenceExcludedDates?: string[];
  latitude?: number | null;
  longitude?: number | null;
};

type StripeHostStatus = {
  stripeAccountId?: string | null;
  isStripeChargesEnabled?: boolean;
  isStripePayoutsEnabled?: boolean;
  isStripeDetailsSubmitted?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
};

type StripeGateState = {
  checking: boolean;
  checked: boolean;
  blocked: boolean;
  title: string;
  message: string;
  actionLabel: string;
};

type FormState = {
  creationMode: "" | "ONE_TIME" | "LONG_TERM";
  title: string;
  shortDescription: string;
  longDescription: string;
  price: string;
  pricingMode: "PER_PERSON" | "PER_GROUP";
  groupPackageSize: string;
  currencyCode: string;
  activityType: "" | "INDIVIDUAL" | "GROUP";
  maxParticipants: number;
  environment: "" | "OUTDOOR" | "INDOOR" | "BOTH";
  startsAt: string;
  endsAt: string;
  recurrenceStartDate: string;
  recurrenceEndDate: string;
  recurrenceWeekdays: number[];
  recurrenceDailyStart: string;
  recurrenceDailyEnd: string;
  recurrenceSlotMinutes: string;
  recurrenceExcludedDates: string[];
  country: string;
  countryCode: string;
  city: string;
  street: string;
  streetNumber: string;
  postalCode: string;
  languages: string[];
  locationLat: number | null;
  locationLng: number | null;
  coverImageUrl: string;
  coverFocusX: number;
  coverFocusY: number;
  images: string[];
  durationMinutes: string;
};

const initialForm: FormState = {
  creationMode: "",
  title: "",
  shortDescription: "",
  longDescription: "",
  price: "",
  pricingMode: "PER_PERSON",
  groupPackageSize: "1",
  currencyCode: "RON",
  activityType: "",
  maxParticipants: 1,
  environment: "",
  startsAt: "",
  endsAt: "",
  recurrenceStartDate: "",
  recurrenceEndDate: "",
  recurrenceWeekdays: [1, 2, 3, 4, 5],
  recurrenceDailyStart: "14:00",
  recurrenceDailyEnd: "22:00",
  recurrenceSlotMinutes: "60",
  recurrenceExcludedDates: [],
  country: "Romania",
  countryCode: "RO",
  city: "",
  street: "",
  streetNumber: "",
  postalCode: "",
  languages: [],
  locationLat: null,
  locationLng: null,
  coverImageUrl: "",
  coverFocusX: DEFAULT_COVER_FOCUS,
  coverFocusY: DEFAULT_COVER_FOCUS,
  images: [],
  durationMinutes: "",
};

const normalizePositiveInteger = (rawValue: string) => {
  const digitsOnly = String(rawValue || "").replace(/\D+/g, "");
  if (!digitsOnly) return 1;
  const normalized = digitsOnly.replace(/^0+/, "");
  const parsed = Number(normalized || "0");
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
};

const clampText = (value: string, maxLength: number) => String(value || "").slice(0, maxLength);

const weekdayOptions = [
  { key: 1, labelKey: "weekday_monday_short" },
  { key: 2, labelKey: "weekday_tuesday_short" },
  { key: 3, labelKey: "weekday_wednesday_short" },
  { key: 4, labelKey: "weekday_thursday_short" },
  { key: 5, labelKey: "weekday_friday_short" },
  { key: 6, labelKey: "weekday_saturday_short" },
  { key: 0, labelKey: "weekday_sunday_short" },
] as const;

const formatPreviewEnvironment = (environment: FormState["environment"], lang: string) => {
  if (environment === "OUTDOOR") return lang === "en" ? "Outdoor" : "Outdoor";
  if (environment === "INDOOR") return lang === "en" ? "Indoor" : "Indoor";
  if (environment === "BOTH") return lang === "en" ? "Both" : "Ambele";
  return "";
};

const formatPreviewPrice = (form: FormState, lang: string) => {
  const isFree = !form.price || Number(form.price) <= 0;
  if (isFree) return lang === "en" ? "Free" : "Gratuit";
  if (form.activityType === "GROUP" && form.pricingMode === "PER_GROUP") {
    const packageSize = Math.max(1, Number(form.groupPackageSize) || Number(form.maxParticipants) || 1);
    return lang === "en"
      ? `${form.price} ${form.currencyCode} / group (${packageSize})`
      : `${form.price} ${form.currencyCode} / grup (${packageSize})`;
  }
  return `${form.price} ${form.currencyCode}`;
};

type CoverFocusEditorProps = {
  imageUrl: string;
  focusX: number;
  focusY: number;
  title: string;
  hint: string;
  resetLabel: string;
  emptyLabel: string;
  onChange: (focusX: number, focusY: number) => void;
  onReset: () => void;
};

function CoverFocusEditor({
  imageUrl,
  focusX,
  focusY,
  title,
  hint,
  resetLabel,
  emptyLabel,
  onChange,
  onReset,
}: CoverFocusEditorProps) {
  const updateFocus = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!imageUrl) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nextX = ((event.clientX - rect.left) / rect.width) * 100;
    const nextY = ((event.clientY - rect.top) / rect.height) * 100;
    onChange(normalizeCoverFocusValue(nextX), normalizeCoverFocusValue(nextY));
  };

  return (
    <div className={styles.coverFocusCard}>
      <div className={styles.coverFocusHeader}>
        <div>
          <div className={styles.coverFocusTitle}>{title}</div>
          <p className={styles.coverFocusHint}>{hint}</p>
        </div>
        <button type="button" className={styles.coverFocusReset} onClick={onReset} disabled={!imageUrl}>
          {resetLabel}
        </button>
      </div>
      <div
        className={styles.coverFocusStage}
        onPointerDown={(event) => {
          updateFocus(event);
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (event.buttons !== 1) return;
          updateFocus(event);
        }}
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="cover focus" style={buildCoverObjectPosition({ coverFocusX: focusX, coverFocusY: focusY })} />
            <div className={styles.coverFocusOverlay} />
            <div className={styles.coverFocusMarker} style={{ left: `${focusX}%`, top: `${focusY}%` }} />
          </>
        ) : (
          <div className={styles.coverFocusEmpty}>{emptyLabel}</div>
        )}
      </div>
    </div>
  );
}

function CreateExperienceContent() {
  const t = useT();
  const { lang } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [images, setImages] = useState<string[]>([]);
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExperience, setLoadingExperience] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [recurrenceExcludedInput, setRecurrenceExcludedInput] = useState("");
  const pageTopRef = useRef<HTMLDivElement | null>(null);
  const pendingStepRef = useRef<number | null>(null);
  const editId = searchParams?.get("edit");
  const isEdit = Boolean(editId);
  const [stripeGate, setStripeGate] = useState<StripeGateState>({
    checking: !isEdit,
    checked: isEdit,
    blocked: false,
    title: "",
    message: "",
    actionLabel: "",
  });

  const buildStripeGateState = (status?: StripeHostStatus | null): StripeGateState => {
    const stripeAccountId = String(status?.stripeAccountId || "").trim();
    const chargesEnabled =
      status?.charges_enabled === undefined ? !!status?.isStripeChargesEnabled : !!status?.charges_enabled;
    const payoutsEnabled =
      status?.payouts_enabled === undefined ? !!status?.isStripePayoutsEnabled : !!status?.payouts_enabled;
    const detailsSubmitted =
      status?.details_submitted === undefined ? !!status?.isStripeDetailsSubmitted : !!status?.details_submitted;

    if (!stripeAccountId) {
      return {
        checking: false,
        checked: true,
        blocked: true,
        title: t("host_wallet_connect_title"),
        message: t("host_wallet_connect_text"),
        actionLabel: t("host_wallet_connect"),
      };
    }

    if (!detailsSubmitted || !chargesEnabled || !payoutsEnabled) {
      return {
        checking: false,
        checked: true,
        blocked: true,
        title: t("host_wallet_activate_title"),
        message: t("host_wallet_activate_text"),
        actionLabel: t("host_wallet_continue"),
      };
    }

    return {
      checking: false,
      checked: true,
      blocked: false,
      title: "",
      message: "",
      actionLabel: "",
    };
  };

  useEffect(() => {
    if (isEdit) {
      setStripeGate({
        checking: false,
        checked: true,
        blocked: false,
        title: "",
        message: "",
        actionLabel: "",
      });
      return;
    }

    let active = true;
    const loadStripeGate = async () => {
      setStripeGate((current) => ({ ...current, checking: true }));
      try {
        const status = await apiGet<StripeHostStatus>("/stripe/debug/host-status");
        if (!active) return;
        setStripeGate(buildStripeGateState(status));
      } catch {
        if (!active) return;
        setStripeGate({
          checking: false,
          checked: true,
          blocked: true,
          title: t("host_wallet_connect_title"),
          message: t("host_wallet_connect_text"),
          actionLabel: t("host_wallet_connect"),
        });
      }
    };

    loadStripeGate();
    return () => {
      active = false;
    };
  }, [isEdit, lang]);

  useEffect(() => {
    let active = true;
    const loadExperience = async () => {
      if (!editId) return;
      setLoadingExperience(true);
      setError("");
      try {
        const exp = await apiGet<EditableExperienceResponse>(`/experiences/${editId}`);
        if (!active || !exp) return;
        const startsAt = exp.startsAt || exp.startDate;
        const endsAt = exp.endsAt || exp.endDate;
        const focus = resolveCoverFocus(exp);
        const toInput = (value?: string) => (value ? new Date(value).toISOString().slice(0, 16) : "");
        setForm({
          creationMode: "ONE_TIME",
          title: exp.title || "",
          shortDescription: exp.shortDescription || "",
          longDescription: exp.description || exp.longDescription || "",
          price: exp.price ? String(exp.price) : "",
          pricingMode: exp.pricingMode === "PER_GROUP" ? "PER_GROUP" : "PER_PERSON",
          groupPackageSize: exp.groupPackageSize ? String(exp.groupPackageSize) : String(exp.maxParticipants || 1),
          currencyCode: exp.currencyCode || "RON",
          activityType: exp.activityType || "INDIVIDUAL",
          maxParticipants: exp.maxParticipants || 1,
          environment: exp.environment || "OUTDOOR",
          startsAt: toInput(startsAt),
          endsAt: toInput(endsAt),
          recurrenceStartDate: "",
          recurrenceEndDate: "",
          recurrenceWeekdays: [1, 2, 3, 4, 5],
          recurrenceDailyStart: "14:00",
          recurrenceDailyEnd: "22:00",
          recurrenceSlotMinutes: exp.durationMinutes ? String(exp.durationMinutes) : "60",
          recurrenceExcludedDates: Array.isArray(exp.recurrenceExcludedDates) ? exp.recurrenceExcludedDates : [],
          country: exp.country || "",
          countryCode: exp.countryCode || "RO",
          city: exp.city || "",
          street: exp.street || "",
          streetNumber: exp.streetNumber || "",
          postalCode: exp.postalCode || "",
          languages: exp.languages || [],
          locationLat: exp.locationLat ?? exp.latitude ?? null,
          locationLng: exp.locationLng ?? exp.longitude ?? null,
          coverImageUrl: exp.coverImageUrl || "",
          coverFocusX: focus.x,
          coverFocusY: focus.y,
          images: exp.images || [],
          durationMinutes: exp.durationMinutes ? String(exp.durationMinutes) : "",
        });
        setImages(exp.images || []);
      } catch (err) {
        setError((err as Error).message || getMessage(lang, "create_experience_error"));
      } finally {
        if (active) setLoadingExperience(false);
      }
    };
    loadExperience();
    return () => {
      active = false;
    };
  }, [editId, lang]);

  const toggleLanguage = (code: string) => {
    setForm((f) => {
      const exists = f.languages.includes(code);
      return { ...f, languages: exists ? f.languages.filter((l) => l !== code) : [...f.languages, code] };
    });
  };

  const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setCoverFocus = (coverFocusX: number, coverFocusY: number) =>
    setForm((f) => ({
      ...f,
      coverFocusX: normalizeCoverFocusValue(coverFocusX),
      coverFocusY: normalizeCoverFocusValue(coverFocusY),
    }));

  const resetCoverFocus = () => setCoverFocus(DEFAULT_COVER_FOCUS, DEFAULT_COVER_FOCUS);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!addressQuery || addressQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      apiGet<GeoSuggestion[]>(`/geo/search?query=${encodeURIComponent(addressQuery)}`)
        .then((data) => setSuggestions(data || []))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [addressQuery]);

  const selectSuggestion = (s: GeoSuggestion) => {
    setAddressQuery(s.label || "");
    setSuggestions([]);
    const isRomania = s.countryCode === "RO" || (s.country || "").toLowerCase().includes("rom");
    const nextCountryCode = isRomania ? "RO" : s.countryCode || "NON_RO";
    setForm((f) => ({
      ...f,
      country: s.country || f.country,
      countryCode: nextCountryCode,
      city: s.city || f.city,
      street: s.street || f.street,
      streetNumber: s.streetNumber || f.streetNumber,
      locationLat: s.lat || null,
      locationLng: s.lng || null,
    }));
  };

  const toggleWeekday = (weekday: number) => {
    setForm((f) => {
      const exists = f.recurrenceWeekdays.includes(weekday);
      if (exists) {
        return { ...f, recurrenceWeekdays: f.recurrenceWeekdays.filter((d) => d !== weekday) };
      }
      return { ...f, recurrenceWeekdays: [...f.recurrenceWeekdays, weekday].sort((a, b) => a - b) };
    });
  };

  const computeRecurringOccurrences = (options: {
    recurrenceStartDate: string;
    recurrenceEndDate: string;
    recurrenceWeekdays: number[];
    recurrenceDailyStart: string;
    recurrenceDailyEnd: string;
    recurrenceSlotMinutes: string;
    recurrenceExcludedDates: string[];
  }) => {
    const {
      recurrenceStartDate,
      recurrenceEndDate,
      recurrenceWeekdays,
      recurrenceDailyStart,
      recurrenceDailyEnd,
      recurrenceSlotMinutes,
      recurrenceExcludedDates,
    } = options;
    if (
      !recurrenceStartDate ||
      !recurrenceEndDate ||
      !recurrenceDailyStart ||
      !recurrenceDailyEnd ||
      !recurrenceWeekdays.length
    ) {
      return [];
    }
    const slotMinutes = Number(recurrenceSlotMinutes);
    if (!Number.isFinite(slotMinutes) || slotMinutes < 15) return [];
    const excludedDateSet = new Set((recurrenceExcludedDates || []).filter(Boolean));

    const startDate = new Date(`${recurrenceStartDate}T00:00:00`);
    const endDate = new Date(`${recurrenceEndDate}T00:00:00`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) return [];

    const [startHour, startMinute] = recurrenceDailyStart.split(":").map((value) => Number(value));
    const [endHour, endMinute] = recurrenceDailyEnd.split(":").map((value) => Number(value));
    if (
      [startHour, startMinute, endHour, endMinute].some((value) => Number.isNaN(value)) ||
      endHour * 60 + endMinute <= startHour * 60 + startMinute
    ) {
      return [];
    }

    const now = Date.now();
    const occurrences: Array<{ startsAt: string; endsAt: string; durationMinutes: number }> = [];
    for (const cursor = new Date(startDate); cursor <= endDate; cursor.setDate(cursor.getDate() + 1)) {
      const dayKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(
        cursor.getDate()
      ).padStart(2, "0")}`;
      if (excludedDateSet.has(dayKey)) continue;
      const dayOfWeek = cursor.getDay();
      if (!recurrenceWeekdays.includes(dayOfWeek)) continue;

      const daySlotStart = new Date(cursor);
      daySlotStart.setHours(startHour, startMinute, 0, 0);
      const daySlotEnd = new Date(cursor);
      daySlotEnd.setHours(endHour, endMinute, 0, 0);

      for (let slotStart = new Date(daySlotStart); slotStart < daySlotEnd; ) {
        const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000);
        if (slotEnd > daySlotEnd) break;
        if (slotStart.getTime() > now) {
          occurrences.push({
            startsAt: slotStart.toISOString(),
            endsAt: slotEnd.toISOString(),
            durationMinutes: slotMinutes,
          });
        }
        slotStart = slotEnd;
      }
    }

    return occurrences;
  };

  const addExcludedDate = () => {
    const value = String(recurrenceExcludedInput || "").trim();
    if (!value) return;
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return;
    setForm((f) => {
      if (f.recurrenceExcludedDates.includes(value)) return f;
      return {
        ...f,
        recurrenceExcludedDates: [...f.recurrenceExcludedDates, value].sort((a, b) => a.localeCompare(b)),
      };
    });
    setRecurrenceExcludedInput("");
  };

  const removeExcludedDate = (value: string) => {
    setForm((f) => ({
      ...f,
      recurrenceExcludedDates: f.recurrenceExcludedDates.filter((day) => day !== value),
    }));
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/media/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  };

  const onPickImages = async (files: File[]) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const url = await uploadFile(file);
        if (url) uploaded.push(url);
      }
      setImages((prev) => [...prev, ...uploaded]);
      if (!form.coverImageUrl && uploaded[0]) {
        setForm((f) => ({
          ...f,
          coverImageUrl: uploaded[0],
          coverFocusX: DEFAULT_COVER_FOCUS,
          coverFocusY: DEFAULT_COVER_FOCUS,
        }));
      }
    } catch {
      setError(t("create_experience_upload_error"));
    } finally {
      setUploading(false);
    }
  };

  const onPickCoverImage = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadFile(file);
      if (!url) return;
      setForm((f) => ({
        ...f,
        coverImageUrl: url,
        coverFocusX: DEFAULT_COVER_FOCUS,
        coverFocusY: DEFAULT_COVER_FOCUS,
      }));
      setImages((prev) => (prev.includes(url) ? prev : [url, ...prev]));
    } catch {
      setError(t("create_experience_upload_error"));
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedImage = (url: string) => {
    setImages((prev) => {
      const next = prev.filter((img) => img !== url);
      setForm((f) => ({
        ...f,
        coverImageUrl: f.coverImageUrl === url ? next[0] || "" : f.coverImageUrl,
        coverFocusX: f.coverImageUrl === url ? DEFAULT_COVER_FOCUS : f.coverFocusX,
        coverFocusY: f.coverImageUrl === url ? DEFAULT_COVER_FOCUS : f.coverFocusY,
      }));
      return next;
    });
  };

  const moveUploadedImage = (url: string, direction: "left" | "right") => {
    setImages((prev) => {
      const index = prev.indexOf(url);
      if (index === -1) return prev;
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const scheduleState = useMemo(() => {
    const hasStart = !!form.startsAt;
    const hasEnd = !!form.endsAt;
    const endAfterStart =
      hasStart && hasEnd ? new Date(form.endsAt).getTime() > new Date(form.startsAt).getTime() : true;
    return { hasStart, hasEnd, endAfterStart };
  }, [form.endsAt, form.startsAt]);

  const recurringOccurrences = useMemo(
    () =>
      computeRecurringOccurrences({
        recurrenceStartDate: form.recurrenceStartDate,
        recurrenceEndDate: form.recurrenceEndDate,
        recurrenceWeekdays: form.recurrenceWeekdays,
        recurrenceDailyStart: form.recurrenceDailyStart,
        recurrenceDailyEnd: form.recurrenceDailyEnd,
        recurrenceSlotMinutes: form.recurrenceSlotMinutes,
        recurrenceExcludedDates: form.recurrenceExcludedDates,
      }),
    [
      form.recurrenceStartDate,
      form.recurrenceEndDate,
      form.recurrenceWeekdays,
      form.recurrenceDailyStart,
      form.recurrenceDailyEnd,
      form.recurrenceSlotMinutes,
      form.recurrenceExcludedDates,
    ]
  );

  const recurringState = useMemo(() => {
    const hasPeriodStart = !!form.recurrenceStartDate;
    const hasPeriodEnd = !!form.recurrenceEndDate;
    const periodOrder =
      hasPeriodStart && hasPeriodEnd
        ? new Date(`${form.recurrenceEndDate}T00:00:00`).getTime() >=
          new Date(`${form.recurrenceStartDate}T00:00:00`).getTime()
        : true;
    const hasTimeStart = !!form.recurrenceDailyStart;
    const hasTimeEnd = !!form.recurrenceDailyEnd;
    const startMinutes = hasTimeStart
      ? Number(form.recurrenceDailyStart.split(":")[0]) * 60 + Number(form.recurrenceDailyStart.split(":")[1])
      : null;
    const endMinutes = hasTimeEnd
      ? Number(form.recurrenceDailyEnd.split(":")[0]) * 60 + Number(form.recurrenceDailyEnd.split(":")[1])
      : null;
    const timeOrder = startMinutes !== null && endMinutes !== null ? endMinutes > startMinutes : true;
    const slotMinutes = Number(form.recurrenceSlotMinutes);
    const slotValid = Number.isFinite(slotMinutes) && slotMinutes >= 15;
    const hasDays = form.recurrenceWeekdays.length > 0;
    const hasFutureSlots = recurringOccurrences.length > 0;
    const limitOk = recurringOccurrences.length <= 240;
    return {
      hasPeriodStart,
      hasPeriodEnd,
      periodOrder,
      hasTimeStart,
      hasTimeEnd,
      timeOrder,
      slotValid,
      hasDays,
      hasFutureSlots,
      limitOk,
    };
  }, [
    form.recurrenceStartDate,
    form.recurrenceEndDate,
    form.recurrenceDailyStart,
    form.recurrenceDailyEnd,
    form.recurrenceSlotMinutes,
    form.recurrenceWeekdays,
    recurringOccurrences.length,
  ]);

  const hasCreationMode = form.creationMode === "ONE_TIME" || form.creationMode === "LONG_TERM";
  const hasActivityType = form.activityType === "INDIVIDUAL" || form.activityType === "GROUP";
  const hasEnvironment = form.environment === "OUTDOOR" || form.environment === "INDOOR" || form.environment === "BOTH";
  const hasLanguages = form.languages.length > 0;

  const canProceed = useMemo(() => {
    if (step === 1) {
      return (
        !!form.title.trim() &&
        !!form.shortDescription.trim() &&
        !!form.longDescription.trim() &&
        hasCreationMode &&
        hasActivityType &&
        hasEnvironment &&
        hasLanguages
      );
    }
    if (step === 2) {
      if (!isEdit && form.creationMode === "LONG_TERM") {
        return (
          recurringState.hasPeriodStart &&
          recurringState.hasPeriodEnd &&
          recurringState.periodOrder &&
          recurringState.hasTimeStart &&
          recurringState.hasTimeEnd &&
          recurringState.timeOrder &&
          recurringState.slotValid &&
          recurringState.hasDays &&
          recurringState.hasFutureSlots &&
          recurringState.limitOk &&
          form.city
        );
      }
      return scheduleState.hasStart && scheduleState.hasEnd && scheduleState.endAfterStart && form.city;
    }
    if (step === 3 && form.activityType === "GROUP" && form.pricingMode === "PER_GROUP") {
      const packageSize = Math.max(1, Number(form.groupPackageSize) || 1);
      const maxParticipants = Math.max(1, Number(form.maxParticipants) || 1);
      return packageSize <= maxParticipants;
    }
    return true;
  }, [form, step, scheduleState, recurringState, isEdit, hasCreationMode, hasActivityType, hasEnvironment, hasLanguages]);

  const scrollWizardToTop = () => {
    if (typeof window === "undefined") return;
    const target = pageTopRef.current;
    if (!target) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      return;
    }

    target.focus({ preventScroll: true });
    const absoluteTop = target.getBoundingClientRect().top + window.scrollY - 24;
    const top = Math.max(0, absoluteTop);
    window.scrollTo({ top, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = top;
    document.body.scrollTop = top;
  };

  useLayoutEffect(() => {
    if (step <= 1) return;
    if (pendingStepRef.current !== null && pendingStepRef.current !== step) return;
    scrollWizardToTop();
    const frame = window.requestAnimationFrame(scrollWizardToTop);
    const timeout = window.setTimeout(() => {
      scrollWizardToTop();
      pendingStepRef.current = null;
    }, 180);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [step]);

  const moveToStep = (nextStep: number) => {
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    pendingStepRef.current = nextStep;
    scrollWizardToTop();
    setStep(nextStep);
  };

  const scheduleErrorText = useMemo(() => {
    if (!isEdit && form.creationMode === "LONG_TERM") {
      if (!recurringState.hasPeriodStart || !recurringState.hasPeriodEnd) return t("create_experience_recurrence_period_required");
      if (!recurringState.periodOrder) return t("create_experience_recurrence_period_order");
      if (!recurringState.hasDays) return t("create_experience_recurrence_days_required");
      if (!recurringState.hasTimeStart || !recurringState.hasTimeEnd) return t("create_experience_recurrence_time_required");
      if (!recurringState.timeOrder) return t("create_experience_recurrence_time_order");
      if (!recurringState.slotValid) return t("create_experience_recurrence_slot_invalid");
      if (!recurringState.hasFutureSlots) return t("create_experience_recurrence_no_slots");
      if (!recurringState.limitOk) return t("create_experience_recurrence_limit");
      return "";
    }
    if (!scheduleState.hasStart) return t("create_experience_schedule_required");
    if (!scheduleState.hasEnd) return t("create_experience_schedule_required");
    if (!scheduleState.endAfterStart) return t("create_experience_schedule_order");
    return "";
  }, [scheduleState, t, isEdit, form.creationMode, recurringState]);

  const formatDuration = (minutesValue: string) => {
    const minutes = Number(minutesValue);
    if (!minutes || Number.isNaN(minutes)) return "";
    const isEn = lang === "en";
    const units = isEn
      ? { min: "min", hour: "hour", hours: "hours", day: "day", days: "days" }
      : { min: "min", hour: "oră", hours: "ore", day: "zi", days: "zile" };
    if (minutes < 60) return `${minutes} ${units.min}`;
    if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const hoursLabel = hours === 1 ? units.hour : units.hours;
      return mins ? `${hours} ${hoursLabel} ${mins} ${units.min}` : `${hours} ${hoursLabel}`;
    }
    const days = Math.floor(minutes / 1440);
    const remaining = minutes % 1440;
    const hours = Math.floor(remaining / 60);
    const daysLabel = days === 1 ? units.day : units.days;
    const hoursLabel = hours === 1 ? units.hour : units.hours;
    return hours ? `${days} ${daysLabel} ${hours} ${hoursLabel}` : `${days} ${daysLabel}`;
  };

  useEffect(() => {
    if (!isEdit && form.creationMode === "LONG_TERM") {
      setForm((f) => ({ ...f, durationMinutes: f.recurrenceSlotMinutes || f.durationMinutes }));
      return;
    }
    if (!form.startsAt || !form.endsAt) {
      setForm((f) => ({ ...f, durationMinutes: "" }));
      return;
    }
    const start = new Date(form.startsAt).getTime();
    const end = new Date(form.endsAt).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      setForm((f) => ({ ...f, durationMinutes: "" }));
      return;
    }
    const diffMinutes = Math.round((end - start) / 60000);
    setForm((f) => ({ ...f, durationMinutes: diffMinutes ? String(diffMinutes) : "" }));
  }, [form.startsAt, form.endsAt, form.creationMode, form.recurrenceSlotMinutes, isEdit]);

  const onSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!isEdit && stripeGate.blocked) {
        setError(stripeGate.message);
        setLoading(false);
        return;
      }
      if (scheduleErrorText) {
        setError(scheduleErrorText);
        setLoading(false);
        return;
      }
      if (!hasCreationMode || !hasActivityType || !hasEnvironment || !hasLanguages) {
        setError(t("create_experience_step_1_required_options"));
        setLoading(false);
        return;
      }
      const selectedCreationMode = form.creationMode;
      const selectedActivityType = form.activityType;
      const selectedEnvironment = form.environment;
      const isFree = !form.price || Number(form.price) <= 0;
      const coverFocus = resolveCoverFocus(form);
      const basePayload = {
        title: form.title,
        shortDescription: form.shortDescription,
        description: form.longDescription,
        price: isFree ? 0 : Number(form.price),
        currencyCode: form.currencyCode,
        activityType: selectedActivityType,
        maxParticipants: selectedActivityType === "GROUP" ? Number(form.maxParticipants) || 1 : 1,
        pricingMode: selectedActivityType === "GROUP" ? form.pricingMode : "PER_PERSON",
        groupPackageSize:
          selectedActivityType === "GROUP" && form.pricingMode === "PER_GROUP"
            ? Math.max(1, Number(form.groupPackageSize) || Number(form.maxParticipants) || 1)
            : null,
        environment: selectedEnvironment,
        country: form.country,
        countryCode: form.countryCode,
        city: form.city,
        street: form.street,
        streetNumber: form.streetNumber,
        postalCode: form.postalCode,
        languages: form.languages,
        locationLat: form.locationLat,
        locationLng: form.locationLng,
        coverImageUrl: form.coverImageUrl || images[0] || "",
        coverFocusX: coverFocus.x,
        coverFocusY: coverFocus.y,
        mainImageUrl: form.coverImageUrl || images[0] || "",
        images,
      };
      if (isEdit && editId) {
        const primaryImage = form.coverImageUrl || images[0] || "";
        await apiPatch(`/experiences/${editId}`, {
          title: form.title,
          shortDescription: form.shortDescription,
          description: form.longDescription,
          coverImageUrl: primaryImage,
          coverFocusX: coverFocus.x,
          coverFocusY: coverFocus.y,
          mainImageUrl: primaryImage,
          images,
        });
        router.replace("/host/hosted-experiences");
      } else if (selectedCreationMode === "LONG_TERM") {
        const slotMinutes = Number(form.recurrenceSlotMinutes);
        await apiPost("/experiences/bulk", {
          ...basePayload,
          scheduleType: "LONG_TERM",
          durationMinutes: slotMinutes,
          recurrenceExcludedDates: form.recurrenceExcludedDates,
          occurrences: recurringOccurrences,
        });
        window.localStorage.setItem(EXPERIENCE_CREATED_KEY, "1");
        router.replace("/experiences");
      } else {
        const startsAtIso = form.startsAt ? new Date(form.startsAt).toISOString() : undefined;
        const endsAtIso = form.endsAt ? new Date(form.endsAt).toISOString() : undefined;
        await apiPost("/experiences", {
          ...basePayload,
          startsAt: startsAtIso,
          endsAt: endsAtIso,
          durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        });
        window.localStorage.setItem(EXPERIENCE_CREATED_KEY, "1");
        router.replace("/experiences");
      }
    } catch (err) {
      setError((err as Error).message || t("create_experience_error"));
    } finally {
      setLoading(false);
    }
  };

  const editCoverImage = form.coverImageUrl || images[0] || "";
  const coverFocus = resolveCoverFocus(form);
  const goToWallet = () => router.push("/host/wallet");
  const previewCoverImage = form.coverImageUrl || images[0] || "";
  const previewTitle = form.title.trim() || (lang === "en" ? "Your experience title" : "Titlul experienței tale");
  const previewShortDescription =
    form.shortDescription.trim() || (lang === "en" ? "Short description shown in cards." : "Descrierea scurtă afișată pe carduri.");
  const previewLocation = [form.city.trim(), form.country.trim() || "Romania"].filter(Boolean).join(" ");
  const previewLanguages = form.languages.slice(0, 2).join(" · ") || (lang === "en" ? "Languages" : "Limbi");
  const previewEnvironment = formatPreviewEnvironment(form.environment, lang) || (lang === "en" ? "Environment" : "Mediu");
  const previewSeats = `${Math.max(0, Number(form.maxParticipants) || 0)}/${Math.max(1, Number(form.maxParticipants) || 1)}`;
  const previewPrice = formatPreviewPrice(form, lang);
  const isFreePrice = !form.price || Number(form.price) <= 0;
  const handleNextStep = () => {
    if (stripeGate.blocked) {
      setError(stripeGate.message);
      return;
    }
    if (!canProceed) {
      setError(step === 1 ? t("create_experience_step_1_required_options") : scheduleErrorText || "");
      return;
    }
    setError("");
    moveToStep(step + 1);
  };

  if (isEdit) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <div className={styles.kicker}>{t("create_experience_kicker")}</div>
            <h1>{t("edit_experience_title")}</h1>
            <p>{t("edit_experience_subtitle")}</p>
          </div>
        </div>

        {loadingExperience ? (
          <div className="muted">{t("common_loading_experiences")}</div>
        ) : (
          <>
            <div className={styles.lockedNotice}>{t("edit_experience_locked")}</div>

            <div className={styles.card}>
              <h2>{t("create_experience_step_1")}</h2>
              <div className={styles.grid}>
                <div>
                  <label>{t("create_experience_label_title")}</label>
                  <input
                    className="input"
                    value={form.title}
                    maxLength={TITLE_MAX_LENGTH}
                    onChange={(e) => onChange("title", clampText(e.target.value, TITLE_MAX_LENGTH))}
                  />
                  <div className={styles.fieldCounter}>{`${form.title.length}/${TITLE_MAX_LENGTH}`}</div>
                </div>
                <div>
                  <label>{t("create_experience_label_short")}</label>
                  <input
                    className="input"
                    value={form.shortDescription}
                    maxLength={SHORT_DESCRIPTION_MAX_LENGTH}
                    onChange={(e) => onChange("shortDescription", clampText(e.target.value, SHORT_DESCRIPTION_MAX_LENGTH))}
                  />
                  <div className={styles.fieldCounter}>{`${form.shortDescription.length}/${SHORT_DESCRIPTION_MAX_LENGTH}`}</div>
                </div>
                <div className={styles.full}>
                  <label>{t("create_experience_label_long")}</label>
                  <textarea
                    className={styles.textarea}
                    value={form.longDescription}
                    onChange={(e) => onChange("longDescription", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2>{t("edit_experience_media_title")}</h2>
              <div className={styles.grid}>
                <div className={styles.full}>
                  <label>{t("create_experience_cover_photo")}</label>
                  <div className={styles.coverRow}>
                    <label className={styles.coverPicker}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onPickCoverImage(file);
                        }}
                      />
                      <span>{t("create_experience_cover_upload")}</span>
                    </label>
                    <div className={styles.coverPreview}>
                      {editCoverImage ? (
                        <img src={editCoverImage} alt="cover" style={buildCoverObjectPosition(form)} />
                      ) : (
                        <div className={styles.coverPlaceholder}>{t("create_experience_cover_empty")}</div>
                      )}
                    </div>
                  </div>
                  <CoverFocusEditor
                    imageUrl={editCoverImage}
                    focusX={coverFocus.x}
                    focusY={coverFocus.y}
                    title={t("create_experience_cover_focus_title")}
                    hint={t("create_experience_cover_focus_hint")}
                    resetLabel={t("create_experience_cover_focus_reset")}
                    emptyLabel={t("create_experience_cover_empty")}
                    onChange={setCoverFocus}
                    onReset={resetCoverFocus}
                  />
                </div>

                <div className={styles.full}>
                  <label>{t("create_experience_upload_images")}</label>
                  <div
                    className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const files = Array.from(e.dataTransfer.files || []).filter((file) => file.type.startsWith("image/"));
                      onPickImages(files);
                    }}
                  >
                    <input
                      className={styles.file}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => onPickImages(Array.from(e.target.files || []))}
                    />
                    <div className={styles.dropzoneText}>
                      <strong>{t("create_experience_drop_title")}</strong>
                      <span>{t("create_experience_drop_sub")}</span>
                    </div>
                  </div>
                  {uploading ? <div className="muted">{t("create_experience_uploading")}</div> : null}
                  {images.length ? (
                    <div className={styles.imageGrid}>
                      {images.map((img, index) => (
                        <div key={img} className={styles.imageThumb}>
                          <div className={styles.imageThumbMeta}>
                            <span className={styles.imageOrderBadge}>{index + 1}</span>
                            {form.coverImageUrl === img ? (
                              <span className={styles.imageCoverBadge}>{t("create_experience_cover_badge")}</span>
                            ) : null}
                          </div>
                          <img src={img} alt="upload" />
                          <div className={styles.imageThumbActions}>
                            <button
                              type="button"
                              className={styles.imageActionBtn}
                              onClick={() => moveUploadedImage(img, "left")}
                              disabled={index === 0}
                            >
                              {t("create_experience_image_move_left")}
                            </button>
                            <button
                              type="button"
                              className={styles.imageActionBtn}
                              onClick={() => moveUploadedImage(img, "right")}
                              disabled={index === images.length - 1}
                            >
                              {t("create_experience_image_move_right")}
                            </button>
                            <button type="button" className={styles.removeImageBtn} onClick={() => removeUploadedImage(img)}>
                              {t("edit_experience_remove_image")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              {error ? <div className={styles.error}>{error}</div> : null}
              {success ? <div className={styles.success}>{success}</div> : null}
              <div className={styles.footerActions}>
                <button className="button secondary" type="button" onClick={() => router.push("/host/hosted-experiences")}>
                  {t("create_experience_back")}
                </button>
                <button className="button" type="button" onClick={onSubmit} disabled={loading || uploading}>
                  {loading ? t("common_publishing") : t("edit_experience_save")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header} ref={pageTopRef} tabIndex={-1}>
        <div>
          <div className={styles.kicker}>{t("create_experience_kicker")}</div>
          <h1>{isEdit ? t("edit_experience_title") : t("create_experience_title")}</h1>
          <p>{isEdit ? t("edit_experience_subtitle") : t("create_experience_subtitle")}</p>
        </div>
        <div className={styles.steps}>
          {[1, 2, 3].map((s) => (
            <div key={s} className={`${styles.step} ${step === s ? styles.active : ""}`}>
              {s}
            </div>
          ))}
        </div>
      </div>

      {stripeGate.blocked ? (
        <div className={styles.stripeGateCard}>
          <div>
            <div className={styles.stripeGateTitle}>{stripeGate.title}</div>
            <p className={styles.stripeGateText}>{stripeGate.message}</p>
          </div>
          <button className="button" type="button" onClick={goToWallet}>
            {stripeGate.actionLabel}
          </button>
        </div>
      ) : null}

      {loadingExperience ? (
        <div className="muted">{t("common_loading_experiences")}</div>
      ) : step === 1 ? (
        <div className={styles.card}>
          <div className={styles.stepMain}>
              <div className={styles.stepIntro}>
                <div>
                  <h2>{t("create_experience_step_1")}</h2>
                  <p>{t("create_experience_step_1_intro")}</p>
                </div>
              </div>

              <section className={styles.stepSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <h3>{t("create_experience_story_title")}</h3>
                    <p>{t("create_experience_story_hint")}</p>
                  </div>
                </div>
                <div className={styles.grid}>
                  <div className={styles.fieldGroup}>
                    <label>{t("create_experience_label_title")}</label>
                    <input
                      className="input"
                      value={form.title}
                      maxLength={TITLE_MAX_LENGTH}
                      onChange={(e) => onChange("title", clampText(e.target.value, TITLE_MAX_LENGTH))}
                    />
                    <div className={styles.fieldCounter}>{`${form.title.length}/${TITLE_MAX_LENGTH}`}</div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label>{t("create_experience_label_short")}</label>
                    <input
                      className="input"
                      value={form.shortDescription}
                      maxLength={SHORT_DESCRIPTION_MAX_LENGTH}
                      onChange={(e) => onChange("shortDescription", clampText(e.target.value, SHORT_DESCRIPTION_MAX_LENGTH))}
                    />
                    <div className={styles.fieldCounter}>{`${form.shortDescription.length}/${SHORT_DESCRIPTION_MAX_LENGTH}`}</div>
                  </div>
                  <div className={`${styles.fieldGroup} ${styles.full}`}>
                    <label>{t("create_experience_label_long")}</label>
                    <textarea
                      className={styles.textarea}
                      value={form.longDescription}
                      onChange={(e) => onChange("longDescription", e.target.value)}
                      placeholder={
                        lang === "en"
                          ? "You can also include links like https://example.com or www.example.com"
                          : "Poți include și linkuri ca https://exemplu.ro sau www.exemplu.ro"
                      }
                    />
                  </div>
                </div>
              </section>

              {!isEdit ? (
                <section className={styles.stepSection}>
                  <div className={styles.sectionHeading}>
                    <div>
                      <h3>{t("create_experience_format_title")}</h3>
                      <p>{t("create_experience_format_hint")}</p>
                    </div>
                  </div>
                  <div className={styles.optionsRow}>
                    <div className={styles.optionCard}>
                      <label>{t("create_experience_mode_label")}</label>
                      <div className={styles.chips}>
                        <button
                          type="button"
                          className={`${styles.chip} ${form.creationMode === "ONE_TIME" ? styles.chipActive : ""}`}
                          onClick={() => onChange("creationMode", "ONE_TIME")}
                        >
                          {t("create_experience_mode_single")}
                        </button>
                        <button
                          type="button"
                          className={`${styles.chip} ${form.creationMode === "LONG_TERM" ? styles.chipActive : ""}`}
                          onClick={() => onChange("creationMode", "LONG_TERM")}
                        >
                          {t("create_experience_mode_long_term")}
                        </button>
                      </div>
                      <p className={styles.modeHint}>
                        {!hasCreationMode
                          ? t("create_experience_mode_select_hint")
                          : form.creationMode === "ONE_TIME"
                          ? t("create_experience_mode_single_hint")
                          : t("create_experience_mode_long_term_hint")}
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              <section className={styles.stepSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <h3>{t("create_experience_hosting_title")}</h3>
                    <p>{t("create_experience_hosting_hint")}</p>
                  </div>
                </div>
                <div className={styles.optionsRow}>
                  <div className={styles.optionCard}>
                    <label>{t("create_experience_activity")}</label>
                    <div className={styles.chips}>
                      {activityOptions.map((o) => (
                        <button
                          type="button"
                          key={o.key}
                          className={`${styles.chip} ${form.activityType === o.key ? styles.chipActive : ""}`}
                          onClick={() => onChange("activityType", o.key)}
                        >
                          {t(o.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {form.activityType === "GROUP" ? (
                    <div className={`${styles.optionCard} ${styles.compactFieldCard}`}>
                      <label>{t("create_experience_group_max")}</label>
                      <input
                        className="input"
                        type="number"
                        min={1}
                        value={String(form.maxParticipants).replace(/^0+(?=\d)/, "")}
                        onChange={(e) => onChange("maxParticipants", normalizePositiveInteger(e.target.value))}
                      />
                    </div>
                  ) : null}
                  <div className={styles.optionCard}>
                    <label>{t("create_experience_environment")}</label>
                    <div className={styles.chips}>
                      {environmentOptions.map((o) => (
                        <button
                          type="button"
                          key={o.key}
                          className={`${styles.chip} ${form.environment === o.key ? styles.chipActive : ""}`}
                          onClick={() => onChange("environment", o.key as FormState["environment"])}
                        >
                          {t(o.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.languagesCard}>
                  <div className={styles.languagesHead}>
                    <label>{t("create_experience_languages")}</label>
                    <span>{form.languages.length}</span>
                  </div>
                  <div className={styles.langGrid}>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        className={`${styles.langChip} ${form.languages.includes(lang.code) ? styles.chipActive : ""}`}
                        onClick={() => toggleLanguage(lang.code)}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                  {!hasLanguages ? <div className={styles.scheduleError}>{t("create_experience_languages_required")}</div> : null}
                </div>
              </section>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className={styles.card}>
          <div className={styles.stepMain}>
            <div className={styles.stepIntro}>
              <div>
                <h2>{t("create_experience_step_2")}</h2>
                <p>
                  {lang === "en"
                    ? "Set the timing first, then the exact place where people will arrive."
                    : "Setează mai întâi programul, apoi locul exact în care vor ajunge oamenii."}
                </p>
              </div>
            </div>

            {!isEdit && form.creationMode === "LONG_TERM" ? (
              <>
                <section className={styles.stepSection}>
                  <div className={styles.sectionHeading}>
                    <div>
                      <h3>{lang === "en" ? "Recurring schedule" : "Program recurent"}</h3>
                      <p>
                        {lang === "en"
                          ? "Choose the period, the daily interval, and the slot size generated for booking."
                          : "Alege perioada, intervalul zilnic și durata sloturilor generate pentru booking."}
                      </p>
                    </div>
                  </div>
                  <div className={styles.grid}>
                    <div>
                      <label>{t("create_experience_recurrence_period_start")}</label>
                      <input
                        className="input"
                        type="date"
                        value={form.recurrenceStartDate}
                        onChange={(e) => onChange("recurrenceStartDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <label>{t("create_experience_recurrence_period_end")}</label>
                      <input
                        className="input"
                        type="date"
                        value={form.recurrenceEndDate}
                        onChange={(e) => onChange("recurrenceEndDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <label>{t("create_experience_recurrence_daily_start")}</label>
                      <input
                        className="input"
                        type="time"
                        value={form.recurrenceDailyStart}
                        onChange={(e) => onChange("recurrenceDailyStart", e.target.value)}
                      />
                    </div>
                    <div>
                      <label>{t("create_experience_recurrence_daily_end")}</label>
                      <input
                        className="input"
                        type="time"
                        value={form.recurrenceDailyEnd}
                        onChange={(e) => onChange("recurrenceDailyEnd", e.target.value)}
                      />
                    </div>
                    <div>
                      <label>{t("create_experience_recurrence_slot_minutes")}</label>
                      <input
                        className="input"
                        type="number"
                        min={15}
                        step={5}
                        value={form.recurrenceSlotMinutes}
                        onChange={(e) => onChange("recurrenceSlotMinutes", e.target.value)}
                      />
                    </div>
                    <div>
                      <label>{t("create_experience_recurrence_generated_slots")}</label>
                      <div className={styles.readonlyField}>{recurringOccurrences.length}</div>
                    </div>
                  </div>
                </section>

                <section className={styles.stepSection}>
                  <div className={styles.sectionHeading}>
                    <div>
                      <h3>{lang === "en" ? "Days & exceptions" : "Zile și excepții"}</h3>
                      <p>
                        {lang === "en"
                          ? "Select the active weekdays and block the dates when you are not available."
                          : "Selectează zilele active și blochează datele în care nu ești disponibil."}
                      </p>
                    </div>
                  </div>
                  <div className={styles.grid}>
                    <div className={styles.full}>
                      <label>{t("create_experience_recurrence_days_label")}</label>
                      <div className={styles.chips}>
                        {weekdayOptions.map((day) => (
                          <button
                            key={day.key}
                            type="button"
                            className={`${styles.chip} ${form.recurrenceWeekdays.includes(day.key) ? styles.chipActive : ""}`}
                            onClick={() => toggleWeekday(day.key)}
                          >
                            {t(day.labelKey)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.full}>
                      <label>{t("create_experience_recurrence_excluded_label")}</label>
                      <div className={styles.excludedRow}>
                        <input
                          className="input"
                          type="date"
                          value={recurrenceExcludedInput}
                          onChange={(e) => setRecurrenceExcludedInput(e.target.value)}
                        />
                        <button type="button" className={`${styles.chip} ${styles.excludedAddBtn}`} onClick={addExcludedDate}>
                          {t("create_experience_recurrence_excluded_add")}
                        </button>
                      </div>
                      {form.recurrenceExcludedDates.length ? (
                        <div className={styles.excludedList}>
                          {form.recurrenceExcludedDates.map((value) => (
                            <button
                              key={value}
                              type="button"
                              className={`${styles.chip} ${styles.excludedChip}`}
                              onClick={() => removeExcludedDate(value)}
                            >
                              {value} ×
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.scheduleHint}>{t("create_experience_recurrence_excluded_empty")}</div>
                      )}
                    </div>
                    <div className={styles.full}>
                      <div className={styles.scheduleHint}>{t("create_experience_recurrence_hint")}</div>
                      <div className={styles.scheduleHint}>{t("create_experience_recurrence_excluded_hint")}</div>
                      {scheduleErrorText ? <div className={styles.scheduleError}>{scheduleErrorText}</div> : null}
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <section className={styles.stepSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <h3>{lang === "en" ? "Schedule" : "Program"}</h3>
                    <p>
                      {lang === "en"
                        ? "Set the exact start and end of the experience so people know when to arrive."
                        : "Setează clar începutul și sfârșitul experienței, ca oamenii să știe exact când ajung."}
                    </p>
                  </div>
                </div>
                <div className={styles.grid}>
                  <div>
                    <label>{t("create_experience_starts")}</label>
                    <input
                      className="input"
                      type="datetime-local"
                      value={form.startsAt}
                      onChange={(e) => onChange("startsAt", e.target.value)}
                    />
                  </div>
                  <div>
                    <label>{t("create_experience_ends")}</label>
                    <input
                      className="input"
                      type="datetime-local"
                      value={form.endsAt}
                      onChange={(e) => onChange("endsAt", e.target.value)}
                    />
                  </div>
                  <div>
                    <label>{t("create_experience_duration")}</label>
                    <div className={styles.readonlyField}>{formatDuration(form.durationMinutes) || "—"}</div>
                  </div>
                  <div className={styles.full}>
                    <div className={styles.scheduleHint}>{t("create_experience_schedule_hint")}</div>
                    {scheduleErrorText ? <div className={styles.scheduleError}>{scheduleErrorText}</div> : null}
                  </div>
                </div>
              </section>
            )}

            <section className={styles.stepSection}>
              <div className={styles.sectionHeading}>
                <div>
                  <h3>{lang === "en" ? "Location details" : "Detalii locație"}</h3>
                  <p>
                    {lang === "en"
                      ? "Search the address first, then fine-tune the exact city and street details."
                      : "Caută mai întâi adresa, apoi ajustează exact orașul și detaliile străzii."}
                  </p>
                </div>
              </div>
              <div className={styles.grid}>
                <div className={styles.full}>
                  <label>{t("create_experience_search_address")}</label>
                  <input
                    className="input"
                    value={addressQuery}
                    onChange={(e) => setAddressQuery(e.target.value)}
                    placeholder={t("create_experience_address_placeholder")}
                  />
                  {suggestions.length ? (
                    <div className={styles.suggestions}>
                      {suggestions.map((s, idx) => (
                        <button key={idx} type="button" onClick={() => selectSuggestion(s)}>
                          {s.label || s.city || s.country}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div>
                  <label>{t("create_experience_city")}</label>
                  <input className="input" value={form.city} onChange={(e) => onChange("city", e.target.value)} />
                </div>
                <div>
                  <label>{t("create_experience_street")}</label>
                  <input className="input" value={form.street} onChange={(e) => onChange("street", e.target.value)} />
                </div>
                <div>
                  <label>{t("create_experience_number")}</label>
                  <input className="input" value={form.streetNumber} onChange={(e) => onChange("streetNumber", e.target.value)} />
                </div>
                <div>
                  <label>{t("create_experience_postal")}</label>
                  <input className="input" value={form.postalCode} onChange={(e) => onChange("postalCode", e.target.value)} />
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className={styles.card}>
          <h2>{t("create_experience_step_3")}</h2>
          <div className={styles.stepThreeLayout}>
            <div className={styles.stepThreeMain}>
              <section className={styles.stepSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <h3>{lang === "en" ? "Pricing setup" : "Setare preț"}</h3>
                    <p>
                      {lang === "en"
                        ? "Choose whether the experience is free or paid, then fine-tune how the amount is charged."
                        : "Alege dacă experiența este gratuită sau cu plată, apoi ajustează cum se percepe suma."}
                    </p>
                  </div>
                </div>
                <div className={styles.grid}>
                  <div className={styles.full}>
                    <label>{lang === "en" ? "Access type" : "Tip acces"}</label>
                    <div className={styles.chips}>
                      <button
                        type="button"
                        className={`${styles.chip} ${isFreePrice ? styles.chipActive : ""}`}
                        onClick={() => onChange("price", "0")}
                      >
                        {lang === "en" ? "Free" : "Gratis"}
                      </button>
                      <button
                        type="button"
                        className={`${styles.chip} ${!isFreePrice ? styles.chipActive : ""}`}
                        onClick={() => onChange("price", form.price && Number(form.price) > 0 ? form.price : "50")}
                      >
                        {lang === "en" ? "Paid" : "Cu preț"}
                      </button>
                    </div>
                  </div>
                  <div className={styles.priceFieldShell}>
                    <label>{t("create_experience_price")}</label>
                    <input
                      className="input"
                      type="number"
                      min={0}
                      disabled={isFreePrice}
                      value={isFreePrice ? "" : form.price}
                      placeholder={isFreePrice ? (lang === "en" ? "Free experience" : "Experiență gratuită") : "0"}
                      onChange={(e) => onChange("price", e.target.value)}
                    />
                    <p className={styles.inlineHint}>
                      {isFreePrice
                        ? lang === "en"
                          ? "The homepage card and booking flow will show this experience as free."
                          : "Cardul din homepage și flow-ul de booking vor arăta această experiență ca gratuită."
                        : lang === "en"
                          ? "Set the participant price in RON."
                          : "Setează prețul per participant în RON."}
                    </p>
                  </div>
                  <div>
                    <label>{t("create_experience_cover_url")}</label>
                    <input className="input" value={form.coverImageUrl} onChange={(e) => onChange("coverImageUrl", e.target.value)} />
                  </div>
                </div>
                {form.activityType === "GROUP" ? (
                  <div className={styles.grid}>
                    <div className={styles.full}>
                      <label>{lang === "en" ? "How is the group price charged?" : "Cum se aplică prețul pentru grup?"}</label>
                      <div className={styles.chips}>
                        <button
                          type="button"
                          className={`${styles.chip} ${form.pricingMode === "PER_PERSON" ? styles.chipActive : ""}`}
                          onClick={() => onChange("pricingMode", "PER_PERSON")}
                        >
                          {lang === "en" ? "Per person" : "Per persoană"}
                        </button>
                        <button
                          type="button"
                          className={`${styles.chip} ${form.pricingMode === "PER_GROUP" ? styles.chipActive : ""}`}
                          onClick={() => onChange("pricingMode", "PER_GROUP")}
                        >
                          {lang === "en" ? "Per fixed group" : "Per grup fix"}
                        </button>
                      </div>
                    </div>
                    {form.pricingMode === "PER_GROUP" ? (
                      <div>
                        <label>{lang === "en" ? "Participants included in one group booking" : "Participanți incluși într-un booking de grup"}</label>
                        <input
                          className="input"
                          type="number"
                          min={1}
                          max={Math.max(1, Number(form.maxParticipants) || 1)}
                          value={form.groupPackageSize}
                          onChange={(e) => onChange("groupPackageSize", e.target.value)}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>

              <section className={styles.stepSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <h3>{t("create_experience_cover_photo")}</h3>
                    <p>{lang === "en" ? "Upload the image and adjust the framing before you publish." : "Încarcă imaginea și ajustează încadrarea înainte să publici."}</p>
                  </div>
                </div>
                <div className={styles.coverRow}>
                  <label className={styles.coverPicker}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onPickCoverImage(file);
                      }}
                    />
                    <span>{t("create_experience_cover_upload")}</span>
                  </label>
                  <div className={styles.coverPreview}>
                    {previewCoverImage ? (
                      <img src={previewCoverImage} alt="cover" style={buildCoverObjectPosition(form)} />
                    ) : (
                      <div className={styles.coverPlaceholder}>{t("create_experience_cover_empty")}</div>
                    )}
                  </div>
                </div>
              </section>

              <section className={styles.stepSection}>
                <div className={styles.sectionHeading}>
                  <div>
                    <h3>{t("create_experience_upload_images")}</h3>
                    <p>{lang === "en" ? "Add the rest of the gallery here." : "Adaugă aici restul galeriei de imagini."}</p>
                  </div>
                </div>
                <div
                  className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const files = Array.from(e.dataTransfer.files || []).filter((file) => file.type.startsWith("image/"));
                    onPickImages(files);
                  }}
                >
                  <input
                    className={styles.file}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => onPickImages(Array.from(e.target.files || []))}
                  />
                  <div className={styles.dropzoneText}>
                    <strong>{t("create_experience_drop_title")}</strong>
                    <span>{t("create_experience_drop_sub")}</span>
                  </div>
                </div>
                {uploading ? <div className="muted">{t("create_experience_uploading")}</div> : null}
                {images.length ? (
                  <div className={styles.imageGrid}>
                    {images.map((img, index) => (
                      <div key={img} className={styles.imageThumb}>
                        <div className={styles.imageThumbMeta}>
                          <span className={styles.imageOrderBadge}>{index + 1}</span>
                          {form.coverImageUrl === img ? (
                            <span className={styles.imageCoverBadge}>{t("create_experience_cover_badge")}</span>
                          ) : null}
                        </div>
                        <img src={img} alt="upload" />
                        <div className={styles.imageThumbActions}>
                          <button
                            type="button"
                            className={styles.imageActionBtn}
                            onClick={() => moveUploadedImage(img, "left")}
                            disabled={index === 0}
                          >
                            {t("create_experience_image_move_left")}
                          </button>
                          <button
                            type="button"
                            className={styles.imageActionBtn}
                            onClick={() => moveUploadedImage(img, "right")}
                            disabled={index === images.length - 1}
                          >
                            {t("create_experience_image_move_right")}
                          </button>
                          <button type="button" className={styles.removeImageBtn} onClick={() => removeUploadedImage(img)}>
                            {t("edit_experience_remove_image")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            </div>

            <aside className={styles.stepThreeAside}>
              <div className={styles.homeCardPreview}>
                <div className={styles.homeCardPreviewLabel}>
                  {lang === "en" ? "Homepage card preview" : "Preview card homepage"}
                </div>
                <div className={styles.homePreviewCard}>
                  {previewCoverImage ? (
                    <img
                      src={previewCoverImage}
                      alt={previewTitle}
                      className={styles.homePreviewCover}
                      style={buildCoverObjectPosition(form)}
                    />
                  ) : (
                    <div className={styles.homePreviewCoverPlaceholder}>{t("create_experience_cover_empty")}</div>
                  )}
                  <div className={styles.homePreviewBody}>
                    <div className={styles.homePreviewTop}>
                      <div>
                        <div className={styles.homePreviewTitle}>{previewTitle}</div>
                        <div className={styles.homePreviewLocation}>{previewLocation || "Romania"}</div>
                        <div className={styles.homePreviewDescription}>{previewShortDescription}</div>
                      </div>
                      <div className={styles.homePreviewPrice}>{previewPrice}</div>
                    </div>
                    <div className={styles.homePreviewMeta}>
                      <span className={styles.homePreviewPill}>🍃 {previewEnvironment}</span>
                      <span className={styles.homePreviewPill}>👥 {previewSeats}</span>
                      <span className={styles.homePreviewPill}>🗣 {previewLanguages}</span>
                    </div>
                  </div>
                </div>
              </div>

              <CoverFocusEditor
                imageUrl={previewCoverImage}
                focusX={coverFocus.x}
                focusY={coverFocus.y}
                title={t("create_experience_cover_focus_title")}
                hint={t("create_experience_cover_focus_hint")}
                resetLabel={t("create_experience_cover_focus_reset")}
                emptyLabel={t("create_experience_cover_empty")}
                onChange={setCoverFocus}
                onReset={resetCoverFocus}
              />
            </aside>
          </div>
        </div>
      ) : null}

      <div className={styles.footer}>
        {error ? <div className={styles.error}>{error}</div> : null}
        {success ? <div className={styles.success}>{success}</div> : null}
        <div className={styles.footerActions}>
          {step > 1 ? (
            <button className="button secondary" type="button" onClick={() => moveToStep(step - 1)}>
              {t("create_experience_back")}
            </button>
          ) : null}
          {step < 3 ? (
            <button className="button" type="button" onClick={handleNextStep} disabled={!canProceed || stripeGate.checking}>
              {t("create_experience_continue")}
            </button>
          ) : (
            <button className="button" type="button" onClick={onSubmit} disabled={loading || stripeGate.checking}>
              {loading ? t("common_publishing") : isEdit ? t("edit_experience_save") : t("create_experience_publish")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateExperiencePage() {
  return (
    <Suspense>
      <CreateExperienceContent />
    </Suspense>
  );
}
