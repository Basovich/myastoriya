import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import siteData from "@/content/site.json";
import PasswordGate from "./components/PasswordGate/PasswordGate";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={montserrat.variable}>
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  );
}
