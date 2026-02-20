import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import siteData from "@/content/site.json";
import PasswordGate from "../components/PasswordGate/PasswordGate";
import { i18n } from "@/i18n/config";

const houschka = localFont({
  src: [
    {
      path: "../../fonts/HouschkaRounded-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fonts/HouschkaRounded-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-houschka",
});

const helios = localFont({
  src: [
    {
      path: "../../fonts/Helios-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/Helios-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-helios",
});

export const metadata: Metadata = {
  title: {
    default: siteData.seo.title,
    template: `%s | ${siteData.name}`,
  },
  description: siteData.seo.description,
  keywords: siteData.seo.keywords,
  authors: [{ name: siteData.name }],
  creator: siteData.name,
  metadataBase: new URL(siteData.url),
  openGraph: {
    type: "website",
    locale: siteData.locale,
    url: siteData.url,
    siteName: siteData.name,
    title: siteData.seo.title,
    description: siteData.seo.description,
    images: [
      {
        url: siteData.seo.ogImage,
        width: 1200,
        height: 630,
        alt: siteData.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteData.seo.title,
    description: siteData.seo.description,
    images: [siteData.seo.ogImage],
  },
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Myastoriya",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

import ReduxProvider from "@/store/ReduxProvider";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  return (
    <html lang={lang} className={`${houschka.variable} ${helios.variable}`}>
      <body>
        <ReduxProvider>
          <PasswordGate>{children}</PasswordGate>
        </ReduxProvider>
      </body>
    </html>
  );
}
