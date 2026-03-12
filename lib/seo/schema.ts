import type { FAQItem } from "./content";
import { ORGANIZATION_LOGO_PATH, ORGANIZATION_NAME, SITE_NAME, SITE_URL, absoluteUrl } from "./site";

type BreadcrumbItem = {
  name: string;
  path: string;
};

type ItemListEntry = {
  name: string;
  path: string;
  description?: string;
};

export const buildWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "ro",
});

export const buildOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: ORGANIZATION_NAME,
  url: SITE_URL,
  logo: absoluteUrl(ORGANIZATION_LOGO_PATH),
  sameAs: [
    "https://www.instagram.com/livadaiapp/",
    "https://www.tiktok.com/@livadaiapp",
  ],
});

export const buildBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const buildFaqSchema = (items: FAQItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

export const buildArticleSchema = ({
  title,
  description,
  path,
  articleSection,
}: {
  title: string;
  description: string;
  path: string;
  articleSection: string[];
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  inLanguage: "ro",
  mainEntityOfPage: absoluteUrl(path),
  articleSection,
  author: {
    "@type": "Organization",
    name: ORGANIZATION_NAME,
  },
  publisher: {
    "@type": "Organization",
    name: ORGANIZATION_NAME,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(ORGANIZATION_LOGO_PATH),
    },
  },
});

export const buildItemListSchema = ({
  title,
  items,
}: {
  title: string;
  items: ItemListEntry[];
}) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: title,
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    url: absoluteUrl(item.path),
    description: item.description,
  })),
});
