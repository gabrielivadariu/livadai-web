"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
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

type FormState = {
  title: string;
  shortDescription: string;
  longDescription: string;
  price: string;
  currencyCode: string;
  activityType: "INDIVIDUAL" | "GROUP";
  maxParticipants: number;
  environment: "OUTDOOR" | "INDOOR" | "BOTH";
  startsAt: string;
  endsAt: string;
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
  title: "",
  shortDescription: "",
  longDescription: "",
  price: "",
  currencyCode: "RON",
  activityType: "INDIVIDUAL",
  maxParticipants: 1,
  environment: "OUTDOOR",
  startsAt: "",
  endsAt: "",
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
  const editId = searchParams?.get("edit");
  const isEdit = Boolean(editId);

  useEffect(() => {
    let active = true;
    const loadExperience = async () => {
      if (!editId) return;
      setLoadingExperience(true);
      setError("");
      try {
        const exp = await apiGet<any>(`/experiences/${editId}`);
        if (!active || !exp) return;
        const startsAt = exp.startsAt || exp.startDate;
        const endsAt = exp.endsAt || exp.endDate;
        const toInput = (value?: string) => (value ? new Date(value).toISOString().slice(0, 16) : "");
        setForm({
          title: exp.title || "",
          shortDescription: exp.shortDescription || "",
          longDescription: exp.description || exp.longDescription || "",
          price: exp.price ? String(exp.price) : "",
          currencyCode: exp.currencyCode || "RON",
          activityType: exp.activityType || "INDIVIDUAL",
          maxParticipants: exp.maxParticipants || 1,
          environment: exp.environment || "OUTDOOR",
          startsAt: toInput(startsAt),
          endsAt: toInput(endsAt),
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
        setError((err as Error).message || t("create_experience_error"));
      } finally {
        if (active) setLoadingExperience(false);
      }
    };
    loadExperience();
    return () => {
      active = false;
    };
  }, [editId, t]);

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

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://livadai-backend-production.up.railway.app"}/media/upload`, {
      method: "POST",
      body: formData,
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
    } catch (err) {
      setError(t("create_experience_upload_error"));
    } finally {
      setUploading(false);
    }
  };

  const scheduleState = useMemo(() => {
    const hasStart = !!form.startsAt;
    const hasEnd = !!form.endsAt;
    const endAfterStart =
      hasStart && hasEnd ? new Date(form.endsAt).getTime() > new Date(form.startsAt).getTime() : true;
    return { hasStart, hasEnd, endAfterStart };
  }, [form.endsAt, form.startsAt]);

  const canProceed = useMemo(() => {
    if (step === 1) return form.title && form.shortDescription && form.longDescription;
    if (step === 2) {
      return scheduleState.hasStart && scheduleState.hasEnd && scheduleState.endAfterStart && form.city;
    }
    return true;
  }, [form, step, scheduleState]);

  const scheduleErrorText = useMemo(() => {
    if (!scheduleState.hasStart) return t("create_experience_schedule_required");
    if (!scheduleState.hasEnd) return t("create_experience_schedule_required");
    if (!scheduleState.endAfterStart) return t("create_experience_schedule_order");
    return "";
  }, [scheduleState, t]);

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
  }, [form.startsAt, form.endsAt]);

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
      const isFree = !form.price || Number(form.price) <= 0;
      const startsAtIso = form.startsAt ? new Date(form.startsAt).toISOString() : undefined;
      const endsAtIso = form.endsAt ? new Date(form.endsAt).toISOString() : undefined;
      const payload = {
        title: form.title,
        shortDescription: form.shortDescription,
        description: form.longDescription,
        price: isFree ? 0 : Number(form.price),
        currencyCode: form.currencyCode,
        activityType: form.activityType,
        maxParticipants: form.activityType === "GROUP" ? Number(form.maxParticipants) || 1 : 1,
        environment: form.environment,
        startsAt: startsAtIso,
        endsAt: endsAtIso,
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
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
      };
      if (isEdit && editId) {
        await apiPatch(`/experiences/${editId}`, payload);
        router.replace("/host");
      } else {
        await apiPost("/experiences", payload);
        window.localStorage.setItem(EXPERIENCE_CREATED_KEY, "1");
        router.replace("/experiences");
      }
    } catch (err) {
      setError((err as Error).message || t("create_experience_error"));
    } finally {
      setLoading(false);
    }
  };

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
                  value={form.maxParticipants}
                  onChange={(e) => onChange("maxParticipants", Number(e.target.value))}
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
            <div>
              <label>{t("create_experience_starts")}</label>
              <input className="input" type="datetime-local" value={form.startsAt} onChange={(e) => onChange("startsAt", e.target.value)} />
            </div>
            <div>
              <label>{t("create_experience_ends")}</label>
              <input className="input" type="datetime-local" value={form.endsAt} onChange={(e) => onChange("endsAt", e.target.value)} />
            </div>
            <div>
              <label>{t("create_experience_duration")}</label>
              <input className="input" value={formatDuration(form.durationMinutes)} readOnly />
            </div>
            <div className={styles.full}>
              <div className={styles.scheduleHint}>{t("create_experience_schedule_hint")}</div>
              {scheduleErrorText ? <div className={styles.scheduleError}>{scheduleErrorText}</div> : null}
            </div>
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
