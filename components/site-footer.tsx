"use client";

import Link from "next/link";
import styles from "./site-footer.module.css";
import { useT } from "@/lib/i18n";

export default function SiteFooter() {
  const t = useT();
  const links = [
    { href: "/about", label: t("footer_about") },
    { href: "/privacy", label: t("footer_privacy") },
    { href: "/terms", label: t("footer_terms") },
    { href: "/community-guidelines", label: t("footer_community") },
    { href: "/cookies", label: t("footer_cookies") },
    { href: "/contact", label: t("footer_contact") },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <h2 className={styles.title}>LIVADAI</h2>
        <p className={styles.subtitle}>© 2026 LIVADAI</p>
        <div className={styles.links}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
