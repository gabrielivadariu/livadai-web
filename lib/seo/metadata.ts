import type { Metadata } from "next";
import { SITE_NAME, absoluteUrl } from "./site";

type BuildSeoMetadataArgs = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: "article" | "website";
};

export const buildSeoMetadata = ({
  title,
  description,
  path,
  keywords,
  type = "website",
}: BuildSeoMetadataArgs): Metadata => ({
  title,
  description,
  keywords,
  alternates: {
    canonical: absoluteUrl(path),
  },
  openGraph: {
    title,
    description,
    url: absoluteUrl(path),
    siteName: SITE_NAME,
    locale: "ro_RO",
    type,
    images: [
      {
        url: absoluteUrl("/icon.png"),
        width: 512,
        height: 512,
        alt: `${SITE_NAME} cover`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [absoluteUrl("/icon.png")],
  },
});
