 "use client";

import styles from "@/app/(app)/legal.module.css";
import { useT } from "@/lib/i18n";

export default function PrivacyPage() {
  const t = useT();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{t("privacy_title")}</h1>
        <p className={styles.body}>{t("privacy_last_updated")}</p>
      </div>
      <div className={styles.card}>
        <div className={styles.stack}>
          <p className={styles.body}>{t("privacy_intro_1")}</p>
          <p className={styles.body}>{t("privacy_intro_2")}</p>
          <p className={styles.body}>{t("privacy_intro_3")}</p>

          <p className={styles.section}>{t("privacy_who_title")}</p>
          <p className={styles.body}>{t("privacy_who_1")}</p>
          <p className={styles.body}>{t("privacy_who_2")}</p>
          <p className={styles.body}>{t("privacy_who_3")}</p>
          <p className={styles.body}>
            {t("privacy_contact_label")}{" "}
            <a className={styles.emailLink} href="mailto:contact@livadai.com">
              contact@livadai.com
            </a>
          </p>

          <p className={styles.section}>{t("privacy_collect_title")}</p>
          <p className={styles.body}>{t("privacy_collect_1")}</p>
          <p className={styles.section}>{t("privacy_collect_direct_title")}</p>
          <p className={styles.body}>{t("privacy_collect_direct_1")}</p>
          <p className={styles.body}>• {t("privacy_collect_direct_email")}</p>
          <p className={styles.body}>• {t("privacy_collect_direct_phone")}</p>
          <p className={styles.body}>• {t("privacy_collect_direct_name")}</p>
          <p className={styles.body}>• {t("privacy_collect_direct_role")}</p>
          <p className={styles.body}>• {t("privacy_collect_direct_profile")}</p>
          <p className={styles.body}>• {t("privacy_collect_direct_content")}</p>

          <p className={styles.section}>{t("privacy_collect_booking_title")}</p>
          <p className={styles.body}>{t("privacy_collect_booking_1")}</p>
          <p className={styles.body}>• {t("privacy_collect_booking_details")}</p>
          <p className={styles.body}>• {t("privacy_collect_booking_status")}</p>
          <p className={styles.body}>• {t("privacy_collect_booking_payout")}</p>
          <p className={styles.body}>{t("privacy_collect_booking_no_card")}</p>
          <p className={styles.body}>{t("privacy_collect_booking_stripe")}</p>

          <p className={styles.section}>{t("privacy_collect_comms_title")}</p>
          <p className={styles.body}>{t("privacy_collect_comms_1")}</p>
          <p className={styles.body}>• {t("privacy_collect_comms_chat")}</p>
          <p className={styles.body}>• {t("privacy_collect_comms_fraud")}</p>
          <p className={styles.body}>• {t("privacy_collect_comms_support")}</p>

          <p className={styles.section}>{t("privacy_use_title")}</p>
          <p className={styles.body}>{t("privacy_use_1")}</p>
          <p className={styles.body}>• {t("privacy_use_accounts")}</p>
          <p className={styles.body}>• {t("privacy_use_bookings")}</p>
          <p className={styles.body}>• {t("privacy_use_payments")}</p>
          <p className={styles.body}>• {t("privacy_use_emails")}</p>
          <p className={styles.body}>• {t("privacy_use_support")}</p>
          <p className={styles.body}>• {t("privacy_use_security")}</p>
          <p className={styles.body}>• {t("privacy_use_improve")}</p>
          <p className={styles.body}>{t("privacy_use_no_sell")}</p>
          <p className={styles.body}>{t("privacy_use_no_ads")}</p>

          <p className={styles.section}>{t("privacy_legal_title")}</p>
          <p className={styles.body}>{t("privacy_legal_1")}</p>
          <p className={styles.body}>• {t("privacy_legal_contract")}</p>
          <p className={styles.body}>• {t("privacy_legal_obligation")}</p>
          <p className={styles.body}>• {t("privacy_legal_interest")}</p>
          <p className={styles.body}>• {t("privacy_legal_consent")}</p>

          <p className={styles.section}>{t("privacy_payments_title")}</p>
          <p className={styles.section}>{t("privacy_payments_stripe_title")}</p>
          <p className={styles.body}>{t("privacy_payments_stripe_1")}</p>
          <p className={styles.body}>{t("privacy_payments_stripe_2")}</p>
          <p className={styles.body}>{t("privacy_payments_stripe_3")}</p>
          <p className={styles.body}>• {t("privacy_payments_stripe_cards")}</p>
          <p className={styles.body}>• {t("privacy_payments_stripe_bank")}</p>
          <p className={styles.body}>• {t("privacy_payments_stripe_auth")}</p>

          <p className={styles.section}>{t("privacy_payments_providers_title")}</p>
          <p className={styles.body}>{t("privacy_payments_providers_1")}</p>
          <p className={styles.body}>• {t("privacy_payments_providers_email")}</p>
          <p className={styles.body}>• {t("privacy_payments_providers_hosting")}</p>
          <p className={styles.body}>• {t("privacy_payments_providers_analytics")}</p>
          <p className={styles.body}>{t("privacy_payments_providers_2")}</p>

          <p className={styles.section}>{t("privacy_retention_title")}</p>
          <p className={styles.body}>{t("privacy_retention_1")}</p>
          <p className={styles.body}>• {t("privacy_retention_active")}</p>
          <p className={styles.body}>• {t("privacy_retention_legal")}</p>
          <p className={styles.body}>• {t("privacy_retention_disputes")}</p>
          <p className={styles.body}>{t("privacy_retention_delete")}</p>

          <p className={styles.section}>{t("privacy_security_title")}</p>
          <p className={styles.body}>{t("privacy_security_1")}</p>
          <p className={styles.body}>• {t("privacy_security_https")}</p>
          <p className={styles.body}>• {t("privacy_security_access")}</p>
          <p className={styles.body}>• {t("privacy_security_auth")}</p>
          <p className={styles.body}>{t("privacy_security_2")}</p>

          <p className={styles.section}>{t("privacy_children_title")}</p>
          <p className={styles.body}>{t("privacy_children_1")}</p>
          <p className={styles.body}>{t("privacy_children_2")}</p>
          <p className={styles.body}>{t("privacy_children_3")}</p>

          <p className={styles.section}>{t("privacy_rights_title")}</p>
          <p className={styles.body}>{t("privacy_rights_1")}</p>
          <p className={styles.body}>• {t("privacy_rights_access")}</p>
          <p className={styles.body}>• {t("privacy_rights_correct")}</p>
          <p className={styles.body}>• {t("privacy_rights_delete")}</p>
          <p className={styles.body}>• {t("privacy_rights_restrict")}</p>
          <p className={styles.body}>• {t("privacy_rights_portability")}</p>
          <p className={styles.body}>• {t("privacy_rights_withdraw")}</p>
          <p className={styles.body}>
            {t("privacy_rights_contact")}{" "}
            <a className={styles.emailLink} href="mailto:contact@livadai.com">
              contact@livadai.com
            </a>
          </p>

          <p className={styles.section}>{t("privacy_transfers_title")}</p>
          <p className={styles.body}>{t("privacy_transfers_1")}</p>

          <p className={styles.section}>{t("privacy_changes_title")}</p>
          <p className={styles.body}>{t("privacy_changes_1")}</p>

          <p className={styles.section}>{t("privacy_contact_title")}</p>
          <p className={styles.body}>
            {t("privacy_contact_1")}{" "}
            <a className={styles.emailLink} href="mailto:contact@livadai.com">
              contact@livadai.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
