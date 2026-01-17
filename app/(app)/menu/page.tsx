"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { useT } from "@/lib/i18n";
import styles from "./menu.module.css";

const languageOptions = [
  { code: "ro", label: "Română" },
  { code: "en", label: "English" },
];

export default function MenuPage() {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLang();
  const t = useT();
  const isHost = user?.role === "HOST" || user?.role === "BOTH";

  const onSetLanguage = (code: string) => {
    setLang(code === "en" ? "en" : "ro");
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{t("menu_title")}</h1>
        <p>{t("menu_subtitle")}</p>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionTitle}>{t("menu_preferences")}</div>
        <div className={styles.preferenceRow}>
          <span>{t("menu_language")}</span>
          <div className={styles.chips}>
            {languageOptions.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`${styles.chip} ${lang === l.code ? styles.chipActive : ""}`}
                onClick={() => onSetLanguage(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionTitle}>{t("menu_explore")}</div>
        {isHost ? (
          <Link className={styles.row} href="/how-it-works-host">
            <span>💼</span>
            <div>
              <strong>{t("menu_how_host_title")}</strong>
              <p>{t("menu_how_host_text")}</p>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
        ) : (
          <>
            <Link className={styles.row} href="/how-it-works">
              <span>❓</span>
              <div>
                <strong>{t("menu_how_title")}</strong>
                <p>{t("menu_how_text")}</p>
              </div>
              <span className={styles.chev}>›</span>
            </Link>
            <Link className={styles.row} href="/trust-safety">
              <span>🛡️</span>
              <div>
                <strong>{t("menu_trust_title")}</strong>
                <p>{t("menu_trust_text")}</p>
              </div>
              <span className={styles.chev}>›</span>
            </Link>
          </>
        )}
      </div>

      {isHost ? (
        <div className={styles.card}>
          <div className={styles.sectionTitle}>{t("menu_host")}</div>
          <Link className={styles.row} href="/host/profile">
            <span>👤</span>
            <div>
              <strong>{t("menu_host_profile_title")}</strong>
              <p>{t("menu_host_profile_text")}</p>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
          <Link className={styles.row} href="/host/experiences">
            <span>📅</span>
            <div>
              <strong>{t("menu_host_experiences_title")}</strong>
              <p>{t("menu_host_experiences_text")}</p>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
          <Link className={styles.row} href="/host/bookings">
            <span>🧾</span>
            <div>
              <strong>{t("menu_host_bookings_title")}</strong>
              <p>{t("menu_host_bookings_text")}</p>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
          <Link className={styles.row} href="/host/wallet">
            <span>💳</span>
            <div>
              <strong>{t("menu_host_wallet_title")}</strong>
              <p>{t("menu_host_wallet_text")}</p>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
          <Link className={`${styles.row} ${styles.rowHighlight}`} href="/host/create-experience">
            <span>➕</span>
            <div>
              <strong>{t("menu_host_create_title")}</strong>
              <p>{t("menu_host_create_text")}</p>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
        </div>
      ) : null}

      <div className={styles.card}>
        <div className={styles.sectionTitle}>{t("menu_legal")}</div>
        <Link className={styles.row} href="/about">
          <span>ℹ️</span>
          <div>
            <strong>{t("menu_about_title")}</strong>
            <p>{t("menu_about_text")}</p>
          </div>
          <span className={styles.chev}>›</span>
        </Link>
        <Link className={styles.row} href="/privacy">
          <span>🔒</span>
          <div>
            <strong>{t("menu_privacy_title")}</strong>
            <p>{t("menu_privacy_text")}</p>
          </div>
          <span className={styles.chev}>›</span>
        </Link>
        <Link className={styles.row} href="/terms">
          <span>📄</span>
          <div>
            <strong>{t("menu_terms_title")}</strong>
            <p>{t("menu_terms_text")}</p>
          </div>
          <span className={styles.chev}>›</span>
        </Link>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionTitle}>{t("menu_contact")}</div>
        <Link className={styles.row} href="/contact">
          <span>💬</span>
          <div>
            <strong>{t("menu_contact_title")}</strong>
            <p>{t("menu_contact_text")}</p>
          </div>
          <span className={styles.chev}>›</span>
        </Link>
      </div>

      <button className={styles.logout} type="button" onClick={logout}>
        {t("menu_logout")}
      </button>
    </div>
  );
}
