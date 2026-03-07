"use client";

import Link from "next/link";
import { useLang } from "@/lib/use-lang";
import styles from "./stripe-instructions.module.css";

const WEBSITE_URL = "https://www.livadai.com";

type StripeInstructionStep = {
  title: string;
  text: string;
  highlight?: string;
};

type StripeInstructionContent = {
  title: string;
  intro: string;
  steps: StripeInstructionStep[];
  cta: string;
};

const content: Record<"ro" | "en", StripeInstructionContent> = {
  ro: {
    title: "Instrucțiuni Stripe",
    intro:
      "Pentru a primi bani pentru experiențele tale pe LIVADAI, trebuie să finalizezi conectarea contului Stripe.",
    steps: [
      {
        title: "1. Apasă „Conectează Stripe”",
        text: "Vei fi redirecționat către pagina securizată Stripe.",
      },
      {
        title: "2. Creează sau conectează contul tău Stripe.",
        text: "",
      },
      {
        title: "3. Completează toate datele cerute de Stripe.",
        text: "Nume, adresă, document de identitate, cont bancar etc.",
      },
      {
        title: "4. Câmp Website / Business website (IMPORTANT)",
        text: "La acest câmp introdu EXACT:",
        highlight: WEBSITE_URL,
      },
      {
        title: "5. Finalizează toți pașii până la capăt.",
        text: "Contul trebuie complet completat pentru a putea primi plăți.",
      },
      {
        title: "6. Revino în LIVADAI și verifică dacă Stripe este activ.",
        text: "",
      },
    ],
    cta: "Conectează contul Stripe",
  },
  en: {
    title: "Stripe Instructions",
    intro:
      "To receive money for your LIVADAI experiences, you must finish connecting your Stripe account.",
    steps: [
      {
        title: "1. Tap “Connect Stripe”",
        text: "You will be redirected to the secure Stripe page.",
      },
      {
        title: "2. Create or connect your Stripe account.",
        text: "",
      },
      {
        title: "3. Complete all information requested by Stripe.",
        text: "Name, address, identity document, bank account, etc.",
      },
      {
        title: "4. Website / Business website field (IMPORTANT)",
        text: "In this field enter EXACTLY:",
        highlight: WEBSITE_URL,
      },
      {
        title: "5. Finish all onboarding steps.",
        text: "The account must be fully completed to receive payouts.",
      },
      {
        title: "6. Return to LIVADAI and verify Stripe is active.",
        text: "",
      },
    ],
    cta: "Connect Stripe Account",
  },
};

export default function StripeInstructionsPage() {
  const { lang } = useLang();
  const data = lang === "ro" ? content.ro : content.en;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{data.title}</h1>
        <p>{data.intro}</p>
      </div>

      <div className={styles.steps}>
        {data.steps.map((step) => (
          <section key={step.title} className={styles.card}>
            <h2>{step.title}</h2>
            {step.text ? <p>{step.text}</p> : null}
            {step.highlight ? (
              <div className={styles.highlight}>
                <div className={styles.highlightLabel}>{lang === "ro" ? "URL exact" : "Exact URL"}</div>
                <input type="text" value={step.highlight} readOnly aria-label="Stripe website URL" />
              </div>
            ) : null}
          </section>
        ))}
      </div>

      <div className={styles.footerCta}>
        <Link href="/host/wallet" className="button">
          {data.cta}
        </Link>
      </div>
    </div>
  );
}
