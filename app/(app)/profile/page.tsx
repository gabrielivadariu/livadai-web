"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiDelete, apiGet } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/context/auth-context";
import styles from "./profile.module.css";

type Profile = {
  name?: string;
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

export default function ProfilePage() {
  const { logout } = useAuth();
  const t = useT();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiGet<Profile>("/users/me/profile"),
      apiGet<Favorite[]>("/users/me/favorites").catch(() => []),
    ])
      .then(([profileRes, favRes]) => {
        if (!active) return;
        setProfile(profileRes || null);
        setFavorites(favRes || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const onDeleteAccount = async () => {
    const confirmed = window.confirm(
      t("profile_delete_confirm")
    );
    if (!confirmed) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await apiDelete("/users/me");
      logout();
      router.replace("/login");
    } catch (err) {
      setDeleteError((err as Error).message || t("profile_delete_error"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="muted">{t("common_loading_profile")}</div>;

  return (
    <>
      <div className={styles.hero}>
        <div className={styles.avatar}>
          {profile?.profilePhoto ? <img src={profile.profilePhoto} alt="avatar" style={{ width: "100%", height: "100%" }} /> : "👤"}
        </div>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{profile?.name || t("nav_profile_fallback")}</div>
        {profile?.age ? <div className={styles.stats}>{profile.age} {t("profile_years")}</div> : null}
      </div>

      <div className={styles.section}>
        {profile?.languages?.length ? (
          <div className={styles.row}>🗣 {profile.languages.map((l) => l.toUpperCase()).join(", ")}</div>
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
            <div key={fav._id} className={styles.favoriteRow}>
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
        <button className={styles.deleteBtn} type="button" onClick={onDeleteAccount} disabled={deleting}>
          {deleting ? t("profile_deleting") : t("profile_delete_button")}
        </button>
      </div>
    </>
  );
}
