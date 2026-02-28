"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./site-footer.module.css";
import { useT } from "@/lib/i18n";

export default function SiteFooter() {
  const t = useT();
  const iosAppUrl = "https://apps.apple.com/ro/app/livadai/id6758622116?l=ro";
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
          <p className={styles.subtitle}>{t("footer_docs_subtitle")}</p>
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
      </div>

      <section className={styles.trustBanner} aria-label={t("footer_consumer_title")}>
        <div className={styles.trustBannerInner}>
          <p className={styles.bannerRights}>{t("footer_rights_reserved")}</p>
          <div className={styles.badgesWrap}>
            <div className={styles.badgesRow}>
              <a
                href={odrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.badgeLink}
                aria-label={t("footer_consumer_odr")}
              >
                <Image
                  src="/footer/odr.svg"
                  alt={t("footer_consumer_odr")}
                  width={520}
                  height={140}
                  className={styles.badgeImage}
                />
              </a>
              <a
                href={anpcSalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.badgeLink}
                aria-label={t("footer_consumer_sal")}
              >
                <Image
                  src="/footer/anpc-sal.svg"
                  alt={t("footer_consumer_sal")}
                  width={520}
                  height={140}
                  className={styles.badgeImage}
                />
              </a>
            </div>

            <a
              href={stripeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.stripeSticker}
              aria-label={t("footer_payments_title")}
            >
              <Image
                src="/footer/stripe-badge.svg"
                alt={`${t("footer_powered_by")} Stripe`}
                width={420}
                height={160}
                className={styles.stripeImage}
              />
            </a>
          </div>
        </div>
      </section>
    </footer>
  );
}
