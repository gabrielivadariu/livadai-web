import type { Metadata } from "next";
import EditorialPage, { type EditorialSection } from "@/components/seo/editorial-page";
import JsonLd from "@/components/seo/json-ld";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { cityGuides, guidePages, majorCityOrder } from "@/lib/seo/content";
import { getFeaturedExperiences } from "@/lib/seo/server";
import { buildArticleSchema, buildBreadcrumbSchema, buildItemListSchema, buildWebPageSchema } from "@/lib/seo/schema";

export const revalidate = 3600;

export const metadata: Metadata = buildSeoMetadata({
  title: "Ghiduri LIVADAI | Ce e de facut in marile orase din Romania",
  description:
    "Hub editorial LIVADAI cu ghiduri utile despre ce e de facut in marile orase din Romania, idei de date, activitati de weekend si experiente locale.",
  path: "/guides",
});

export default async function GuidesIndexPage() {
  const featuredExperiences = (await getFeaturedExperiences()).slice(0, 6).map((item) => ({
    href: `/experiences/${item._id}`,
    title: item.title,
    description:
      item.shortDescription ||
      item.description ||
      `Vezi o experienta locala si foloseste pagina ei pentru a continua explorarea in orasul potrivit.`,
    meta: [item.city || "Romania", item.address || "Locatie disponibila pe pagina experientei", item.price ? `${item.price} ${item.currencyCode || "RON"}` : "Vezi disponibilitatea"].filter(Boolean).join(" · "),
  }));

  const sections: EditorialSection[] = [
    {
      title: "Ce gasesti in zona de Guides",
      paragraphs: [
        "Ghidurile LIVADAI sunt pagini editoriale statice, create pentru intrebari reale pe care oamenii le cauta in Google sau le pun direct instrumentelor AI: ce e de facut intr-un oras, ce faci in weekend, idei de date sau experiente care merita atentia ta.",
        "Fiecare ghid are continut vizibil, structurat, indexabil si legaturi interne catre huburile de oras si experientele reale de pe platforma.",
      ],
      links: guidePages.map((page) => ({ href: `/guides/${page.slug}`, title: page.title, description: page.description })),
    },
    {
      title: "Huburi urbane importante",
      paragraphs: [
        "Daca vrei sa pornesti de la un oras si abia apoi sa alegi intentia de cautare, foloseste huburile locale de mai jos. Ele concentreaza ideile de top, experientele si legaturile spre paginile long-tail.",
      ],
      links: majorCityOrder.map((city) => ({ href: `/${city}`, title: `Ce e de facut in ${cityGuides[city].name}`, description: cityGuides[city].directAnswer })),
    },
    {
      title: "Orase acoperite in ghidurile LIVADAI",
      paragraphs: [
        "Acest hub editorial acopera acum mai multe orase importante din Romania, astfel incat oamenii sa gaseasca raspunsuri utile si citabile pentru cautari reale precum ce e de facut, idei de date, activitati de weekend, hidden gems sau planuri pentru familie.",
      ],
      bullets: majorCityOrder.map(
        (city) =>
          `${cityGuides[city].name} - ghid de oras, pagini long-tail si linkuri interne catre experiente relevante.`,
      ),
    },
  ];

  const schema = [
    buildBreadcrumbSchema([
      { name: "LIVADAI", path: "/experiences" },
      { name: "Ghiduri LIVADAI", path: "/guides" },
    ]),
    buildWebPageSchema({
      title: "Ghiduri LIVADAI",
      description:
        "Hub editorial LIVADAI cu ghiduri utile despre ce e de facut in marile orase din Romania.",
      path: "/guides",
    }),
    buildArticleSchema({
      title: "Ghiduri LIVADAI",
      description:
        "Hub editorial LIVADAI cu ghiduri utile despre ce e de facut in marile orase din Romania.",
      path: "/guides",
      articleSection: ["Ghiduri", "Orase", "Experiente"],
    }),
    buildItemListSchema({
      title: "Ghiduri LIVADAI",
      items: guidePages.map((page) => ({ name: page.title, path: `/guides/${page.slug}`, description: page.description })),
    }),
  ];

  return (
    <>
      <JsonLd data={schema} />
      <EditorialPage
        eyebrow="Descopera · Ghiduri"
        title="Ghiduri LIVADAI pentru orase, weekenduri si idei de iesit"
        lead="Ghidurile LIVADAI sunt hubul editorial separat al platformei: aici gasesti raspunsuri directe la cautari reale precum ce e de facut intr-un oras, ce faci in weekend, idei de date, hidden gems, activitati pentru familie sau activitati de cuplu. Paginile sunt statice, indexabile si construite cu text vizibil in HTML, FAQ-uri clare, linkuri interne utile si schema JSON-LD pentru o intelegere mai buna in Google si in instrumentele AI. Din acest hub poti intra in paginile de oras, ghidurile editoriale si experientele relevante fara sa schimbi flow-urile principale ale platformei."
        intro={[]}
        breadcrumbs={[
          { name: "LIVADAI", href: "/experiences" },
          { name: "Ghiduri LIVADAI", href: "/guides" },
        ]}
        sections={sections}
        experiences={featuredExperiences}
        relatedLinks={majorCityOrder.map((city) => ({ href: `/${city}`, title: `Hub ${cityGuides[city].name}`, description: cityGuides[city].directAnswer }))}
      />
    </>
  );
}
