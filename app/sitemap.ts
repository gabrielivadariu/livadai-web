import type { MetadataRoute } from "next";
import { guidePages, initialQueryPageOrder, majorCityOrder } from "@/lib/seo/content";
import { fetchAllPublicExperiences } from "@/lib/seo/server";
import { SITE_URL, absoluteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = [
    "/",
    "/experiences",
    "/guides",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/community-guidelines",
    "/how-it-works",
    "/how-it-works-host",
    "/trust-safety",
    "/iasi",
    "/cluj",
    "/bucuresti",
    "/timisoara",
    "/brasov",
  ];

  const seoQueryPages = majorCityOrder.flatMap((city) => initialQueryPageOrder.map((topic) => `/${city}/${topic}`));
  const guideUrls = guidePages.map((guide) => `/guides/${guide.slug}`);
  const experiences = await fetchAllPublicExperiences();

  const entries = [
    ...staticPages,
    ...seoQueryPages,
    ...guideUrls,
    ...experiences.map((experience) => `/experiences/${experience._id}`),
  ];

  return Array.from(new Set(entries)).map((path) => ({
    url: path === "/" ? SITE_URL : absoluteUrl(path),
    lastModified: now,
    changeFrequency: path.startsWith("/experiences/") ? "daily" : "weekly",
    priority: path.startsWith("/guides") || majorCityOrder.some((city) => path === `/${city}`) ? 0.9 : 0.7,
  }));
}
