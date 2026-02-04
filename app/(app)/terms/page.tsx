 "use client";

import styles from "@/app/(app)/legal.module.css";
import { useT } from "@/lib/i18n";

export default function TermsPage() {
  const t = useT();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{t("terms_title")}</h1>
        <p className={styles.body}>{t("terms_last_updated")}</p>
      </div>
      <div className={styles.card}>
        <div className={styles.stack}>
          <p className={styles.body}>{t("terms_intro_1")}</p>
          <p className={styles.body}>{t("terms_intro_2")}</p>

          <p className={styles.section}>{t("terms_about_title")}</p>
          <p className={styles.body}>{t("terms_about_1")}</p>
          <p className={styles.body}>{t("terms_about_2")}</p>
          <p className={styles.body}>{t("terms_about_3")}</p>

          <p className={styles.section}>{t("terms_definitions_title")}</p>
          <p className={styles.body}>• {t("terms_def_platform")}</p>
          <p className={styles.body}>• {t("terms_def_explorer")}</p>
          <p className={styles.body}>• {t("terms_def_host")}</p>
          <p className={styles.body}>• {t("terms_def_experience")}</p>
          <p className={styles.body}>• {t("terms_def_booking")}</p>
          <p className={styles.body}>• {t("terms_def_content")}</p>

          <p className={styles.section}>{t("terms_eligibility_title")}</p>
          <p className={styles.body}>{t("terms_eligibility_1")}</p>
          <p className={styles.body}>• {t("terms_eligibility_age")}</p>
          <p className={styles.body}>• {t("terms_eligibility_capacity")}</p>
          <p className={styles.body}>• {t("terms_eligibility_truth")}</p>
          <p className={styles.body}>{t("terms_eligibility_2")}</p>

          <p className={styles.section}>{t("terms_accounts_title")}</p>
          <p className={styles.section}>{t("terms_accounts_create_title")}</p>
          <p className={styles.body}>{t("terms_accounts_create_1")}</p>
          <p className={styles.body}>• {t("terms_accounts_email")}</p>
          <p className={styles.body}>• {t("terms_accounts_phone")}</p>
          <p className={styles.body}>• {t("terms_accounts_other")}</p>
          <p className={styles.body}>{t("terms_accounts_create_2")}</p>
          <p className={styles.section}>{t("terms_accounts_responsibility_title")}</p>
          <p className={styles.body}>{t("terms_accounts_responsibility_1")}</p>
          <p className={styles.body}>{t("terms_accounts_responsibility_2")}</p>

          <p className={styles.section}>{t("terms_roles_title")}</p>
          <p className={styles.section}>{t("terms_roles_explorers_title")}</p>
          <p className={styles.body}>{t("terms_roles_explorers_1")}</p>
          <p className={styles.body}>• {t("terms_roles_explorers_browse")}</p>
          <p className={styles.body}>• {t("terms_roles_explorers_book")}</p>
          <p className={styles.body}>• {t("terms_roles_explorers_chat")}</p>
          <p className={styles.body}>• {t("terms_roles_explorers_reviews")}</p>

          <p className={styles.section}>{t("terms_roles_hosts_title")}</p>
          <p className={styles.body}>{t("terms_roles_hosts_1")}</p>
          <p className={styles.body}>• {t("terms_roles_hosts_create")}</p>
          <p className={styles.body}>• {t("terms_roles_hosts_prices")}</p>
          <p className={styles.body}>• {t("terms_roles_hosts_bookings")}</p>
          <p className={styles.body}>• {t("terms_roles_hosts_payouts")}</p>
          <p className={styles.body}>{t("terms_roles_hosts_2")}</p>
          <p className={styles.body}>• {t("terms_roles_hosts_accuracy")}</p>
          <p className={styles.body}>• {t("terms_roles_hosts_legal")}</p>
          <p className={styles.body}>• {t("terms_roles_hosts_safety")}</p>

          <p className={styles.section}>{t("terms_listings_title")}</p>
          <p className={styles.body}>{t("terms_listings_1")}</p>
          <p className={styles.body}>• {t("terms_listings_accurate")}</p>
          <p className={styles.body}>• {t("terms_listings_laws")}</p>
          <p className={styles.body}>• {t("terms_listings_locations")}</p>
          <p className={styles.body}>{t("terms_listings_2")}</p>

          <p className={styles.section}>{t("terms_bookings_title")}</p>
          <p className={styles.section}>{t("terms_bookings_process_title")}</p>
          <p className={styles.body}>{t("terms_bookings_process_1")}</p>
          <p className={styles.body}>• {t("terms_bookings_process_paid")}</p>
          <p className={styles.body}>• {t("terms_bookings_process_confirmed")}</p>
          <p className={styles.section}>{t("terms_payments_title")}</p>
          <p className={styles.body}>{t("terms_payments_1")}</p>
          <p className={styles.body}>{t("terms_payments_2")}</p>
          <p className={styles.section}>{t("terms_fees_title")}</p>
          <p className={styles.body}>{t("terms_fees_1")}</p>
          <p className={styles.body}>{t("terms_fees_2")}</p>

          <p className={styles.section}>{t("terms_cancellations_title")}</p>
          <p className={styles.body}>{t("terms_cancellations_1")}</p>
          <p className={styles.body}>• {t("terms_cancellations_host")}</p>
          <p className={styles.body}>• {t("terms_cancellations_framework")}</p>
          <p className={styles.body}>{t("terms_cancellations_2")}</p>
          <p className={styles.body}>• {t("terms_cancellations_time")}</p>
          <p className={styles.body}>• {t("terms_cancellations_conditions")}</p>
          <p className={styles.body}>• {t("terms_cancellations_rules")}</p>
          <p className={styles.body}>{t("terms_cancellations_3")}</p>

          <p className={styles.section}>{t("terms_comms_title")}</p>
          <p className={styles.body}>{t("terms_comms_1")}</p>
          <p className={styles.body}>• {t("terms_comms_respect")}</p>
          <p className={styles.body}>• {t("terms_comms_platform")}</p>
          <p className={styles.body}>• {t("terms_comms_contacts")}</p>
          <p className={styles.body}>{t("terms_comms_2")}</p>

          <p className={styles.section}>{t("terms_reviews_title")}</p>
          <p className={styles.body}>{t("terms_reviews_1")}</p>
          <p className={styles.body}>{t("terms_reviews_2")}</p>
          <p className={styles.body}>• {t("terms_reviews_false")}</p>
          <p className={styles.body}>• {t("terms_reviews_hate")}</p>
          <p className={styles.body}>• {t("terms_reviews_spam")}</p>
          <p className={styles.body}>{t("terms_reviews_3")}</p>

          <p className={styles.section}>{t("terms_prohibited_title")}</p>
          <p className={styles.body}>{t("terms_prohibited_1")}</p>
          <p className={styles.body}>• {t("terms_prohibited_fees")}</p>
          <p className={styles.body}>• {t("terms_prohibited_false")}</p>
          <p className={styles.body}>• {t("terms_prohibited_illegal")}</p>
          <p className={styles.body}>• {t("terms_prohibited_ip")}</p>
          <p className={styles.body}>• {t("terms_prohibited_harass")}</p>
          <p className={styles.body}>{t("terms_prohibited_2")}</p>

          <p className={styles.section}>{t("terms_ip_title")}</p>
          <p className={styles.body}>{t("terms_ip_1")}</p>
          <p className={styles.body}>{t("terms_ip_2")}</p>

          <p className={styles.section}>{t("terms_disclaimer_title")}</p>
          <p className={styles.body}>{t("terms_disclaimer_1")}</p>
          <p className={styles.body}>• {t("terms_disclaimer_quality")}</p>
          <p className={styles.body}>• {t("terms_disclaimer_actions")}</p>
          <p className={styles.body}>• {t("terms_disclaimer_liability")}</p>
          <p className={styles.body}>{t("terms_disclaimer_2")}</p>

          <p className={styles.section}>{t("terms_limitation_title")}</p>
          <p className={styles.body}>{t("terms_limitation_1")}</p>
          <p className={styles.body}>• {t("terms_limitation_indirect")}</p>
          <p className={styles.body}>• {t("terms_limitation_profits")}</p>
          <p className={styles.body}>• {t("terms_limitation_disputes")}</p>
          <p className={styles.body}>{t("terms_limitation_2")}</p>

          <p className={styles.section}>{t("terms_termination_title")}</p>
          <p className={styles.body}>{t("terms_termination_1")}</p>
          <p className={styles.body}>• {t("terms_termination_violation")}</p>
          <p className={styles.body}>• {t("terms_termination_fraud")}</p>
          <p className={styles.body}>• {t("terms_termination_legal")}</p>
          <p className={styles.body}>{t("terms_termination_2")}</p>

          <p className={styles.section}>{t("terms_law_title")}</p>
          <p className={styles.body}>{t("terms_law_1")}</p>
          <p className={styles.body}>{t("terms_law_2")}</p>

          <p className={styles.section}>{t("terms_changes_title")}</p>
          <p className={styles.body}>{t("terms_changes_1")}</p>

          <p className={styles.section}>{t("terms_contact_title")}</p>
          <p className={styles.body}>
            {t("terms_contact_1")}{" "}
            <a className={styles.emailLink} href="mailto:contact@livadai.com">
              contact@livadai.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
