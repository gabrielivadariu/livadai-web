"use client";

import InfoBody from "@/components/info-body";
import { infoContent } from "@/lib/info-content";
import { useLang } from "@/lib/use-lang";
import styles from "../legal.module.css";

export default function AboutPage() {
  const lang = useLang();
  const content = infoContent.about[lang];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{content.title}</h1>
      </div>
      <div className={styles.card}>
        <InfoBody items={content.items} />
      </div>
    </div>
  );
}
