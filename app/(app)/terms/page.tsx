"use client";

import styles from "@/app/(app)/legal.module.css";
import { useLang } from "@/context/lang-context";
import termsContent from "@/lib/legal/terms-content.json";

type TermsContent = {
  ro: string[];
  en: string[];
};

const CONTENT = termsContent as TermsContent;

const normalizeLine = (line: string) => {
  return line.replace(/\u00a0/g, " ").replace(/\t+/g, " ").replace(/\s+/g, " ").trim();
};

const isMostlyUppercase = (line: string) => {
  const letters = line.replace(/[^A-Za-zĂÂÎȘȚăâîșț]/g, "");
  if (!letters.length) return false;
  const upper = letters.replace(/[^A-ZĂÂÎȘȚ]/g, "").length;
  return upper / letters.length > 0.6;
};

const isSectionLine = (line: string) => {
  if (/^Art\./i.test(line)) return true;
  if (/^\d+\.\s*[A-ZĂÂÎȘȚ]/.test(line)) return true;
  if (line.length < 120 && isMostlyUppercase(line)) return true;
  return false;
};

export default function TermsPage() {
  const { lang } = useLang();
  const sourceLines = lang === "en" ? CONTENT.en : CONTENT.ro;
  const lines = sourceLines.map(normalizeLine);
  const title = lang === "en" ? "Terms & Conditions of Use" : "Termeni și condiții de utilizare";
  const subtitle = lang === "en" ? "Last updated: 12.02.2026" : "Data ultimei actualizări: 12.02.2026";
  const bodyLines = lines.slice(3);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{title}</h1>
        <p className={styles.body}>{subtitle}</p>
      </div>
      <div className={styles.card}>
        <div className={styles.stack}>
          {bodyLines.map((line, index) => {
            if (!line) return <div key={`spacer-${index}`} style={{ height: 8 }} />;
            const className = isSectionLine(line) ? styles.section : styles.body;
            const key = `${index}-${line.slice(0, 24)}`;
            if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(line)) {
              return (
                <p key={key} className={className}>
                  <a className={styles.emailLink} href={`mailto:${line}`}>
                    {line}
                  </a>
                </p>
              );
            }
            return (
              <p key={key} className={className}>
                {line}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
