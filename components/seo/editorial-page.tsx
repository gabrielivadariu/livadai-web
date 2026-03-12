import Link from "next/link";
import styles from "./editorial-page.module.css";
import type { FAQItem, LinkItem } from "@/lib/seo/content";

export type EditorialSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  links?: LinkItem[];
};

export type ExperienceCard = {
  href: string;
  title: string;
  description: string;
  meta: string;
};

type Breadcrumb = {
  name: string;
  href?: string;
};

type EditorialPageProps = {
  eyebrow: string;
  title: string;
  lead: string;
  intro: string[];
  breadcrumbs: Breadcrumb[];
  sections: EditorialSection[];
  faqs?: FAQItem[];
  experiences?: ExperienceCard[];
  relatedLinks?: LinkItem[];
};

export default function EditorialPage({
  eyebrow,
  title,
  lead,
  intro,
  breadcrumbs,
  sections,
  faqs = [],
  experiences = [],
  relatedLinks = [],
}: EditorialPageProps) {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={`${item.name}-${index}`}>
                {item.href && !isLast ? (
                  <Link href={item.href} className={styles.breadcrumbLink}>
                    {item.name}
                  </Link>
                ) : (
                  <span className={styles.breadcrumbCurrent}>{item.name}</span>
                )}
                {!isLast ? " / " : null}
              </span>
            );
          })}
        </nav>

        <header className={styles.hero}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lead}>{lead}</p>
          <div className={styles.intro}>
            {intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </header>

        <div className={styles.grid}>
          {sections.map((section, index) => (
            <section key={`${section.title}-${index}`} className={sections.length === 1 || section.links ? styles.sectionWide : styles.section}>
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets?.length ? (
                <ul className={styles.list}>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {section.links?.length ? (
                <div className={styles.linksGrid}>
                  {section.links.map((link) => (
                    <Link key={link.href} href={link.href} className={styles.linkCard}>
                      <p className={styles.cardTitle}>{link.title}</p>
                      {link.description ? <p className={styles.cardBody}>{link.description}</p> : null}
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          ))}

          {experiences.length ? (
            <section className={styles.sectionWide}>
              <h2>Experiente LIVADAI relevante</h2>
              <p>
                Mai jos gasesti experiente reale publicate deja pe LIVADAI. Fiecare link te duce catre o pagina de
                experienta care poate fi explorata sau rezervata, in functie de disponibilitate.
              </p>
              <div className={styles.experienceGrid}>
                {experiences.map((experience) => (
                  <Link key={experience.href} href={experience.href} className={styles.experienceCard}>
                    <p className={styles.cardTitle}>{experience.title}</p>
                    <p className={styles.cardBody}>{experience.description}</p>
                    <p className={styles.cardMeta}>{experience.meta}</p>
                  </Link>
                ))}
              </div>
              <div className={styles.ctaRow}>
                <Link href="/experiences" className={styles.primaryCta}>
                  Vezi toate experientele LIVADAI
                </Link>
                <Link href="/guides" className={styles.secondaryCta}>
                  Vezi ghidurile LIVADAI
                </Link>
              </div>
            </section>
          ) : null}

          {faqs.length ? (
            <section className={styles.sectionWide}>
              <h2>Intrebari frecvente</h2>
              <div className={styles.faqList}>
                {faqs.map((faq) => (
                  <article key={faq.question} className={styles.faqItem}>
                    <h3>{faq.question}</h3>
                    <p>{faq.answer}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {relatedLinks.length ? (
            <section className={styles.sectionWide}>
              <h2>Linkuri utile din acelasi ecosistem</h2>
              <p>
                Daca vrei sa aprofundezi orasul, intentia de cautare sau sa compari idei intre mai multe destinatii,
                continua cu paginile de mai jos.
              </p>
              <div className={styles.relatedGrid}>
                {relatedLinks.map((link) => (
                  <Link key={link.href} href={link.href} className={styles.relatedCard}>
                    <p className={styles.cardTitle}>{link.title}</p>
                    {link.description ? <p className={styles.cardBody}>{link.description}</p> : null}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
