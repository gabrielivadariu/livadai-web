"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";

const NOTIFICATIONS_KEY = "livadai-notifications";

export default function SettingsPage() {
  const t = useT();
  const router = useRouter();
  const { logout, token, loading } = useAuth();
  const { lang, setLang } = useLang();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login?reason=auth&next=/settings");
      return;
    }
    const stored = window.localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored === "off") setNotificationsEnabled(false);
  }, [loading, token, router]);

  const toggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    window.localStorage.setItem(NOTIFICATIONS_KEY, next ? "on" : "off");
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
        <p className="muted">{t("settings_notifications_text")}</p>
        <button className="button secondary" type="button" onClick={toggleNotifications}>
          {notificationsEnabled ? t("settings_notifications_on") : t("settings_notifications_off")}
        </button>
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
