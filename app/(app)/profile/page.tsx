"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const MAX_AVATAR_SIZE_BYTES = 8 * 1024 * 1024;

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

const normalizeProfile = (profileRes?: Profile | null) =>
  profileRes
    ? { ...profileRes, displayName: profileRes.displayName || profileRes.name, avatar: profileRes.avatar || profileRes.profilePhoto }
    : {};

export default function ProfilePage() {
  const { user, token, logout, refresh, loading: authLoading } = useAuth();
  const t = useT();
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
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
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Profile>({});

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      if (!active) return;
      if (authLoading) return;
      if (!token) {
        setLoading(false);
        router.replace("/login?reason=auth&next=/profile");
        return;
      }

      setLoading(true);
      setLoadError("");
      const timeoutId = window.setTimeout(() => {
        if (!active) return;
        setLoadError(t("profile_load_error"));
        setLoading(false);
      }, 12000);

      try {
        const [profileRes, favRes, hostRes] = await Promise.all([
          apiGet<Profile>("/users/me/profile"),
          apiGet<Favorite[]>("/users/me/favorites").catch(() => []),
          user?.role === "HOST" || user?.role === "BOTH" ? apiGet<HostStats>("/hosts/me/profile").catch(() => null) : Promise.resolve(null),
        ]);
        if (!active) return;
        const normalized = normalizeProfile(profileRes);
        setProfile(Object.keys(normalized).length ? (normalized as Profile) : null);
        setForm(normalized);
        setFavorites(favRes || []);
        setHostStats(hostRes || null);
      } catch (err) {
        if (active) {
          setLoadError((err as Error)?.message || t("profile_load_error_fallback"));
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (active) setLoading(false);
      }
    };

    void loadProfile();
    const onFocus = () => {
      void loadProfile();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [authLoading, router, token, user?.role]);

  const profileName = form.displayName || form.name || profile?.displayName || profile?.name || t("nav_profile_fallback");
  const avatarValue = form.avatar || profile?.avatar || "";
  const languages = form.languages || profile?.languages || [];
  const location = [form.city || profile?.city, form.country || profile?.country].filter(Boolean).join(", ");
  const avatarInitials = useMemo(
    () =>
      (profileName || "P")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join(""),
    [profileName]
  );

  const onChange = (key: keyof Profile, value: Profile[keyof Profile]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleLanguage = (lang: string) => {
    setForm((prev) => {
      const list = prev.languages || [];
      const exists = list.includes(lang);
      return { ...prev, languages: exists ? list.filter((item) => item !== lang) : [...list, lang] };
    });
  };

  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setSaveError(t("profile_avatar_invalid_type"));
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setSaveError(t("profile_avatar_too_large"));
      return;
    }

    setUploading(true);
    setSaveError("");
    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body,
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Upload failed");
      }
      const url = data?.url || data?.secure_url;
      if (!url) {
        throw new Error("Upload failed");
      }
      setForm((prev) => ({ ...prev, avatar: url }));
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
      const normalized = normalizeProfile(updated) || form;
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
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.kicker}>{t("profile_hero_kicker")}</div>
          <h1>{profileName}</h1>
          <p>{t("profile_hero_subtitle")}</p>
          <div className={styles.heroMeta}>
            {form.age ? <span className={styles.heroChip}>{form.age} {t("profile_years")}</span> : null}
            {location ? <span className={styles.heroChip}>{location}</span> : null}
            {languages.length ? <span className={styles.heroChip}>{languages.length} {t("profile_hero_languages_count")}</span> : null}
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.statCard}>
            <span>{t("profile_favorites")}</span>
            <strong>{favorites.length}</strong>
          </div>
          <div className={styles.statCard}>
            <span>{t("profile_completed")}</span>
            <strong>{profile?.experiencesCount || 0}</strong>
          </div>
          <div className={styles.statCard}>
            <span>{t("profile_rating_label")}</span>
            <strong>{hostStats ? `${Number(hostStats.rating_avg || 0).toFixed(1)} (${hostStats.rating_count || 0})` : "—"}</strong>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrap}>
            <h2>{t("profile_edit_title")}</h2>
            <p>{t("profile_edit_subtitle")}</p>
          </div>
          <button
            className={`button ${editing ? "secondary" : ""}`}
            type="button"
            onClick={() => {
              setEditing((prev) => !prev);
              setSaveError("");
            }}
          >
            {editing ? t("profile_edit_cancel") : t("profile_edit")}
          </button>
        </div>

        {editing ? (
          <div className={styles.profileShell}>
            <aside className={styles.previewPanel}>
              <div className={styles.previewTop}>
                <div className={styles.avatarWrap}>
                  {avatarValue ? (
                    <img className={styles.avatarImage} src={avatarValue} alt={profileName} />
                  ) : (
                    <div className={styles.avatarFallback}>{avatarInitials}</div>
                  )}
                </div>
                <div className={styles.previewText}>
                  <span className={styles.previewRole}>{t("profile_preview_role")}</span>
                  <strong>{profileName}</strong>
                  <span>{location || t("profile_preview_empty_location")}</span>
                </div>
              </div>

              <div className={styles.previewActions}>
                <button
                  className={styles.avatarAction}
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? t("profile_avatar_uploading") : t("profile_avatar_upload")}
                </button>
                <input
                  ref={avatarInputRef}
                  className={styles.hiddenFileInput}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadAvatar(file);
                    e.currentTarget.value = "";
                  }}
                />
                <div className={styles.previewHint}>
                  {t("profile_avatar_hint")}
                </div>
              </div>

              <div className={styles.previewFacts}>
                <div className={styles.previewFact}>
                  <span>{t("profile_languages")}</span>
                  <strong>{languages.length}</strong>
                </div>
                <div className={styles.previewFact}>
                  <span>{t("profile_phone_label")}</span>
                  <strong>{profile?.phoneVerified ? t("profile_phone_verified") : t("profile_phone_unverified")}</strong>
                </div>
              </div>
            </aside>

            <div className={styles.formSections}>
              <section className={styles.sectionBlock}>
                <div className={styles.blockHeader}>
                  <h3>{t("profile_identity_title")}</h3>
                  <p>{t("profile_identity_hint")}</p>
                </div>
                <div className={styles.editGrid}>
                  <div className={styles.fieldGroup}>
                    <label>{t("profile_display_name")}</label>
                    <input className="input" value={form.displayName || ""} onChange={(e) => onChange("displayName", e.target.value)} />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label>{t("profile_age")}</label>
                    <input
                      className="input"
                      type="number"
                      min={18}
                      max={120}
                      value={form.age || ""}
                      onChange={(e) => onChange("age", Number(e.target.value))}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label>{t("profile_city")}</label>
                    <input className="input" value={form.city || ""} onChange={(e) => onChange("city", e.target.value)} />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label>{t("profile_country")}</label>
                    <input className="input" value={form.country || ""} onChange={(e) => onChange("country", e.target.value)} />
                  </div>
                </div>
              </section>

              <section className={styles.sectionBlock}>
                <div className={styles.blockHeader}>
                  <h3>{t("profile_bio_avatar_title")}</h3>
                  <p>{t("profile_bio_avatar_hint")}</p>
                </div>
                <div className={styles.editGrid}>
                  <div className={`${styles.fieldGroup} ${styles.full}`}>
                    <label>{t("profile_bio")}</label>
                    <textarea
                      className={styles.textarea}
                      value={form.shortBio || ""}
                      onChange={(e) => onChange("shortBio", e.target.value)}
                    />
                  </div>
                  <div className={`${styles.fieldGroup} ${styles.full}`}>
                    <label>{t("profile_avatar")}</label>
                    <div className={styles.avatarField}>
                      <input
                        className="input"
                        value={form.avatar || ""}
                        onChange={(e) => onChange("avatar", e.target.value)}
                        placeholder={t("profile_avatar_placeholder")}
                      />
                      <button
                        className={styles.urlAction}
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? t("profile_avatar_uploading_short") : t("profile_avatar_pick_file")}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.sectionBlock}>
                <div className={styles.blockHeader}>
                  <h3>{t("profile_languages")}</h3>
                  <p>{t("profile_languages_hint")}</p>
                </div>
                <div className={styles.langGrid}>
                  {languageOptions.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      className={`${styles.langChip} ${languages.includes(lang) ? styles.langActive : ""}`}
                      onClick={() => toggleLanguage(lang)}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </section>

              {saveError ? <div className={styles.saveError}>{saveError}</div> : null}

              <div className={styles.formActions}>
                <button className="button" type="button" onClick={onSave} disabled={saving || uploading}>
                  {saving ? t("common_saving") : t("profile_save")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.snapshotGrid}>
            <div className={styles.snapshotCard}>
              <div className={styles.snapshotLabel}>{t("profile_snapshot_public")}</div>
              <div className={styles.snapshotValue}>{profileName}</div>
              <div className={styles.snapshotText}>{profile?.shortBio || t("profile_edit_hint")}</div>
            </div>
            <div className={styles.snapshotCard}>
              <div className={styles.snapshotLabel}>{t("profile_snapshot_location")}</div>
              <div className={styles.snapshotValue}>{location || t("profile_snapshot_location_empty")}</div>
              <div className={styles.snapshotText}>{languages.length ? languages.join(", ") : t("profile_snapshot_languages_empty")}</div>
            </div>
            <div className={styles.snapshotCard}>
              <div className={styles.snapshotLabel}>{t("profile_avatar")}</div>
              <div className={styles.snapshotValue}>{avatarValue ? t("profile_snapshot_avatar_ready") : t("profile_snapshot_avatar_missing")}</div>
              <div className={styles.snapshotText}>
                {avatarValue ? t("profile_snapshot_avatar_ready_hint") : t("profile_snapshot_avatar_missing_hint")}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <h3>{t("profile_details_title")}</h3>
          <div className={styles.infoRows}>
            {profile?.languages?.length ? <div className={styles.infoRow}><span>{t("profile_languages")}</span><strong>{profile.languages.map((lang) => lang.toUpperCase()).join(", ")}</strong></div> : null}
            {profile?.city || profile?.country ? <div className={styles.infoRow}><span>{t("profile_location")}</span><strong>{[profile.city, profile.country].filter(Boolean).join(", ")}</strong></div> : null}
            {profile?.experiencesCount !== undefined ? <div className={styles.infoRow}><span>{t("profile_details_completed")}</span><strong>{profile.experiencesCount}</strong></div> : null}
            {profile?.phoneVerified ? <div className={styles.infoRow}><span>{t("profile_phone_label")}</span><strong>{t("profile_phone_verified")}</strong></div> : null}
            {profile?.isTrustedParticipant ? <div className={styles.infoRow}><span>{t("profile_status_label")}</span><strong>{t("profile_trusted")}</strong></div> : null}
          </div>
        </div>

        <div className={styles.infoCard}>
          <h3>{t("profile_favorites")}</h3>
          {favorites.length ? (
            <div className={styles.favoriteList}>
              {favorites.map((fav) => (
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
                  <div className={styles.favoriteCopy}>
                    <div className={styles.favoriteTitle}>{fav.title}</div>
                    <div className={styles.favoriteMeta}>{fav.address || `${fav.city || ""} ${fav.country || ""}`}</div>
                  </div>
                  <span className={styles.favoriteArrow}>›</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="muted">{t("profile_favorites_empty")}</div>
          )}
        </div>

        <div className={styles.infoCard}>
          <h3>{t("profile_history")}</h3>
          {profile?.history?.length ? (
            <div className={styles.historyList}>
              {profile.history.map((item, idx) => (
                <div key={`${item.experienceTitle || "history"}-${idx}`} className={styles.historyRow}>
                  <strong>{item.experienceTitle || t("common_experience")}</strong>
                  <span>{item.hostName || "-"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="muted">{t("profile_history_empty")}</div>
          )}
        </div>
      </section>

      <div className={styles.logoutBar}>
        <button className={styles.logoutButton} type="button" onClick={logout}>
          {t("profile_logout")}
        </button>
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
                    <input className="input" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
                  </div>
                  <button className={styles.deleteBtn} type="button" onClick={onRequestDeleteCode} disabled={deleting || !deletePassword}>
                    {deleting ? t("profile_deleting") : t("profile_delete_send_code")}
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.confirmField}>
                    <label>{t("profile_delete_otp_label")}</label>
                    <input className="input" inputMode="numeric" value={deleteOtp} onChange={(e) => setDeleteOtp(e.target.value)} />
                  </div>
                  <button className={styles.deleteBtn} type="button" onClick={onDeleteAccount} disabled={deleting || deleteOtp.trim().length < 6}>
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
    </div>
  );
}
