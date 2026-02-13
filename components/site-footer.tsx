"use client";

import Link from "next/link";
import styles from "./site-footer.module.css";
import { useT } from "@/lib/i18n";

export default function SiteFooter() {
  const t = useT();
  const links = [
    { href: "/about", label: t("menu_about_title") },
    { href: "/privacy", label: t("menu_privacy_title") },
    { href: "/terms", label: t("menu_terms_title") },
    { href: "/community-guidelines", label: t("community_title").replace(" – LIVADAI", "") },
    { href: "/cookies", label: t("cookies_title").replace(" – LIVADAI", "") },
    { href: "/contact", label: t("menu_contact") },
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
