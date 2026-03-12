import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditorialPage, { type EditorialSection, type ExperienceCard } from "@/components/seo/editorial-page";
import JsonLd from "@/components/seo/json-ld";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  cityGuides,
  guidePages,
  initialQueryPageOrder,
  majorCityOrder,
  scalableQueryTemplates,
  type CitySlug,
  type QuerySlug,
} from "@/lib/seo/content";
import { getCityExperiences } from "@/lib/seo/server";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildItemListSchema,
  buildWebPageSchema,
} from "@/lib/seo/schema";

export const revalidate = 3600;
export const dynamicParams = false;

type PageProps = {
  params: Promise<{ city: string; topic: string }>;
};

const cityNames = new Set(majorCityOrder);
const topicNames = new Set(initialQueryPageOrder);

const isCitySlug = (value: string): value is CitySlug => cityNames.has(value as CitySlug);
const isTopicSlug = (value: string): value is QuerySlug => topicNames.has(value as QuerySlug);

const formatExperienceCards = async (city: CitySlug): Promise<ExperienceCard[]> => {
  const items = await getCityExperiences(city);
  return items.slice(0, 6).map((item) => ({
    href: `/experiences/${item._id}`,
    title: item.title,
    description:
      item.shortDescription ||
      item.description ||
      `Vezi o experienta locala in ${item.city || cityGuides[city].name} si foloseste pagina pentru a verifica rapid daca se potriveste cu planul tau.`,
    meta: [item.city || cityGuides[city].name, item.address || "Locatie disponibila pe pagina experientei", item.price ? `${item.price} ${item.currencyCode || "RON"}` : "Vezi disponibilitatea"].filter(Boolean).join(" · "),
  }));
};

export async function generateStaticParams() {
  return majorCityOrder.flatMap((city) => initialQueryPageOrder.map((topic) => ({ city, topic })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city, topic } = await params;
  if (!isCitySlug(city) || !isTopicSlug(topic)) return {};
  const guide = cityGuides[city];
  const template = scalableQueryTemplates[topic];

  return buildSeoMetadata({
    title: template.title(guide),
    description: template.description(guide),
    path: `/${city}/${topic}`,
    keywords: [template.h1(guide), `experiente ${guide.name}`, `ghid ${guide.name}`, guide.englishIntent],
    type: "article",
  });
}

export default async function QueryLandingPage({ params }: PageProps) {
  const { city, topic } = await params;
  if (!isCitySlug(city) || !isTopicSlug(topic)) notFound();

  const guide = cityGuides[city];
  const template = scalableQueryTemplates[topic];
  const experiences = await formatExperienceCards(city);
  const relatedLinks = [
    { href: `/${city}`, title: `Ghidul principal pentru ${guide.name}`, description: `Hubul cu idei generale, experiente si intrebari frecvente pentru ${guide.name}.` },
    { href: "/guides", title: "Toate ghidurile LIVADAI", description: "Hubul editorial cu pagini de oras, idei de weekend si ghiduri utile." },
    ...initialQueryPageOrder
      .filter((item) => item !== topic)
      .slice(0, 3)
      .map((item) => ({
        href: `/${city}/${item}`,
        title: scalableQueryTemplates[item].h1(guide),
        description: scalableQueryTemplates[item].description(guide),
      })),
    ...guidePages
      .filter((page) => page.slug.includes(city) || page.slug === "top-experiente-romania")
      .slice(0, 2)
      .map((page) => ({ href: `/guides/${page.slug}`, title: page.title, description: page.description })),
  ].slice(0, 6);

  const sections: EditorialSection[] = [
    {
      title: `Raspuns rapid pentru ${template.h1(guide)}`,
      paragraphs: template.intro(guide),
    },
    {
      title: `Idei concrete pentru ${guide.name}`,
      paragraphs: [
        `Mai jos ai o selectie de idei care raspund direct intentiei de cautare ${template.h1(guide).toLowerCase()}. Continutul este gandit sa fie usor de citit, rezumat si citat, fara marketing vag.`,
      ],
      bullets: template.bullets(guide),
    },
    {
      title: `Pagini conexe pentru ${guide.name}`,
      paragraphs: [
        `Daca vrei sa aprofundezi aceeasi intrebare din mai multe unghiuri, foloseste linkurile de mai jos. Sunt create special ca sa conecteze orasul, experientele si ghidurile LIVADAI.`,
      ],
      links: relatedLinks,
    },
  ];

  const itemList = experiences.map((experience) => ({
    name: experience.title,
    path: experience.href,
    description: experience.description,
  }));

  const schema = [
    buildBreadcrumbSchema([
      { name: "LIVADAI", path: "/experiences" },
      { name: guide.name, path: `/${city}` },
      { name: template.h1(guide), path: `/${city}/${topic}` },
    ]),
    buildWebPageSchema({
      title: template.h1(guide),
      description: template.description(guide),
      path: `/${city}/${topic}`,
    }),
    buildArticleSchema({
      title: template.h1(guide),
      description: template.description(guide),
      path: `/${city}/${topic}`,
      articleSection: [template.h1(guide), "Idei concrete", "Intrebari frecvente"],
    }),
    buildFaqSchema(template.faq(guide)),
    itemList.length ? buildItemListSchema({ title: `Experiente relevante pentru ${template.h1(guide)}`, items: itemList }) : null,
  ];

  return (
    <>
      <JsonLd data={schema} />
      <EditorialPage
        eyebrow={`Intentie de cautare · ${guide.name}`}
        title={template.h1(guide)}
        lead={`${template.intro(guide)[0]} ${template.intro(guide)[1]}`}
        intro={template.intro(guide).slice(2)}
        breadcrumbs={[
          { name: "LIVADAI", href: "/experiences" },
          { name: guide.name, href: `/${city}` },
          { name: template.h1(guide), href: `/${city}/${topic}` },
        ]}
        sections={sections}
        faqs={template.faq(guide)}
        experiences={experiences}
        relatedLinks={relatedLinks}
      />
    </>
  );
}
