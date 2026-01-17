"use client";

import { hostHowItWorks } from "@/lib/info-content";
import { useLang } from "@/lib/use-lang";
import styles from "./how-it-works-host.module.css";

export default function HowItWorksHostPage() {
  const lang = useLang();
  const content = hostHowItWorks[lang];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{content.title}</h1>
        {content.intro.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      {content.sections.map((section) => (
        <div key={section.title} className={styles.card}>
          <h2>{section.title}</h2>
          <ul>
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
