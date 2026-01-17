"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api";
import { useT } from "@/lib/i18n";
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
  const t = useT();
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
      setStatus(t("host_profile_saved"));
    } catch (err) {
      setStatus((err as Error).message || t("host_profile_save_error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="muted">{t("common_loading_profile")}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>Host</div>
          <h1>{t("host_profile_title")}</h1>
          <p>{t("host_profile_subtitle")}</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.grid}>
          <div>
            <label>{t("host_profile_name")}</label>
            <input className="input" value={form.name || ""} onChange={(e) => onChange("name", e.target.value)} />
          </div>
          <div>
            <label>{t("host_profile_display_name")}</label>
            <input className="input" value={form.display_name || ""} onChange={(e) => onChange("display_name", e.target.value)} />
          </div>
          <div>
            <label>{t("host_profile_city")}</label>
            <input className="input" value={form.city || ""} onChange={(e) => onChange("city", e.target.value)} />
          </div>
          <div>
            <label>{t("host_profile_country")}</label>
            <input className="input" value={form.country || ""} onChange={(e) => onChange("country", e.target.value)} />
          </div>
          <div>
            <label>{t("host_profile_phone")}</label>
            <input className="input" value={form.phone || ""} onChange={(e) => onChange("phone", e.target.value)} />
          </div>
          <div>
            <label>{t("host_profile_age")}</label>
            <input className="input" type="number" value={form.age || ""} onChange={(e) => onChange("age", Number(e.target.value))} />
          </div>
          <div className={styles.full}>
            <label>{t("host_profile_about")}</label>
            <textarea
              className={styles.textarea}
              value={form.about_me || ""}
              onChange={(e) => onChange("about_me", e.target.value)}
            />
          </div>
          <div className={styles.full}>
            <label>{t("host_profile_experience")}</label>
            <textarea
              className={styles.textarea}
              value={form.experience || ""}
              onChange={(e) => onChange("experience", e.target.value)}
            />
          </div>
          <div className={styles.full}>
            <label>{t("host_profile_avatar")}</label>
            <input className="input" value={form.avatar || ""} onChange={(e) => onChange("avatar", e.target.value)} />
          </div>
        </div>

        <div className={styles.languages}>
          <label>{t("host_profile_languages")}</label>
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
          {saving ? t("common_saving") : t("host_profile_save")}
        </button>
      </div>
    </div>
  );
}
