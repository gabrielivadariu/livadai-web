import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditorialPage, { type EditorialSection, type ExperienceCard } from "@/components/seo/editorial-page";
import JsonLd from "@/components/seo/json-ld";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { cityGuides, guidePages, majorCityOrder, type CitySlug } from "@/lib/seo/content";
import { getCityExperiences, getFeaturedExperiences } from "@/lib/seo/server";
import { buildArticleSchema, buildBreadcrumbSchema, buildFaqSchema, buildItemListSchema } from "@/lib/seo/schema";

export const revalidate = 3600;
export const dynamicParams = false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

const getGuideCity = (slug: string): CitySlug | null => {
  for (const city of majorCityOrder) {
    if (slug.includes(city)) return city;
  }
  return null;
};

const mapExperiences = (items: Awaited<ReturnType<typeof getFeaturedExperiences>>): ExperienceCard[] =>
  items.slice(0, 6).map((item) => ({
    href: `/experiences/${item._id}`,
    title: item.title,
    description:
      item.shortDescription ||
      item.description ||
      `Vezi o experienta locala si foloseste pagina ei pentru a continua explorarea pe LIVADAI.`,
    meta: [item.city || "Romania", item.address || "Locatie disponibila pe pagina experientei", item.price ? `${item.price} ${item.currencyCode || "RON"}` : "Vezi disponibilitatea"].filter(Boolean).join(" · "),
  }));

export async function generateStaticParams() {
  return guidePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = guidePages.find((page) => page.slug === slug);
  if (!guide) return {};

  return buildSeoMetadata({
    title: `${guide.title} | LIVADAI`,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    type: "article",
    keywords: [guide.title, guide.description],
  });
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = guidePages.find((page) => page.slug === slug);
  if (!guide) notFound();

  const guideCity = getGuideCity(slug);
  const experiences = mapExperiences(guideCity ? await getCityExperiences(guideCity) : await getFeaturedExperiences());
  const relatedLinks = [
    ...(guide.relatedLinks || []),
    ...(guideCity
      ? [{ href: `/${guideCity}`, title: `Hub ${cityGuides[guideCity].name}`, description: cityGuides[guideCity].directAnswer }]
      : majorCityOrder.slice(0, 3).map((city) => ({ href: `/${city}`, title: `Ce e de facut in ${cityGuides[city].name}`, description: cityGuides[city].directAnswer }))),
  ];

  const sections: EditorialSection[] = guide.sections;
  const schema = [
    buildBreadcrumbSchema([
      { name: "LIVADAI", path: "/experiences" },
      { name: "Ghiduri LIVADAI", path: "/guides" },
      { name: guide.title, path: `/guides/${guide.slug}` },
    ]),
    buildArticleSchema({
      title: guide.title,
      description: guide.description,
      path: `/guides/${guide.slug}`,
      articleSection: guide.sections.map((section) => section.title),
    }),
    guide.faq?.length ? buildFaqSchema(guide.faq) : null,
    experiences.length
      ? buildItemListSchema({
          title: `Experiente relevante pentru ${guide.title}`,
          items: experiences.map((experience) => ({ name: experience.title, path: experience.href, description: experience.description })),
        })
      : null,
  ];

  return (
    <>
      <JsonLd data={schema} />
      <EditorialPage
        eyebrow="Ghid editorial"
        title={guide.title}
        lead={guide.description}
        intro={guide.intro}
        breadcrumbs={[
          { name: "LIVADAI", href: "/experiences" },
          { name: "Ghiduri LIVADAI", href: "/guides" },
          { name: guide.title, href: `/guides/${guide.slug}` },
        ]}
        sections={sections}
        faqs={guide.faq}
        experiences={experiences}
        relatedLinks={relatedLinks}
      />
    </>
  );
}
