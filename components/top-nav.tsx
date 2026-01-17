"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useT } from "@/lib/i18n";

type Props = {
  pathname: string | null;
};

const navItems = [
  { href: "/experiences", labelKey: "nav_explorers" },
  { href: "/host", labelKey: "nav_hosts" },
  { href: "/map", labelKey: "nav_map" },
];

export default function TopNav({ pathname }: Props) {
  const router = useRouter();
  const t = useT();
  const { user, logout } = useAuth();
  const name = user?.name || user?.displayName || t("nav_profile_fallback");

  const onLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="top-nav">
      <div className="nav-left">
        <Link href="/experiences" className="brand">
          LIVADAI
        </Link>
        <span className="brand-tag">{t("nav_tagline")}</span>
      </div>

      <div className="nav-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-3.5-3.5"
            stroke="#64748b"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input className="nav-search-input" placeholder={t("nav_search_placeholder")} />
      </div>

      <nav className="nav-links">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`}>
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="nav-profile">
        <details className="profile-menu">
          <summary className="profile-summary">
            <span className="profile-dot" />
            <span>{name}</span>
          </summary>
          <div className="profile-dropdown">
            <Link href="/menu">{t("nav_menu")}</Link>
            <Link href="/profile">{t("nav_profile")}</Link>
            <Link href="/settings">{t("nav_settings")}</Link>
            <Link href="/my-activities">{t("nav_my_activities")}</Link>
            <button type="button" onClick={onLogout}>
              {t("nav_logout")}
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
