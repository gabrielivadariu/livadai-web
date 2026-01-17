"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

type NavItem = {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
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

const IconBag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M6 8h12l-1 12H7L6 8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconProfile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" />
    <path d="M4 20a8 8 0 0116 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const items: NavItem[] = [
  { href: "/experiences", labelKey: "bottom_experiences", icon: <IconList /> },
  { href: "/map", labelKey: "bottom_map", icon: <IconMap /> },
  { href: "/my-activities", labelKey: "bottom_my_activities", icon: <IconBag /> },
  { href: "/profile", labelKey: "bottom_profile", icon: <IconProfile /> },
];

export default function BottomNav({ pathname }: { pathname: string | null }) {
  const t = useT();
  return (
    <nav className="tab-bar">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={`tab-item ${active ? "active" : ""}`}>
            {item.icon}
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
