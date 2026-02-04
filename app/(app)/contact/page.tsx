 "use client";

import styles from "@/app/(app)/legal.module.css";
import { useT } from "@/lib/i18n";

export default function ContactPage() {
  const t = useT();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{t("contact_title")}</h1>
      </div>
      <div className={styles.card}>
        <div className={styles.stack}>
          <p className={styles.body}>{t("contact_intro_1")}</p>
          <p className={styles.body}>{t("contact_intro_2")}</p>

          <p className={styles.section}>{t("contact_how_title")}</p>
          <p className={styles.body}>{t("contact_how_1")}</p>
          <p className={styles.body}>• {t("contact_how_list_1")}</p>
          <p className={styles.body}>• {t("contact_how_list_2")}</p>
          <p className={styles.body}>• {t("contact_how_list_3")}</p>
          <p className={styles.body}>• {t("contact_how_list_4")}</p>
          <p className={styles.body}>• {t("contact_how_list_5")}</p>
          <p className={styles.body}>• {t("contact_how_list_6")}</p>
          <p className={styles.body}>{t("contact_how_2")}</p>
          <p className={styles.body}>
            <a className={styles.emailLink} href="mailto:support@livadai.com">
              support@livadai.com
            </a>
          </p>

          <p className={styles.section}>{t("contact_response_title")}</p>
          <p className={styles.body}>{t("contact_response_1")}</p>
          <p className={styles.body}>{t("contact_response_2")}</p>

          <p className={styles.section}>{t("contact_urgent_title")}</p>
          <p className={styles.body}>{t("contact_urgent_1")}</p>
          <p className={styles.body}>• {t("contact_urgent_list_1")}</p>
          <p className={styles.body}>• {t("contact_urgent_list_2")}</p>
          <p className={styles.body}>• {t("contact_urgent_list_3")}</p>
          <p className={styles.body}>{t("contact_urgent_2")}</p>

          <p className={styles.section}>{t("contact_feedback_title")}</p>
          <p className={styles.body}>{t("contact_feedback_1")}</p>
          <p className={styles.body}>{t("contact_feedback_2")}</p>

          <p className={styles.section}>{t("contact_about_title")}</p>
          <p className={styles.body}>{t("contact_about_1")}</p>

          <p className={styles.section}>{t("contact_thanks_title")}</p>
          <p className={styles.body}>{t("contact_thanks_1")}</p>
          <p className={styles.body}>{t("contact_thanks_2")}</p>
        </div>
      </div>
    </div>
  );
}
