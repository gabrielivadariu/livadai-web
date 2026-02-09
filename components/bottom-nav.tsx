"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { apiGet } from "@/lib/api";
import { useT } from "@/lib/i18n";

type NavItem = {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  badge?: number;
  match?: (pathname: string | null) => boolean;
};

const IconList = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconMap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6-2 6 2v12l-6-2-6 2-6-2V4l6 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const IconProfile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" />
    <path d="M4 20a8 8 0 0116 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconMessage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M4 5.5h16v9H8l-4 4V5.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 4a6 6 0 00-6 6v3.5l-1.5 2.5h15L18 13.5V10a6 6 0 00-6-6z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M9 19a3 3 0 006 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function BottomNav({ pathname }: { pathname: string | null }) {
  const t = useT();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    let active = true;
    const loadUnread = async () => {
      if (!user) {
        if (active) {
          setUnreadCount(0);
          setUnreadMessages(0);
        }
        return;
      }
      try {
        const notificationsData = await apiGet<{ count?: number }>("/notifications/unread-count");
        const messagesData = await apiGet<{ count?: number }>("/messages/unread-count");
        if (!active) return;
        setUnreadCount(Number(notificationsData?.count || 0));
        setUnreadMessages(Number(messagesData?.count || 0));
      } catch {
        if (!active) return;
        setUnreadCount(0);
        setUnreadMessages(0);
      }
    };
    loadUnread();
    const interval = window.setInterval(loadUnread, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [user]);

  const items = useMemo<NavItem[]>(() => {
    if (!user) {
      return [
        {
          href: "/experiences",
          labelKey: "bottom_experiences",
          icon: <IconList />,
          match: (path) => Boolean(path?.startsWith("/experiences")),
        },
        {
          href: "/map",
          labelKey: "bottom_map",
          icon: <IconMap />,
          match: (path) => Boolean(path?.startsWith("/map")),
        },
        {
          href: "/login",
          labelKey: "login_button",
          icon: <IconProfile />,
          match: (path) => path === "/login",
        },
        {
          href: "/register",
          labelKey: "login_register",
          icon: <IconMenu />,
          match: (path) => path === "/register",
        },
      ];
    }
    return [
      {
        href: "/experiences",
        labelKey: "bottom_experiences",
        icon: <IconList />,
        match: (path) => Boolean(path?.startsWith("/experiences")),
      },
      {
        href: "/map",
        labelKey: "bottom_map",
        icon: <IconMap />,
        match: (path) => Boolean(path?.startsWith("/map")),
      },
      {
        href: "/messages",
        labelKey: "nav_messages",
        icon: <IconMessage />,
        badge: unreadMessages,
        match: (path) => Boolean(path?.startsWith("/messages")),
      },
      {
        href: "/notifications",
        labelKey: "nav_notifications",
        icon: <IconBell />,
        badge: unreadCount,
        match: (path) => Boolean(path?.startsWith("/notifications")),
      },
      {
        href: "/menu",
        labelKey: "nav_menu",
        icon: <IconMenu />,
        match: (path) =>
          Boolean(
            path?.startsWith("/menu") ||
              path?.startsWith("/profile") ||
              path?.startsWith("/settings") ||
              path?.startsWith("/host")
          ),
      },
    ];
  }, [unreadCount, unreadMessages, user]);

  return (
    <nav className="tab-bar">
      {items.map((item) => {
        const active = item.match ? item.match(pathname) : pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={`tab-item ${active ? "active" : ""}`}>
            <span className="tab-icon-wrap">
              {item.icon}
              {item.badge && item.badge > 0 ? (
                <span className="tab-item-badge">{item.badge > 99 ? "99+" : item.badge}</span>
              ) : null}
            </span>
            <span className="tab-item-label">{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
