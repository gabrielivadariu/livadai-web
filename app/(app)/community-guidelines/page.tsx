 "use client";

import styles from "@/app/(app)/legal.module.css";
import { useT } from "@/lib/i18n";

export default function CommunityGuidelinesPage() {
  const t = useT();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{t("community_title")}</h1>
        <p className={styles.body}>{t("community_last_updated")}</p>
      </div>
      <div className={styles.card}>
        <div className={styles.stack}>
          <p className={styles.body}>{t("community_intro_1")}</p>
          <p className={styles.body}>{t("community_intro_2")}</p>
          <p className={styles.body}>{t("community_intro_3")}</p>

          <p className={styles.section}>{t("community_spirit_title")}</p>
          <p className={styles.body}>{t("community_spirit_1")}</p>
          <p className={styles.body}>• {t("community_spirit_list_1")}</p>
          <p className={styles.body}>• {t("community_spirit_list_2")}</p>
          <p className={styles.body}>• {t("community_spirit_list_3")}</p>
          <p className={styles.body}>• {t("community_spirit_list_4")}</p>
          <p className={styles.body}>{t("community_spirit_2")}</p>

          <p className={styles.section}>{t("community_respect_title")}</p>
          <p className={styles.body}>{t("community_respect_1")}</p>
          <p className={styles.body}>{t("community_respect_2")}</p>
          <p className={styles.body}>• {t("community_respect_list_1")}</p>
          <p className={styles.body}>• {t("community_respect_list_2")}</p>
          <p className={styles.body}>• {t("community_respect_list_3")}</p>
          <p className={styles.body}>• {t("community_respect_list_4")}</p>
          <p className={styles.body}>{t("community_respect_3")}</p>

          <p className={styles.section}>{t("community_auth_title")}</p>
          <p className={styles.body}>{t("community_auth_1")}</p>
          <p className={styles.body}>• {t("community_auth_list_1")}</p>
          <p className={styles.body}>• {t("community_auth_list_2")}</p>
          <p className={styles.body}>• {t("community_auth_list_3")}</p>
          <p className={styles.body}>{t("community_auth_2")}</p>

          <p className={styles.section}>{t("community_experiences_title")}</p>
          <p className={styles.body}>{t("community_experiences_1")}</p>
          <p className={styles.body}>• {t("community_experiences_list_1")}</p>
          <p className={styles.body}>• {t("community_experiences_list_2")}</p>
          <p className={styles.body}>• {t("community_experiences_list_3")}</p>
          <p className={styles.body}>• {t("community_experiences_list_4")}</p>
          <p className={styles.body}>{t("community_experiences_2")}</p>

          <p className={styles.section}>{t("community_privacy_title")}</p>
          <p className={styles.body}>{t("community_privacy_1")}</p>
          <p className={styles.body}>{t("community_privacy_2")}</p>
          <p className={styles.body}>• {t("community_privacy_list_1")}</p>
          <p className={styles.body}>• {t("community_privacy_list_2")}</p>
          <p className={styles.body}>• {t("community_privacy_list_3")}</p>
          <p className={styles.body}>{t("community_privacy_3")}</p>

          <p className={styles.section}>{t("community_comms_title")}</p>
          <p className={styles.body}>{t("community_comms_1")}</p>
          <p className={styles.body}>• {t("community_comms_list_1")}</p>
          <p className={styles.body}>• {t("community_comms_list_2")}</p>
          <p className={styles.body}>• {t("community_comms_list_3")}</p>
          <p className={styles.body}>{t("community_comms_2")}</p>

          <p className={styles.section}>{t("community_forbidden_title")}</p>
          <p className={styles.body}>{t("community_forbidden_1")}</p>
          <p className={styles.body}>• {t("community_forbidden_list_1")}</p>
          <p className={styles.body}>• {t("community_forbidden_list_2")}</p>
          <p className={styles.body}>• {t("community_forbidden_list_3")}</p>
          <p className={styles.body}>• {t("community_forbidden_list_4")}</p>
          <p className={styles.body}>{t("community_forbidden_2")}</p>

          <p className={styles.section}>{t("community_enforcement_title")}</p>
          <p className={styles.body}>{t("community_enforcement_1")}</p>
          <p className={styles.body}>• {t("community_enforcement_list_1")}</p>
          <p className={styles.body}>• {t("community_enforcement_list_2")}</p>
          <p className={styles.body}>• {t("community_enforcement_list_3")}</p>
          <p className={styles.body}>{t("community_enforcement_2")}</p>

          <p className={styles.section}>{t("community_first_title")}</p>
          <p className={styles.body}>{t("community_first_1")}</p>
          <p className={styles.body}>{t("community_first_2")}</p>
          <p className={styles.body}>• {t("community_first_list_1")}</p>
          <p className={styles.body}>• {t("community_first_list_2")}</p>
          <p className={styles.body}>• {t("community_first_list_3")}</p>
          <p className={styles.body}>{t("community_first_3")}</p>

          <p className={styles.section}>{t("community_conclusion_title")}</p>
          <p className={styles.body}>{t("community_conclusion_1")}</p>
          <p className={styles.body}>{t("community_conclusion_2")}</p>
          <p className={styles.body}>{t("community_conclusion_3")}</p>
        </div>
      </div>
    </div>
  );
}
