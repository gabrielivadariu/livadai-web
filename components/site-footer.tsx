import Link from "next/link";
import styles from "./site-footer.module.css";

const links = [
  { href: "/about", label: "About LIVADAI" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/community-guidelines", label: "Community Guidelines" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/contact", label: "Contact" },
];

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <h2 className={styles.title}>LIVADAI</h2>
        <p className={styles.subtitle}>Official platform documentation (placeholder).</p>
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
