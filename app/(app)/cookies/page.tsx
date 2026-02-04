 "use client";

import styles from "@/app/(app)/legal.module.css";
import { useT } from "@/lib/i18n";

export default function CookiePolicyPage() {
  const t = useT();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{t("cookies_title")}</h1>
        <p className={styles.body}>{t("cookies_last_updated")}</p>
      </div>
      <div className={styles.card}>
        <div className={styles.stack}>
          <p className={styles.section}>{t("cookies_what_title")}</p>
          <p className={styles.body}>{t("cookies_what_1")}</p>
          <p className={styles.body}>{t("cookies_what_2")}</p>

          <p className={styles.section}>{t("cookies_use_title")}</p>
          <p className={styles.body}>{t("cookies_use_1")}</p>
          <p className={styles.body}>{t("cookies_use_2")}</p>

          <p className={styles.section}>{t("cookies_types_title")}</p>
          <p className={styles.section}>{t("cookies_essential_title")}</p>
          <p className={styles.body}>{t("cookies_essential_1")}</p>
          <p className={styles.body}>• {t("cookies_essential_list_1")}</p>
          <p className={styles.body}>• {t("cookies_essential_list_2")}</p>
          <p className={styles.body}>• {t("cookies_essential_list_3")}</p>
          <p className={styles.body}>• {t("cookies_essential_list_4")}</p>

          <p className={styles.section}>{t("cookies_functional_title")}</p>
          <p className={styles.body}>{t("cookies_functional_1")}</p>
          <p className={styles.body}>• {t("cookies_functional_list_1")}</p>
          <p className={styles.body}>• {t("cookies_functional_list_2")}</p>
          <p className={styles.body}>• {t("cookies_functional_list_3")}</p>

          <p className={styles.section}>{t("cookies_third_title")}</p>
          <p className={styles.body}>{t("cookies_third_1")}</p>
          <p className={styles.body}>• {t("cookies_third_list_1")}</p>
          <p className={styles.body}>• {t("cookies_third_list_2")}</p>
          <p className={styles.body}>{t("cookies_third_2")}</p>

          <p className={styles.section}>{t("cookies_no_title")}</p>
          <p className={styles.body}>{t("cookies_no_1")}</p>
          <p className={styles.body}>• {t("cookies_no_list_1")}</p>
          <p className={styles.body}>• {t("cookies_no_list_2")}</p>
          <p className={styles.body}>• {t("cookies_no_list_3")}</p>
          <p className={styles.body}>• {t("cookies_no_list_4")}</p>

          <p className={styles.section}>{t("cookies_choices_title")}</p>
          <p className={styles.body}>{t("cookies_choices_1")}</p>
          <p className={styles.body}>{t("cookies_choices_2")}</p>

          <p className={styles.section}>{t("cookies_contact_title")}</p>
          <p className={styles.body}>
            {t("cookies_contact_1")}{" "}
            <a className={styles.emailLink} href="mailto:support@livadai.com">
              support@livadai.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
