"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useT } from "@/lib/i18n";

type Props = {
  pathname: string | null;
};

const IOS_APP_URL = "https://apps.apple.com/ro/app/livadai/id6758622116?l=ro";

export default function TopNav({ pathname }: Props) {
  const router = useRouter();
  const t = useT();
  const { user, logout } = useAuth();
  const [profileName, setProfileName] = useState("");
  const name = profileName || t("nav_profile_fallback");
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const isHost = user?.role === "HOST" || user?.role === "BOTH";
  const navItems = [
    { href: "/experiences", labelKey: "nav_explorers" },
    user
      ? isHost
        ? { href: "/host", labelKey: "nav_hosts" }
        : { href: "/profile", labelKey: "nav_profile" }
      : null,
    { href: "/map", labelKey: "nav_map" },
  ].filter(Boolean) as { href: string; labelKey: string }[];

  const onLogout = () => {
    logout();
    router.replace("/login");
  };

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      if (!user) {
        if (active) setProfileName("");
        return;
      }
      try {
        const data = await apiGet<{ displayName?: string; name?: string }>("/users/me/profile");
        if (!active) return;
        const resolvedName = data?.displayName || data?.name || "";
        setProfileName(resolvedName);
      } catch {
        if (active) setProfileName("");
      }
    };
    loadProfile();
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    let active = true;
    const loadUnread = async () => {
      if (!user) {
        if (active) setUnreadCount(0);
        if (active) setUnreadMessages(0);
        return;
      }
      try {
        const data = await apiGet<{ count?: number }>("/notifications/unread-count");
        if (active) setUnreadCount(Number(data?.count || 0));
        const messagesData = await apiGet<{ count?: number }>("/messages/unread-count");
        if (active) setUnreadMessages(Number(messagesData?.count || 0));
      } catch {
        if (active) setUnreadCount(0);
        if (active) setUnreadMessages(0);
      }
    };
    loadUnread();
    const interval = setInterval(loadUnread, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

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

      <a
        className="nav-download"
        href={IOS_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("nav_download_ios")}
      </a>

      {user ? (
        <div className="nav-actions">
          <Link className="nav-icon" href="/messages" aria-label={t("nav_messages")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 5.5h16v9H8l-4 4V5.5z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          {unreadMessages > 0 ? <span className="nav-badge">{unreadMessages}</span> : null}
        </Link>
        <Link className="nav-icon" href="/notifications" aria-label={t("nav_notifications")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4a6 6 0 00-6 6v3.5l-1.5 2.5h15L18 13.5V10a6 6 0 00-6-6z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M9 19a3 3 0 006 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {unreadCount > 0 ? <span className="nav-badge">{unreadCount}</span> : null}
        </Link>
        </div>
      ) : (
        <div className="nav-auth">
          <Link className="nav-auth-link" href="/login">
            {t("login_button")}
          </Link>
          <Link className="nav-auth-link primary" href="/register">
            {t("login_register")}
          </Link>
        </div>
      )}

      {user ? (
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
              <button type="button" onClick={onLogout}>
                {t("nav_logout")}
              </button>
            </div>
          </details>
        </div>
      ) : null}
    </header>
  );
}
