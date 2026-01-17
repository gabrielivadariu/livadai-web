"use client";

import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
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
  { href: "/experiences", label: "Experiențe", icon: <IconList /> },
  { href: "/map", label: "Harta", icon: <IconMap /> },
  { href: "/my-activities", label: "Activitățile mele", icon: <IconBag /> },
  { href: "/profile", label: "Profil", icon: <IconProfile /> },
];

export default function BottomNav({ pathname }: { pathname: string | null }) {
  return (
    <nav className="tab-bar">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={`tab-item ${active ? "active" : ""}`}>
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
