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
  params: Promise<{ city: string }>;
};

const cityNames = new Set(majorCityOrder);

const isCitySlug = (value: string): value is CitySlug => cityNames.has(value as CitySlug);

const formatExperienceCards = async (city: CitySlug): Promise<ExperienceCard[]> => {
  const items = await getCityExperiences(city);
  return items.map((item) => ({
    href: `/experiences/${item._id}`,
    title: item.title,
    description:
      item.shortDescription ||
      item.description ||
      `Vezi o experienta locala in ${item.city || cityGuides[city].name} si foloseste pagina pentru a intelege rapid despre ce este vorba.`,
    meta: [item.city || cityGuides[city].name, item.address || "Locatie disponibila pe pagina experientei", item.price ? `${item.price} ${item.currencyCode || "RON"}` : "Vezi disponibilitatea"].filter(Boolean).join(" · "),
  }));
};

export async function generateStaticParams() {
  return majorCityOrder.map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  if (!isCitySlug(city)) return {};
  const guide = cityGuides[city];

  return buildSeoMetadata({
    title: `Ce e de facut in ${guide.name} | Ghid local si experiente ${guide.name} | LIVADAI`,
    description: `Ghid local pentru ${guide.name}: ce e de facut, idei de date, activitati de weekend, experiente unice si raspunsuri clare la intrebarile pe care le cauta oamenii in oras.`,
    path: `/${city}`,
    keywords: [
      `ce e de facut in ${guide.name}`,
      `what to do in ${guide.nameAscii}`,
      `date ideas in ${guide.nameAscii}`,
      `weekend ${guide.name}`,
      `experiente ${guide.name}`,
    ],
  });
}

export default async function CityLandingPage({ params }: PageProps) {
  const { city } = await params;
  if (!isCitySlug(city)) notFound();

  const guide = cityGuides[city];
  const experiences = await formatExperienceCards(city);
  const cityGuideLinks = initialQueryPageOrder.map((topic) => ({
    href: `/${city}/${topic}`,
    title: scalableQueryTemplates[topic].h1(guide),
    description: scalableQueryTemplates[topic].description(guide),
  }));
  const editorialLinks = [
    { href: "/guides", title: "Toate ghidurile LIVADAI", description: "Hubul editorial cu pagini de oras, idei de weekend si ghiduri utile." },
    ...guidePages
      .filter((page) => page.slug === "top-experiente-romania" || page.slug.includes(city))
      .map((page) => ({
        href: `/guides/${page.slug}`,
        title: page.title,
        description: page.description,
      })),
  ].slice(0, 4);

  const sections: EditorialSection[] = [
    {
      title: `Top lucruri de facut in ${guide.name}`,
      paragraphs: [
        `Daca vrei un raspuns simplu pentru ${guide.name}, incepe cu un mix intre oras, experiente locale si timp bine structurat. Sectiunea aceasta functioneaza ca raspuns rapid pentru cautarile de tip ce e de facut in ${guide.name}.`,
      ],
      bullets: guide.topThingsToDo,
    },
    {
      title: `Experiente unice in ${guide.name}`,
      paragraphs: [
        `Experientele cu adevarat bune din ${guide.name} sunt cele in care participi activ, nu doar treci printr-un loc. De aceea merita sa legi orasul de activitati locale, rezervabile si explicate clar.`,
      ],
      bullets: guide.uniqueExperiences,
    },
    {
      title: `Idei de date in ${guide.name}`,
      paragraphs: [
        `Pentru cupluri sau pentru oameni care vor o iesire bine gandita, ${guide.name} are suficienta varietate cat sa creezi un date memorabil fara sa complici inutil programul.`,
      ],
      bullets: guide.dateIdeas,
    },
    {
      title: `Activitati de weekend in ${guide.name}`,
      paragraphs: [
        `Weekendul in ${guide.name} merge cel mai bine cand ai una sau doua activitati clare, nu un program incarcat doar ca sa bifezi locuri.`,
      ],
      bullets: guide.weekendActivities,
    },
    {
      title: `Lucruri cool de facut in ${guide.name}`,
      paragraphs: [
        `Cand oamenii cauta lucruri cool de facut in ${guide.name}, de obicei nu cauta inca o locatie cunoscuta, ci o iesire care sa aiba un mic concept, o energie buna si un motiv real pentru care merita sa iasa din casa.`,
      ],
      bullets: guide.coolIdeas,
    },
    {
      title: `Activitati pentru familie in ${guide.name}`,
      paragraphs: [
        `Pentru familii, cele mai bune planuri in ${guide.name} sunt cele care au durata clara, putina logistica si loc suficient pentru pauze. Sectiunea aceasta este gandita pentru cautari de tip activitati pentru familie in ${guide.name}.`,
      ],
      bullets: guide.familyIdeas,
    },
    {
      title: `Hidden gems si descoperiri locale in ${guide.name}`,
      paragraphs: [
        `Daca vrei sa vezi partea mai putin previzibila a orasului, merita sa cauti si hidden gems in ${guide.name}: activitati locale, contexte bine construite si planuri care ies din traseul standard.`,
      ],
      bullets: guide.hiddenGems,
    },
    {
      title: `Pagini utile pentru cautari de tip intentie in ${guide.name}`,
      paragraphs: [
        `Fiecare pagina de mai jos raspunde direct unei cautari reale: ce faci in weekend, idei de date, activitati de cuplu sau lucruri cool de facut in ${guide.name}.`,
      ],
      links: cityGuideLinks,
    },
  ];

  const breadcrumbs = [
    { name: "LIVADAI", href: "/experiences" },
    { name: guide.name, href: `/${city}` },
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
    ]),
    buildWebPageSchema({
      title: `Ce e de facut in ${guide.name}?`,
      description: guide.directAnswer,
      path: `/${city}`,
    }),
    buildArticleSchema({
      title: `Ce e de facut in ${guide.name}`,
      description: guide.directAnswer,
      path: `/${city}`,
      articleSection: [
        "Top lucruri de facut",
        "Experiente unice",
        "Idei de date",
        "Activitati de weekend",
        "Lucruri cool",
        "Activitati pentru familie",
        "Hidden gems",
        "Intrebari frecvente",
      ],
    }),
    buildFaqSchema(guide.faq),
    itemList.length ? buildItemListSchema({ title: `Experiente LIVADAI in ${guide.name}`, items: itemList }) : null,
  ];

  return (
    <>
      <JsonLd data={schema} />
      <EditorialPage
        eyebrow={`Ghid de oras · ${guide.region}`}
        title={`Ce e de facut in ${guide.name}?`}
        lead={`${guide.directAnswer} ${guide.intro[0]}`}
        intro={guide.intro.slice(1)}
        breadcrumbs={breadcrumbs}
        sections={sections}
        faqs={guide.faq}
        experiences={experiences}
        relatedLinks={editorialLinks}
      />
    </>
  );
}
