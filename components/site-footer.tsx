"use client";

import Link from "next/link";
import styles from "./site-footer.module.css";
import { useT } from "@/lib/i18n";

export default function SiteFooter() {
  const t = useT();
  const iosAppUrl = "https://apps.apple.com/ro/app/livadai/id6758622116?l=ro";
  const anpcComplaintUrl = "https://reclamatii.anpc.ro/Reclamatie.aspx";
  const anpcSalUrl = "https://anpc.ro/sal/";
  const odrUrl = "https://ec.europa.eu/consumers/odr";
  const stripeUrl = "https://stripe.com";
  const links = [
    { href: "/about", label: t("footer_about") },
    { href: "/privacy", label: t("footer_privacy") },
    { href: "/terms", label: t("footer_terms") },
    { href: "/community-guidelines", label: t("footer_community") },
    { href: "/cookies", label: t("footer_cookies") },
    { href: "/contact", label: t("footer_contact") },
    { href: iosAppUrl, label: t("footer_download_ios"), external: true },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <h2 className={styles.title}>LIVADAI</h2>
          <p className={styles.subtitle}>{t("footer_rights_reserved")}</p>
        </div>

        <div className={styles.links}>
          {links.map((link) => (
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            )
          ))}
        </div>

        <div className={styles.trustGrid}>
          <section className={styles.consumerCard} aria-label={t("footer_consumer_title")}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{t("footer_consumer_title")}</h3>
              <span className={styles.cardBadge}>ANPC / ODR</span>
            </div>
            <a href="tel:0219551" className={styles.consumerPhone}>
              <span className={styles.consumerPhoneLabel}>{t("footer_consumer_phone_label")}</span>
              <strong>021 9551</strong>
            </a>
            <p className={styles.cardNote}>{t("footer_consumer_phone_note")}</p>
            <div className={styles.consumerActions}>
              <a href={anpcComplaintUrl} target="_blank" rel="noopener noreferrer" className={styles.trustLinkPrimary}>
                {t("footer_consumer_complaint_form")}
              </a>
              <a href={odrUrl} target="_blank" rel="noopener noreferrer" className={styles.trustLink}>
                {t("footer_consumer_odr")}
              </a>
              <a href={anpcSalUrl} target="_blank" rel="noopener noreferrer" className={styles.trustLink}>
                {t("footer_consumer_sal")}
              </a>
            </div>
          </section>

          <section className={styles.paymentsCard} aria-label={t("footer_payments_title")}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{t("footer_payments_title")}</h3>
              <span className={styles.cardBadge}>Secure checkout</span>
            </div>
            <a href={stripeUrl} target="_blank" rel="noopener noreferrer" className={styles.stripeBadge}>
              <span>{t("footer_powered_by")}</span>
              <strong>Stripe</strong>
            </a>
            <p className={styles.cardNote}>{t("footer_payments_note")}</p>
            <div className={styles.paymentMethods} aria-label={t("footer_payments_methods_label")}>
              {["Visa", "Mastercard", "Apple Pay", "Google Pay"].map((method) => (
                <span key={method} className={styles.methodChip}>{method}</span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </footer>
  );
}
