import type { Metadata } from "next";
import JsonLd from "@/components/seo/json-ld";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo/schema";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo/site";
import "./globals.css";
import Providers from "./providers";

const verification: Metadata["verification"] = {
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
  ...(process.env.BING_SITE_VERIFICATION
    ? {
        other: {
          "msvalidate.01": process.env.BING_SITE_VERIFICATION,
        },
      }
    : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Experiente reale, ghiduri locale si idei de iesit in Romania`,
    template: "%s",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  verification,
  openGraph: {
    title: `${SITE_NAME} | Experiente reale, ghiduri locale si idei de iesit in Romania`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ro_RO",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/icon.png`,
        width: 512,
        height: 512,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Experiente reale, ghiduri locale si idei de iesit in Romania`,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/icon.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body>
        <JsonLd data={[buildWebSiteSchema(), buildOrganizationSchema()]} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
