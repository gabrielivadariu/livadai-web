"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import styles from "./create-experience.module.css";

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

const environmentOptions: { key: "OUTDOOR" | "INDOOR" | "BOTH"; label: string }[] = [
  { key: "OUTDOOR", label: "Outdoor" },
  { key: "INDOOR", label: "Indoor" },
  { key: "BOTH", label: "Both" },
];

const activityOptions: { key: "INDIVIDUAL" | "GROUP"; label: string }[] = [
  { key: "INDIVIDUAL", label: "Individual" },
  { key: "GROUP", label: "Group" },
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

export default function CreateExperiencePage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [images, setImages] = useState<string[]>([]);
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);

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
      setError("Nu s-au putut încărca imaginile.");
    } finally {
      setUploading(false);
    }
  };

  const canProceed = useMemo(() => {
    if (step === 1) return form.title && form.shortDescription && form.longDescription;
    if (step === 2) return form.startsAt && form.endsAt && form.city;
    return true;
  }, [form, step]);

  const onSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const isFree = !form.price || Number(form.price) <= 0;
      const payload = {
        title: form.title,
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
        price: isFree ? 0 : Number(form.price),
        currencyCode: form.currencyCode,
        activityType: form.activityType,
        maxParticipants: form.activityType === "GROUP" ? Number(form.maxParticipants) || 1 : 1,
        environment: form.environment,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
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
      await apiPost("/experiences", payload);
      setSuccess("Experiența a fost creată cu succes.");
      setStep(1);
      setForm(initialForm);
      setImages([]);
      setAddressQuery("");
    } catch (err) {
      setError((err as Error).message || "Nu s-a putut crea experiența.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>Host · Create</div>
          <h1>Creează o experiență</h1>
          <p>Construiește o experiență premium, exact ca în app, dar optimizată pentru web.</p>
        </div>
        <div className={styles.steps}>
          {[1, 2, 3].map((s) => (
            <div key={s} className={`${styles.step} ${step === s ? styles.active : ""}`}>
              {s}
            </div>
          ))}
        </div>
      </div>

      {step === 1 ? (
        <div className={styles.card}>
          <h2>Detalii esențiale</h2>
          <div className={styles.grid}>
            <div>
              <label>Titlu</label>
              <input className="input" value={form.title} onChange={(e) => onChange("title", e.target.value)} />
            </div>
            <div>
              <label>Descriere scurtă</label>
              <input className="input" value={form.shortDescription} onChange={(e) => onChange("shortDescription", e.target.value)} />
            </div>
            <div className={styles.full}>
              <label>Descriere completă</label>
              <textarea
                className={styles.textarea}
                value={form.longDescription}
                onChange={(e) => onChange("longDescription", e.target.value)}
              />
            </div>
          </div>

          <div className={styles.optionsRow}>
            <div>
              <label>Tip activitate</label>
              <div className={styles.chips}>
                {activityOptions.map((o) => (
                  <button
                    type="button"
                    key={o.key}
                    className={`${styles.chip} ${form.activityType === o.key ? styles.chipActive : ""}`}
                    onClick={() => onChange("activityType", o.key)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            {form.activityType === "GROUP" ? (
              <div>
                <label>Participanți max.</label>
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
              <label>Mediu</label>
              <div className={styles.chips}>
                {environmentOptions.map((o) => (
                    <button
                      type="button"
                      key={o.key}
                      className={`${styles.chip} ${form.environment === o.key ? styles.chipActive : ""}`}
                      onClick={() => onChange("environment", o.key as FormState["environment"])}
                    >
                      {o.label}
                    </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.languages}>
            <label>Limbi vorbite</label>
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
          <h2>Program & Locație</h2>
          <div className={styles.grid}>
            <div>
              <label>Începe la</label>
              <input className="input" type="datetime-local" value={form.startsAt} onChange={(e) => onChange("startsAt", e.target.value)} />
            </div>
            <div>
              <label>Se termină la</label>
              <input className="input" type="datetime-local" value={form.endsAt} onChange={(e) => onChange("endsAt", e.target.value)} />
            </div>
            <div>
              <label>Durată (minute)</label>
              <input className="input" type="number" value={form.durationMinutes} onChange={(e) => onChange("durationMinutes", e.target.value)} />
            </div>
            <div className={styles.full}>
              <label>Caută adresă</label>
              <input
                className="input"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                placeholder="Start typing an address"
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
              <label>Oraș</label>
              <input className="input" value={form.city} onChange={(e) => onChange("city", e.target.value)} />
            </div>
            <div>
              <label>Stradă</label>
              <input className="input" value={form.street} onChange={(e) => onChange("street", e.target.value)} />
            </div>
            <div>
              <label>Număr</label>
              <input className="input" value={form.streetNumber} onChange={(e) => onChange("streetNumber", e.target.value)} />
            </div>
            <div>
              <label>Cod poștal</label>
              <input className="input" value={form.postalCode} onChange={(e) => onChange("postalCode", e.target.value)} />
            </div>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className={styles.card}>
          <h2>Pricing & Media</h2>
          <div className={styles.grid}>
            <div>
              <label>Preț (RON)</label>
              <input className="input" type="number" value={form.price} onChange={(e) => onChange("price", e.target.value)} />
            </div>
            <div>
              <label>Cover image URL (opțional)</label>
              <input className="input" value={form.coverImageUrl} onChange={(e) => onChange("coverImageUrl", e.target.value)} />
            </div>
            <div className={styles.full}>
              <label>Cover photo (recomandat)</label>
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
                  <span>Încarcă cover</span>
                </label>
                <div className={styles.coverPreview}>
                  {form.coverImageUrl || images[0] ? (
                    <img src={form.coverImageUrl || images[0]} alt="cover" />
                  ) : (
                    <div className={styles.coverPlaceholder}>Nicio imagine selectată</div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.full}>
              <label>Încarcă imagini</label>
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
                  <strong>Trage & plasează imagini aici</strong>
                  <span>sau apasă pentru a selecta fișiere</span>
                </div>
              </div>
              {uploading ? <div className="muted">Se încarcă imaginile…</div> : null}
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
              Înapoi
            </button>
          ) : null}
          {step < 3 ? (
            <button className="button" type="button" onClick={() => setStep(step + 1)} disabled={!canProceed}>
              Continuă
            </button>
          ) : (
            <button className="button" type="button" onClick={onSubmit} disabled={loading}>
              {loading ? "Se publică…" : "Publică experiența"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
