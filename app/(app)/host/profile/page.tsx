"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api";
import styles from "./host-profile.module.css";

const languageOptions = [
  "Română",
  "English",
  "Français",
  "Deutsch",
  "Español",
  "Italiano",
  "Português",
  "Nederlands",
  "Polski",
  "Magyar",
  "Ελληνικά",
  "Türkçe",
  "Русский",
  "Українська",
];

type HostProfile = {
  name?: string;
  display_name?: string;
  city?: string;
  country?: string;
  about_me?: string;
  age?: number;
  phone?: string;
  languages?: string[];
  experience?: string;
  avatar?: string;
};

export default function HostProfilePage() {
  const [form, setForm] = useState<HostProfile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    apiGet<HostProfile>("/hosts/me/profile")
      .then((data) => {
        if (active) setForm(data || {});
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const onChange = (key: keyof HostProfile, value: HostProfile[keyof HostProfile]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleLanguage = (lang: string) => {
    setForm((f) => {
      const list = f.languages || [];
      const exists = list.includes(lang);
      return { ...f, languages: exists ? list.filter((l) => l !== lang) : [...list, lang] };
    });
  };

  const onSave = async () => {
    setSaving(true);
    setStatus("");
    try {
      await apiPut("/hosts/me/profile", {
        display_name: form.display_name,
        name: form.name,
        city: form.city,
        country: form.country,
        about_me: form.about_me,
        age: form.age,
        phone: form.phone,
        languages: form.languages,
        experience: form.experience,
        avatar: form.avatar,
      });
      setStatus("Profil actualizat.");
    } catch (err) {
      setStatus((err as Error).message || "Nu s-a putut salva profilul.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="muted">Se încarcă profilul…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>Host</div>
          <h1>Profilul meu de gazdă</h1>
          <p>Completează profilul și crește încrederea exploratorilor.</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.grid}>
          <div>
            <label>Nume</label>
            <input className="input" value={form.name || ""} onChange={(e) => onChange("name", e.target.value)} />
          </div>
          <div>
            <label>Nume afișat</label>
            <input className="input" value={form.display_name || ""} onChange={(e) => onChange("display_name", e.target.value)} />
          </div>
          <div>
            <label>Oraș</label>
            <input className="input" value={form.city || ""} onChange={(e) => onChange("city", e.target.value)} />
          </div>
          <div>
            <label>Țară</label>
            <input className="input" value={form.country || ""} onChange={(e) => onChange("country", e.target.value)} />
          </div>
          <div>
            <label>Telefon</label>
            <input className="input" value={form.phone || ""} onChange={(e) => onChange("phone", e.target.value)} />
          </div>
          <div>
            <label>Vârstă</label>
            <input className="input" type="number" value={form.age || ""} onChange={(e) => onChange("age", Number(e.target.value))} />
          </div>
          <div className={styles.full}>
            <label>Despre tine</label>
            <textarea
              className={styles.textarea}
              value={form.about_me || ""}
              onChange={(e) => onChange("about_me", e.target.value)}
            />
          </div>
          <div className={styles.full}>
            <label>Experiență profesională</label>
            <textarea
              className={styles.textarea}
              value={form.experience || ""}
              onChange={(e) => onChange("experience", e.target.value)}
            />
          </div>
          <div className={styles.full}>
            <label>Avatar URL</label>
            <input className="input" value={form.avatar || ""} onChange={(e) => onChange("avatar", e.target.value)} />
          </div>
        </div>

        <div className={styles.languages}>
          <label>Limbi vorbite</label>
          <div className={styles.langGrid}>
            {languageOptions.map((lang) => (
              <button
                key={lang}
                type="button"
                className={`${styles.langChip} ${(form.languages || []).includes(lang) ? styles.langActive : ""}`}
                onClick={() => toggleLanguage(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {status ? <div className={styles.status}>{status}</div> : null}
        <button className="button" type="button" onClick={onSave} disabled={saving}>
          {saving ? "Se salvează…" : "Salvează profilul"}
        </button>
      </div>
    </div>
  );
}
