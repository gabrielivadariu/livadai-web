"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { apiGet, apiPatch } from "@/lib/api";
import { useT } from "@/lib/i18n";

export default function SettingsPage() {
  const t = useT();
  const router = useRouter();
  const { token, loading } = useAuth();
  const { lang, setLang } = useLang();
  const [marketingEmailOptIn, setMarketingEmailOptIn] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [preferencesError, setPreferencesError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login?reason=auth&next=/settings");
      return;
    }

    let active = true;
    setPreferencesLoading(true);
    setPreferencesError("");

    apiGet<{ marketingEmailOptIn?: boolean; preferences?: { marketingEmailOptIn?: boolean } }>("/users/me")
      .then((data) => {
        if (!active) return;
        const nextValue =
          typeof data?.preferences?.marketingEmailOptIn === "boolean"
            ? data.preferences.marketingEmailOptIn
            : !!data?.marketingEmailOptIn;
        setMarketingEmailOptIn(nextValue);
      })
      .catch((err) => {
        if (!active) return;
        setPreferencesError((err as Error).message || t("settings_email_updates_error"));
      })
      .finally(() => {
        if (!active) return;
        setPreferencesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loading, token, router]);

  const toggleMarketingEmails = async () => {
    const next = !marketingEmailOptIn;
    setPreferencesSaving(true);
    setPreferencesError("");
    try {
      const data = await apiPatch<{ marketingEmailOptIn?: boolean; preferences?: { marketingEmailOptIn?: boolean } }>(
        "/users/me/preferences",
        { marketingEmailOptIn: next }
      );
      const savedValue =
        typeof data?.preferences?.marketingEmailOptIn === "boolean"
          ? data.preferences.marketingEmailOptIn
          : !!data?.marketingEmailOptIn;
      setMarketingEmailOptIn(savedValue);
    } catch (err) {
      setPreferencesError((err as Error).message || t("settings_email_updates_error"));
    } finally {
      setPreferencesSaving(false);
    }
  };

  const onDeleteAccount = () => {
    router.push("/profile");
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{t("settings_title")}</h2>
        <p className="muted">{t("settings_soon")}</p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>{t("settings_language_title")}</h3>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className={`button secondary ${lang === "ro" ? "active" : ""}`}
            onClick={() => setLang("ro")}
          >
            Română
          </button>
          <button
            type="button"
            className={`button secondary ${lang === "en" ? "active" : ""}`}
            onClick={() => setLang("en")}
          >
            English
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>{t("settings_notifications_title")}</h3>
        <p className="muted">{t("settings_email_updates_text")}</p>
        {preferencesError ? <div style={{ color: "#b91c1c", marginBottom: 8 }}>{preferencesError}</div> : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <button
            className="button secondary"
            type="button"
            onClick={toggleMarketingEmails}
            disabled={preferencesLoading || preferencesSaving}
          >
            {preferencesSaving
              ? t("settings_email_updates_saving")
              : marketingEmailOptIn
                ? t("settings_email_updates_on")
                : t("settings_email_updates_off")}
          </button>
          <span className="muted" style={{ fontSize: 14 }}>
            {t("settings_email_updates_label")}
          </span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>{t("settings_privacy_title")}</h3>
        <p className="muted">{t("settings_privacy_text")}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="button secondary" href="/privacy">
            Privacy
          </Link>
          <Link className="button secondary" href="/terms">
            Terms
          </Link>
        </div>
      </div>

      <div className="card" style={{ borderColor: "#fecdd3", background: "#fff1f2" }}>
        <h3 style={{ marginTop: 0 }}>{t("settings_account_title")}</h3>
        <p className="muted">{t("settings_account_text")}</p>
        {deleteError ? <div style={{ color: "#b91c1c", marginBottom: 8 }}>{deleteError}</div> : null}
        {!confirmDelete ? (
          <button className="button" type="button" onClick={() => setConfirmDelete(true)}>
            {t("settings_delete_button")}
          </button>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #fecdd3", borderRadius: 14, padding: 12 }}>
            <div style={{ fontWeight: 700, color: "#991b1b", marginBottom: 6 }}>{t("settings_delete_confirm_title")}</div>
            <div style={{ color: "#7f1d1d", marginBottom: 10 }}>{t("settings_delete_confirm_text")}</div>
            <div style={{ display: "grid", gap: 8 }}>
              <button className="button" type="button" onClick={onDeleteAccount} disabled={deleting}>
                {t("settings_delete_confirm_button")}
              </button>
              <button className="button secondary" type="button" onClick={() => setConfirmDelete(false)}>
                {t("settings_delete_cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
