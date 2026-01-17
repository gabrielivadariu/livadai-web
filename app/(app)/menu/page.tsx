"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import styles from "./menu.module.css";

const languageOptions = [
  { code: "ro", label: "Română" },
  { code: "en", label: "English" },
];

export default function MenuPage() {
  const { user, logout } = useAuth();
  const [language, setLanguage] = useState("ro");
  const isHost = user?.role === "HOST" || user?.role === "BOTH";

  useEffect(() => {
    const stored = window.localStorage.getItem("livadai-lang");
    if (stored) setLanguage(stored);
  }, []);

  const onSetLanguage = (code: string) => {
    setLanguage(code);
    window.localStorage.setItem("livadai-lang", code);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>LIVADAI</h1>
        <p>Descoperă experiențe. Cunoaște localnici.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionTitle}>Preferințe</div>
        <div className={styles.preferenceRow}>
          <span>Limbă</span>
          <div className={styles.chips}>
            {languageOptions.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`${styles.chip} ${language === l.code ? styles.chipActive : ""}`}
                onClick={() => onSetLanguage(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionTitle}>Explorează</div>
        {isHost ? (
          <Link className={styles.row} href="/how-it-works-host">
            <span>💼</span>
            <div>
              <strong>Cum funcționează ca host</strong>
              <p>Ghid pentru a începe ca gazdă pe LIVADAI</p>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
        ) : (
          <>
            <Link className={styles.row} href="/how-it-works">
              <span>❓</span>
              <div>
                <strong>Cum funcționează</strong>
                <p>Pași simpli pentru experiențe reale</p>
              </div>
              <span className={styles.chev}>›</span>
            </Link>
            <Link className={styles.row} href="/trust-safety">
              <span>🛡️</span>
              <div>
                <strong>Încredere și siguranță</strong>
                <p>Ghid rapid pentru experiențe sigure</p>
              </div>
              <span className={styles.chev}>›</span>
            </Link>
          </>
        )}
      </div>

      {isHost ? (
        <div className={styles.card}>
          <div className={styles.sectionTitle}>Host</div>
          <Link className={styles.row} href="/host/profile">
            <span>👤</span>
            <div>
              <strong>Profilul meu de gazdă</strong>
              <p>Vezi și editează profilul de gazdă</p>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
          <Link className={styles.row} href="/host/experiences">
            <span>📅</span>
            <div>
              <strong>Experiențe</strong>
              <p>Vezi și administrează experiențele găzduite</p>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
          <Link className={styles.row} href="/host/bookings">
            <span>🧾</span>
            <div>
              <strong>Booking-uri</strong>
              <p>Solicitări și booking-uri confirmate</p>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
          <Link className={styles.row} href="/host/wallet">
            <span>💳</span>
            <div>
              <strong>Portofel / Plăți</strong>
              <p>Balanță, tranzacții și plăți</p>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
          <Link className={`${styles.row} ${styles.rowHighlight}`} href="/host/create-experience">
            <span>➕</span>
            <div>
              <strong>Creează experiență</strong>
              <p>Publică o nouă experiență găzduită</p>
            </div>
            <span className={styles.chev}>›</span>
          </Link>
        </div>
      ) : null}

      <div className={styles.card}>
        <div className={styles.sectionTitle}>Legal</div>
        <Link className={styles.row} href="/about">
          <span>ℹ️</span>
          <div>
            <strong>Despre LIVADAI</strong>
            <p>Povestea și valorile noastre</p>
          </div>
          <span className={styles.chev}>›</span>
        </Link>
        <Link className={styles.row} href="/privacy">
          <span>🔒</span>
          <div>
            <strong>Politica de confidențialitate</strong>
            <p>Informații despre datele personale</p>
          </div>
          <span className={styles.chev}>›</span>
        </Link>
        <Link className={styles.row} href="/terms">
          <span>📄</span>
          <div>
            <strong>Termeni și condiții</strong>
            <p>Regulile și politica LIVADAI</p>
          </div>
          <span className={styles.chev}>›</span>
        </Link>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionTitle}>Contact</div>
        <Link className={styles.row} href="/contact">
          <span>💬</span>
          <div>
            <strong>Contactează-ne</strong>
            <p>Suport și colaborări</p>
          </div>
          <span className={styles.chev}>›</span>
        </Link>
      </div>

      <button className={styles.logout} type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
