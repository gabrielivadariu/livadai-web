 "use client";

import styles from "@/app/(app)/legal.module.css";
import { useT } from "@/lib/i18n";

export default function AboutPage() {
  const t = useT();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{t("about_title")}</h1>
        <p className={styles.body}>{t("about_last_updated")}</p>
      </div>
      <div className={styles.card}>
        <div className={styles.stack}>
          <p className={styles.body}>{t("about_intro_1")}</p>
          <p className={styles.body}>{t("about_intro_2")}</p>
          <p className={styles.body}>{t("about_intro_3")}</p>

          <p className={styles.section}>{t("about_what_title")}</p>
          <p className={styles.body}>{t("about_what_1")}</p>
          <p className={styles.body}>{t("about_what_2")}</p>
          <p className={styles.body}>• {t("about_what_list_1")}</p>
          <p className={styles.body}>• {t("about_what_list_2")}</p>
          <p className={styles.body}>• {t("about_what_list_3")}</p>
          <p className={styles.body}>• {t("about_what_list_4")}</p>
          <p className={styles.body}>{t("about_what_3")}</p>

          <p className={styles.section}>{t("about_why_title")}</p>
          <p className={styles.body}>{t("about_why_1")}</p>
          <p className={styles.body}>{t("about_why_2")}</p>
          <p className={styles.body}>• {t("about_why_list_1")}</p>
          <p className={styles.body}>• {t("about_why_list_2")}</p>
          <p className={styles.body}>• {t("about_why_list_3")}</p>
          <p className={styles.body}>• {t("about_why_list_4")}</p>
          <p className={styles.body}>{t("about_why_3")}</p>
          <p className={styles.body}>{t("about_why_4")}</p>

          <p className={styles.section}>{t("about_purpose_title")}</p>
          <p className={styles.body}>{t("about_purpose_1")}</p>
          <p className={styles.body}>{t("about_purpose_2")}</p>
          <p className={styles.body}>• {t("about_purpose_list_1")}</p>
          <p className={styles.body}>• {t("about_purpose_list_2")}</p>
          <p className={styles.body}>• {t("about_purpose_list_3")}</p>
          <p className={styles.body}>• {t("about_purpose_list_4")}</p>
          <p className={styles.body}>• {t("about_purpose_list_5")}</p>
          <p className={styles.body}>{t("about_purpose_3")}</p>

          <p className={styles.section}>{t("about_values_title")}</p>
          <p className={styles.body}>{t("about_values_1")}</p>
          <p className={styles.body}>• {t("about_values_list_1")}</p>
          <p className={styles.body}>• {t("about_values_list_2")}</p>
          <p className={styles.body}>• {t("about_values_list_3")}</p>
          <p className={styles.body}>• {t("about_values_list_4")}</p>
          <p className={styles.body}>• {t("about_values_list_5")}</p>

          <p className={styles.section}>{t("about_road_title")}</p>
          <p className={styles.body}>{t("about_road_1")}</p>
          <p className={styles.body}>{t("about_road_2")}</p>
          <p className={styles.body}>{t("about_road_3")}</p>
          <p className={styles.body}>{t("about_road_4")}</p>
          <p className={styles.body}>{t("about_tagline")}</p>
        </div>
      </div>
    </div>
  );
}
