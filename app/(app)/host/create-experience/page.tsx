"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { useLang } from "@/context/lang-context";
import { getMessage, useT } from "@/lib/i18n";
import styles from "./create-experience.module.css";

const EXPERIENCE_CREATED_KEY = "livadai-experience-created";

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

const weekdayOptions = [
  { key: 1, labelKey: "weekday_monday_short" },
  { key: 2, labelKey: "weekday_tuesday_short" },
  { key: 3, labelKey: "weekday_wednesday_short" },
  { key: 4, labelKey: "weekday_thursday_short" },
  { key: 5, labelKey: "weekday_friday_short" },
  { key: 6, labelKey: "weekday_saturday_short" },
  { key: 0, labelKey: "weekday_sunday_short" },
] as const;

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
  const editId = searchParams?.get("edit");
  const isEdit = Boolean(editId);

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
        setForm((f) => ({ ...f, coverImageUrl: uploaded[0] }));
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
      setForm((f) => ({ ...f, coverImageUrl: url }));
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
      }));
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

  const canProceed = useMemo(() => {
    if (step === 1) {
      return (
        !!form.title.trim() &&
        !!form.shortDescription.trim() &&
        !!form.longDescription.trim() &&
        hasCreationMode &&
        hasActivityType &&
        hasEnvironment
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
  }, [form, step, scheduleState, recurringState, isEdit, hasCreationMode, hasActivityType, hasEnvironment]);

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
      if (scheduleErrorText) {
        setError(scheduleErrorText);
        setLoading(false);
        return;
      }
      if (!hasCreationMode || !hasActivityType || !hasEnvironment) {
        setError(t("create_experience_step_1_required_options"));
        setLoading(false);
        return;
      }
      const selectedCreationMode = form.creationMode;
      const selectedActivityType = form.activityType;
      const selectedEnvironment = form.environment;
      const isFree = !form.price || Number(form.price) <= 0;
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
                  <input className="input" value={form.title} onChange={(e) => onChange("title", e.target.value)} />
                </div>
                <div>
                  <label>{t("create_experience_label_short")}</label>
                  <input
                    className="input"
                    value={form.shortDescription}
                    maxLength={50}
                    onChange={(e) => onChange("shortDescription", e.target.value.slice(0, 50))}
                  />
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
                        <img src={editCoverImage} alt="cover" />
                      ) : (
                        <div className={styles.coverPlaceholder}>{t("create_experience_cover_empty")}</div>
                      )}
                    </div>
                  </div>
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
                      {images.map((img) => (
                        <div key={img} className={styles.imageThumb}>
                          <img src={img} alt="upload" />
                          <div className={styles.imageThumbActions}>
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
      <div className={styles.header}>
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

      {loadingExperience ? (
        <div className="muted">{t("common_loading_experiences")}</div>
      ) : step === 1 ? (
        <div className={styles.card}>
          <h2>{t("create_experience_step_1")}</h2>
          <div className={styles.grid}>
            <div>
              <label>{t("create_experience_label_title")}</label>
              <input className="input" value={form.title} onChange={(e) => onChange("title", e.target.value)} />
            </div>
            <div>
              <label>{t("create_experience_label_short")}</label>
              <input className="input" value={form.shortDescription} onChange={(e) => onChange("shortDescription", e.target.value)} />
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

          {!isEdit ? (
            <div className={styles.optionsRow}>
              <div>
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
          ) : null}

          <div className={styles.optionsRow}>
            <div>
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
              <div>
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
            <div>
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

          <div className={styles.languages}>
            <label>{t("create_experience_languages")}</label>
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
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className={styles.card}>
          <h2>{t("create_experience_step_2")}</h2>
          <div className={styles.grid}>
            {!isEdit && form.creationMode === "LONG_TERM" ? (
              <>
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
              </>
            ) : (
              <>
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
              </>
            )}
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
        </div>
      ) : null}

      {step === 3 ? (
        <div className={styles.card}>
          <h2>{t("create_experience_step_3")}</h2>
          <div className={styles.grid}>
            <div>
              <label>{t("create_experience_price")}</label>
              <input className="input" type="number" value={form.price} onChange={(e) => onChange("price", e.target.value)} />
            </div>
            {form.activityType === "GROUP" ? (
              <>
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
              </>
            ) : null}
            <div>
              <label>{t("create_experience_cover_url")}</label>
              <input className="input" value={form.coverImageUrl} onChange={(e) => onChange("coverImageUrl", e.target.value)} />
            </div>
            <div className={styles.full}>
              <label>{t("create_experience_cover_photo")}</label>
              <div className={styles.coverRow}>
                <label className={styles.coverPicker}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onPickImages([file]);
                    }}
                  />
                  <span>{t("create_experience_cover_upload")}</span>
                </label>
                <div className={styles.coverPreview}>
                  {form.coverImageUrl || images[0] ? (
                    <img src={form.coverImageUrl || images[0]} alt="cover" />
                  ) : (
                    <div className={styles.coverPlaceholder}>{t("create_experience_cover_empty")}</div>
                  )}
                </div>
              </div>
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
                  {images.map((img) => (
                    <div key={img} className={styles.imageThumb}>
                      <img src={img} alt="upload" />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.footer}>
        {error ? <div className={styles.error}>{error}</div> : null}
        {success ? <div className={styles.success}>{success}</div> : null}
        <div className={styles.footerActions}>
          {step > 1 ? (
            <button className="button secondary" type="button" onClick={() => setStep(step - 1)}>
              {t("create_experience_back")}
            </button>
          ) : null}
          {step < 3 ? (
            <button className="button" type="button" onClick={() => setStep(step + 1)} disabled={!canProceed}>
              {t("create_experience_continue")}
            </button>
          ) : (
            <button className="button" type="button" onClick={onSubmit} disabled={loading}>
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
