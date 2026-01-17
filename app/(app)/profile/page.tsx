"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="muted">Se încarcă profilul…</div>;

  return (
    <>
      <div className={styles.hero}>
        <div className={styles.avatar}>
          {profile?.profilePhoto ? <img src={profile.profilePhoto} alt="avatar" style={{ width: "100%", height: "100%" }} /> : "👤"}
        </div>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{profile?.name || "Profil"}</div>
        {profile?.age ? <div className={styles.stats}>{profile.age} ani</div> : null}
      </div>

      <div className={styles.section}>
        {profile?.languages?.length ? (
          <div className={styles.row}>🗣 {profile.languages.map((l) => l.toUpperCase()).join(", ")}</div>
        ) : null}
        {profile?.shortBio ? <div className={styles.row}>📖 {profile.shortBio}</div> : null}
        {profile?.experiencesCount !== undefined ? (
          <div className={styles.row}>✅ {profile.experiencesCount} experiențe completate</div>
        ) : null}
        {profile?.phoneVerified ? <div className={styles.row}>🛡️ Telefon verificat</div> : null}
        {profile?.isTrustedParticipant ? <div className={styles.row}>👍 Participant de încredere</div> : null}
      </div>

      <div className={styles.section}>
        <div style={{ fontWeight: 800 }}>Experiențe favorite</div>
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
          <div className="muted">Nu ai favorite încă.</div>
        )}
      </div>

      <div className={styles.section}>
        <div style={{ fontWeight: 800 }}>Istoric</div>
        {profile?.history?.length ? (
          profile.history.map((h, idx) => (
            <div key={idx} className={styles.row}>
              {h.experienceTitle || "Experiență"} — {h.hostName || "-"}
            </div>
          ))
        ) : (
          <div className="muted">Nu există activitate recentă.</div>
        )}
      </div>

      <div className={styles.logout} onClick={logout}>
        Deconectare
      </div>
    </>
  );
}
