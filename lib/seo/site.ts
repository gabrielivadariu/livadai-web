export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.livadai.com";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://livadai-backend-production.up.railway.app";
export const DEFAULT_REVALIDATE_SECONDS = 3600;

export const SITE_NAME = "LIVADAI";
export const SITE_DESCRIPTION =
  "Descopera ce e de facut in Iasi, Cluj, Bucuresti, Timisoara si Brasov. LIVADAI aduna ghiduri locale, idei de date, activitati de weekend si experiente rezervabile.";
export const ORGANIZATION_NAME = "LIVADAI";
export const ORGANIZATION_LOGO_PATH = "/icon.png";

export const absoluteUrl = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
};
