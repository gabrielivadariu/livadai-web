import { cache } from "react";
import type { CitySlug } from "./content";
import { API_URL, DEFAULT_REVALIDATE_SECONDS } from "./site";

export type SeoExperience = {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  city?: string;
  country?: string;
  address?: string;
  coverImageUrl?: string;
  startsAt?: string;
  startDate?: string;
  startTime?: string;
  price?: number;
  currencyCode?: string;
  activityType?: string;
  category?: string;
  remainingSpots?: number;
  maxParticipants?: number;
  seriesId?: string | null;
};

const cityAliases: Record<CitySlug, string[]> = {
  iasi: ["iasi", "iași"],
  cluj: ["cluj", "cluj napoca", "cluj-napoca"],
  bucuresti: ["bucuresti", "bucurești", "bucharest"],
  timisoara: ["timisoara", "timișoara"],
  brasov: ["brasov", "brașov"],
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toTimestamp = (value?: string) => {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const parsed = new Date(value);
  const time = parsed.getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
};

const buildExperienceGroupKey = (experience: SeoExperience) => {
  if (experience.seriesId) return `series:${experience.seriesId}`;
  return [experience.title, experience.address || experience.city || ""].map((part) => normalizeText(String(part || ""))).join("::");
};

const matchCity = (experience: SeoExperience, city: CitySlug) => {
  const haystack = normalizeText([experience.city, experience.address, experience.country].filter(Boolean).join(" "));
  return cityAliases[city].some((alias) => haystack.includes(normalizeText(alias)));
};

const sortExperiences = (items: SeoExperience[]) =>
  items
    .slice()
    .sort((a, b) => {
      const aTime = toTimestamp(a.startsAt || a.startDate);
      const bTime = toTimestamp(b.startsAt || b.startDate);
      if (aTime !== bTime) return aTime - bTime;
      return String(a.title || "").localeCompare(String(b.title || ""), "ro");
    });

const dedupeExperiences = (items: SeoExperience[]) => {
  const groups = new Map<string, SeoExperience[]>();
  items.forEach((item) => {
    const key = buildExperienceGroupKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)?.push(item);
  });

  return Array.from(groups.values()).map((group) => sortExperiences(group)[0]);
};

export const fetchAllPublicExperiences = cache(async (): Promise<SeoExperience[]> => {
  try {
    const response = await fetch(`${API_URL}/experiences`, {
      next: { revalidate: DEFAULT_REVALIDATE_SECONDS },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.filter((item) => item && typeof item === "object" && item._id && item.title);
  } catch {
    return [];
  }
});

export const getCityExperiences = cache(async (city: CitySlug): Promise<SeoExperience[]> => {
  const all = await fetchAllPublicExperiences();
  return sortExperiences(dedupeExperiences(all.filter((item) => matchCity(item, city)))).slice(0, 8);
});

export const getFeaturedExperiences = cache(async (): Promise<SeoExperience[]> => {
  const all = await fetchAllPublicExperiences();
  return sortExperiences(dedupeExperiences(all)).slice(0, 10);
});
