"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

type Props = {
  pathname: string | null;
};

const navItems = [
  { href: "/experiences", label: "Explorers" },
  { href: "/host", label: "Hosts" },
  { href: "/map", label: "Hartă" },
];

export default function TopNav({ pathname }: Props) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const name = user?.name || user?.displayName || "Profil";

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
        <span className="brand-tag">Authentic local experiences</span>
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
        <input className="nav-search-input" placeholder="Caută experiențe, locuri, gazde" />
      </div>

      <nav className="nav-links">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`}>
              {item.label}
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
            <Link href="/menu">Meniu</Link>
            <Link href="/profile">Profil</Link>
            <Link href="/settings">Setări</Link>
            <Link href="/my-activities">Activitatea mea</Link>
            <button type="button" onClick={onLogout}>
              Deconectare
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
