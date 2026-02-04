"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/context/auth-context";
import styles from "./profile.module.css";

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

type Profile = {
  name?: string;
  displayName?: string;
  city?: string;
  country?: string;
  avatar?: string;
  profilePhoto?: string;
  age?: number;
  languages?: string[];
  shortBio?: string;
  experiencesCount?: number;
  phoneVerified?: boolean;
  isTrustedParticipant?: boolean;
  history?: { experienceTitle?: string; date?: string; hostName?: string }[];
};

type Favorite = {
  _id: string;
  title?: string;
  city?: string;
  country?: string;
  address?: string;
  images?: string[];
};

type HostStats = {
  rating_avg?: number;
  rating_count?: number;
};

export default function ProfilePage() {
  const { user, token, logout, refresh, loading: authLoading } = useAuth();
  const t = useT();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hostStats, setHostStats] = useState<HostStats | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"confirm" | "otp">("confirm");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteInfo, setDeleteInfo] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState<Profile>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      if (!active) return;
      if (authLoading) return;
      if (!token) {
        router.replace("/login?reason=auth&next=/profile");
        return;
      }
      setLoading(true);
      setLoadError("");
      if (process.env.NODE_ENV !== "production") {
        console.debug("[profile] load start", { token: Boolean(token) });
      }
      refresh().catch(() => undefined);
      try {
        const [profileRes, favRes, hostRes] = await Promise.all([
          apiGet<Profile>("/users/me/profile"),
          apiGet<Favorite[]>("/users/me/favorites").catch(() => []),
          user?.role === "HOST" || user?.role === "BOTH"
            ? apiGet<HostStats>("/hosts/me/profile").catch(() => null)
            : Promise.resolve(null),
        ]);
        if (!active) return;
        const normalized = profileRes
          ? { ...profileRes, displayName: profileRes.displayName || profileRes.name, avatar: profileRes.avatar || profileRes.profilePhoto }
          : {};
        setProfile(Object.keys(normalized).length ? (normalized as Profile) : null);
        setForm(normalized);
        setFavorites(favRes || []);
        setHostStats(hostRes || null);
      } catch (err) {
        if (active) {
          const message = (err as Error)?.message || "Nu am putut încărca profilul.";
          setLoadError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
          if (process.env.NODE_ENV !== "production") {
            console.debug("[profile] load end");
          }
        }
      }
    };
    loadProfile();
    const onFocus = () => loadProfile();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh, user?.role, user, router, authLoading, token]);

  const onChange = (key: keyof Profile, value: Profile[keyof Profile]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleLanguage = (lang: string) => {
    setForm((prev) => {
      const list = prev.languages || [];
      const exists = list.includes(lang);
      return { ...prev, languages: exists ? list.filter((l) => l !== lang) : [...list, lang] };
    });
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    setSaveError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://livadai-backend-production.up.railway.app"}/media/upload`,
        {
          method: "POST",
          body: (() => {
            const data = new FormData();
            data.append("file", file);
            return data;
          })(),
        }
      );
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      const url = data?.url || data?.secure_url;
      if (url) {
        setForm((prev) => ({ ...prev, avatar: url }));
      }
    } catch (err) {
      setSaveError((err as Error).message || t("profile_update_error"));
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const updated = await apiPut<Profile>("/users/me/profile", {
        displayName: form.displayName,
        city: form.city,
        country: form.country,
        age: form.age,
        languages: form.languages,
        shortBio: form.shortBio,
        avatar: form.avatar,
      });
      const normalized = updated
        ? { ...updated, displayName: updated.displayName || updated.name, avatar: updated.avatar || updated.profilePhoto }
        : form;
      setProfile(normalized as Profile);
      setForm(normalized);
      setEditing(false);
      await refresh();
    } catch (err) {
      setSaveError((err as Error).message || t("profile_update_error"));
    } finally {
      setSaving(false);
    }
  };

  const onDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    setDeleteInfo("");
    try {
      await apiPost("/users/me/delete-confirm", { otpCode: deleteOtp.trim() });
      logout();
      router.replace("/login");
    } catch (err) {
      setDeleteError((err as Error).message || t("profile_delete_error"));
    } finally {
      setDeleting(false);
    }
  };

  const onRequestDeleteCode = async () => {
    setDeleting(true);
    setDeleteError("");
    setDeleteInfo("");
    try {
      await apiPost("/auth/reauth", { password: deletePassword });
      await apiPost("/users/me/delete-request", {});
      setDeleteStep("otp");
      setDeleteInfo(t("profile_delete_code_sent"));
    } catch (err) {
      setDeleteError((err as Error).message || t("profile_delete_error"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="muted">{t("common_loading_profile")}</div>;
  if (loadError) {
    return (
      <div className={styles.errorCard}>
        <div>{loadError}</div>
        <button className="button secondary" type="button" onClick={() => window.location.reload()}>
          {t("common_retry")}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.hero}>
        <div className={styles.avatar}>
          {profile?.avatar ? <img src={profile.avatar} alt="avatar" style={{ width: "100%", height: "100%" }} /> : "👤"}
        </div>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{profile?.displayName || profile?.name || t("nav_profile_fallback")}</div>
        {profile?.age ? <div className={styles.stats}>{profile.age} {t("profile_years")}</div> : null}
        {hostStats ? (
          <div className={styles.rating}>
            ⭐ {Number(hostStats.rating_avg || 0).toFixed(1)} ({hostStats.rating_count || 0})
          </div>
        ) : null}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div style={{ fontWeight: 800 }}>{t("profile_edit_title")}</div>
          <button className="button secondary" type="button" onClick={() => setEditing((prev) => !prev)}>
            {editing ? t("profile_edit_cancel") : t("profile_edit")}
          </button>
        </div>
        {editing ? (
          <div className={styles.editGrid}>
            <div>
              <label>{t("profile_display_name")}</label>
              <input
                className="input"
                value={form.displayName || ""}
                onChange={(e) => onChange("displayName", e.target.value)}
              />
            </div>
            <div>
              <label>{t("profile_age")}</label>
              <input
                className="input"
                type="number"
                value={form.age || ""}
                onChange={(e) => onChange("age", Number(e.target.value))}
              />
            </div>
            <div>
              <label>{t("profile_city")}</label>
              <input
                className="input"
                value={form.city || ""}
                onChange={(e) => onChange("city", e.target.value)}
              />
            </div>
            <div>
              <label>{t("profile_country")}</label>
              <input
                className="input"
                value={form.country || ""}
                onChange={(e) => onChange("country", e.target.value)}
              />
            </div>
            <div className={styles.full}>
              <label>{t("profile_bio")}</label>
              <textarea
                className={styles.textarea}
                value={form.shortBio || ""}
                onChange={(e) => onChange("shortBio", e.target.value)}
              />
            </div>
            <div className={styles.full}>
              <label>{t("profile_avatar")}</label>
              <div className={styles.avatarRow}>
                <label className={styles.avatarPicker}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadAvatar(file);
                    }}
                  />
                  <span>{uploading ? t("profile_avatar_uploading") : t("profile_avatar_upload")}</span>
                </label>
                <input
                  className="input"
                  value={form.avatar || ""}
                  onChange={(e) => onChange("avatar", e.target.value)}
                  placeholder={t("profile_avatar_placeholder")}
                />
              </div>
            </div>
            <div className={styles.full}>
              <label>{t("profile_languages")}</label>
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
            {saveError ? <div className={styles.saveError}>{saveError}</div> : null}
            <button className="button" type="button" onClick={onSave} disabled={saving}>
              {saving ? t("common_saving") : t("profile_save")}
            </button>
          </div>
        ) : (
          <div className="muted">{t("profile_edit_hint")}</div>
        )}
      </div>

      <div className={styles.section}>
        {profile?.languages?.length ? (
          <div className={styles.row}>🗣 {profile.languages.map((l) => l.toUpperCase()).join(", ")}</div>
        ) : null}
        {profile?.city || profile?.country ? (
          <div className={styles.row}>
            📍 {profile.city || ""} {profile.country || ""}
          </div>
        ) : null}
        {profile?.shortBio ? <div className={styles.row}>📖 {profile.shortBio}</div> : null}
        {profile?.experiencesCount !== undefined ? (
          <div className={styles.row}>
            ✅ {profile.experiencesCount} {t("profile_completed")}
          </div>
        ) : null}
        {profile?.phoneVerified ? <div className={styles.row}>🛡️ {t("profile_phone_verified")}</div> : null}
        {profile?.isTrustedParticipant ? <div className={styles.row}>👍 {t("profile_trusted")}</div> : null}
      </div>

      <div className={styles.section}>
        <div style={{ fontWeight: 800 }}>{t("profile_favorites")}</div>
        {favorites.length ? (
          favorites.map((fav) => (
            <div
              key={fav._id}
              className={styles.favoriteRow}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/experiences/${fav._id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(`/experiences/${fav._id}`);
                }
              }}
            >
              <img src={fav.images?.[0] || "https://via.placeholder.com/80x80?text=Exp"} className={styles.favoriteImage} alt={fav.title || ""} />
              <div>
                <div className={styles.favoriteTitle}>{fav.title}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {fav.address || `${fav.city || ""} ${fav.country || ""}`}
                </div>
              </div>
              <span className="muted">›</span>
            </div>
          ))
        ) : (
          <div className="muted">{t("profile_favorites_empty")}</div>
        )}
      </div>

      <div className={styles.section}>
        <div style={{ fontWeight: 800 }}>{t("profile_history")}</div>
        {profile?.history?.length ? (
          profile.history.map((h, idx) => (
            <div key={idx} className={styles.row}>
              {h.experienceTitle || t("common_experience")} — {h.hostName || "-"}
            </div>
          ))
        ) : (
          <div className="muted">{t("profile_history_empty")}</div>
        )}
      </div>

      <div className={styles.logout} onClick={logout}>
        {t("profile_logout")}
      </div>

      <div className={styles.dangerZone}>
        <div className={styles.dangerTitle}>{t("profile_delete_title")}</div>
        <div className={styles.dangerText}>{t("profile_delete_text")}</div>
        {deleteError ? <div className={styles.dangerError}>{deleteError}</div> : null}
        {!confirmDelete ? (
          <button className={styles.deleteBtn} type="button" onClick={() => setConfirmDelete(true)}>
            {t("profile_delete_button")}
          </button>
        ) : (
          <div className={styles.confirmBox}>
            <div className={styles.confirmTitle}>{t("profile_delete_confirm_title")}</div>
            <div className={styles.confirmText}>{t("profile_delete_confirm_text")}</div>
            {deleteInfo ? <div className={styles.confirmInfo}>{deleteInfo}</div> : null}
            <div className={styles.confirmActions}>
              {deleteStep === "confirm" ? (
                <>
                  <div className={styles.confirmField}>
                    <label>{t("profile_delete_password_label")}</label>
                    <input
                      className="input"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                    />
                  </div>
                  <button
                    className={styles.deleteBtn}
                    type="button"
                    onClick={onRequestDeleteCode}
                    disabled={deleting || !deletePassword}
                  >
                    {deleting ? t("profile_deleting") : t("profile_delete_send_code")}
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.confirmField}>
                    <label>{t("profile_delete_otp_label")}</label>
                    <input
                      className="input"
                      inputMode="numeric"
                      value={deleteOtp}
                      onChange={(e) => setDeleteOtp(e.target.value)}
                    />
                  </div>
                  <button
                    className={styles.deleteBtn}
                    type="button"
                    onClick={onDeleteAccount}
                    disabled={deleting || deleteOtp.trim().length < 6}
                  >
                    {deleting ? t("profile_deleting") : t("profile_delete_confirm_button")}
                  </button>
                </>
              )}
              <button
                className={styles.cancelBtn}
                type="button"
                onClick={() => {
                  setConfirmDelete(false);
                  setDeleteStep("confirm");
                  setDeletePassword("");
                  setDeleteOtp("");
                  setDeleteInfo("");
                }}
              >
                {t("profile_delete_cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
