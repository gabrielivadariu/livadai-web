"use client";

import Link from "next/link";
import styles from "./stripe-instructions.module.css";

const WEBSITE_URL = "www.livadai.com";

export default function StripeInstructionsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Instrucțiuni Stripe</h1>
        <p>
          Pentru a primi bani pe LIVADAI, trebuie să finalizezi conectarea contului Stripe. Urmează exact pașii de
          mai jos.
        </p>
      </div>

      <div className={styles.steps}>
        <section className={styles.card}>
          <h2>PASUL 1</h2>
          <p>Apasă butonul „Conectează contul Stripe” din contul tău de host.</p>
          <p>Vei fi redirecționat către platforma securizată Stripe.</p>
        </section>

        <section className={styles.card}>
          <h2>PASUL 2</h2>
          <p>Alege tipul de cont:</p>
          <ul className={styles.list}>
            <li>Individual / Persoană fizică</li>
            <li>Company / Firmă</li>
          </ul>
          <p>
            Majoritatea host-urilor trebuie să aleagă: <strong>Individual (Persoană fizică)</strong>
          </p>
          <p>Alege Company doar dacă ai firmă înregistrată.</p>
        </section>

        <section className={styles.card}>
          <h2>PASUL 3</h2>
          <p>Completează datele personale:</p>
          <ul className={styles.list}>
            <li>Nume complet</li>
            <li>Dată naștere</li>
            <li>Adresă</li>
            <li>Număr telefon</li>
            <li>Document de identitate</li>
            <li>IBAN / Cont bancar</li>
          </ul>
          <p>Completează exact datele reale.</p>
          <p>Nu folosi date incorecte.</p>
        </section>

        <section className={styles.card}>
          <h2>PASUL 4 (CRITIC – BUSINESS WEBSITE)</h2>
          <p>Când Stripe îți cere:</p>
          <div className={styles.stack}>
            <p>Website</p>
            <p>sau</p>
            <p>Business website</p>
            <p>sau</p>
            <p>Business URL</p>
          </div>
          <p>Introdu EXACT:</p>
          <div className={styles.highlight}>
            <div className={styles.highlightLabel}>Valoare exactă</div>
            <input type="text" value={WEBSITE_URL} readOnly aria-label="Stripe business website exact value" />
          </div>
          <div className={styles.stack}>
            <p>Scrie exact așa.</p>
            <p>Fără https.</p>
            <p>Fără http.</p>
            <p>Fără spații.</p>
            <p>Fără altă variantă.</p>
          </div>
        </section>

        <section className={styles.card}>
          <h2>PASUL 5</h2>
          <p>Completează toți pașii până la final.</p>
          <p>Nu închide pagina înainte să vezi confirmarea finală Stripe.</p>
        </section>

        <section className={styles.card}>
          <h2>PASUL 6</h2>
          <p>Revino în LIVADAI.</p>
          <p>Verifică dacă statusul Stripe este activ.</p>
          <p>Dacă nu este activ, reia procesul.</p>
        </section>
      </div>

      <section className={styles.qaSection}>
        <h2>SECȚIUNE PROBLEME FRECVENTE</h2>
        <div className={styles.qaItem}>
          <h3>1. Am creat contul, dar nu primesc bani.</h3>
          <p>→ Cel mai probabil onboarding-ul Stripe nu este complet finalizat.</p>
        </div>
        <div className={styles.qaItem}>
          <h3>2. Nu știu ce website să scriu.</h3>
          <p>→ Scrie exact: {WEBSITE_URL}</p>
        </div>
        <div className={styles.qaItem}>
          <h3>3. Am pus https://www.livadai.com</h3>
          <p>→ Nu este necesar. Scrie doar: {WEBSITE_URL}</p>
        </div>
        <div className={styles.qaItem}>
          <h3>4. Am închis Stripe înainte de finalizare.</h3>
          <p>→ Reia procesul din contul tău LIVADAI.</p>
        </div>
      </section>

      <div className={styles.footerCta}>
        <Link href="/host/wallet" className="button">
          Conectează contul Stripe
        </Link>
      </div>
    </div>
  );
}
