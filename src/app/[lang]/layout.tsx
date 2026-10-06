import type { Metadata } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import "../globals.css";
import { siteData } from "@/config/site";
import { i18n, type Locale } from "@/i18n/config";
import clsx from "clsx";
import ReduxProvider from "@/store/ReduxProvider";
import AuthInitializer from "@/app/components/AuthInitializer/AuthInitializerClient";

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

import { getHreflangAlternates, getDynamicBaseUrl, buildOpenGraphMetadata, getRequestJsonLdScripts } from "@/utils/seo";

function JsonLdHeadScripts({ pathname }: { pathname: string }) {
  const scripts = getRequestJsonLdScripts(pathname);
  if (!scripts || !scripts.length) return null;
  return (
    <>
      {scripts.map((jsonLd, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);

  const alternates = getHreflangAlternates(pathname, lang, dynamicBaseUrl);

  const isRu = lang === "ru";
  const siteBrand = isRu ? "Мястория" : "М'ясторія";

  return {
    title: {
      default: siteData.seo.title,
      template: `%s | ${siteBrand}`,
    },
    description: siteData.seo.description,
    metadataBase: new URL(siteData.url),
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: buildOpenGraphMetadata({
      title: siteData.seo.title,
      description: siteData.seo.description,
      canonicalUrl: alternates.canonical,
      lang,
      image: siteData.seo.ogImage,
      type: "website",
    }),
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
    },
  };
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

import { getCatalogTreeApi, type ProductCategory } from "@/lib/graphql/queries/products";
import { getSocialLinksApi, type SocialLink } from "@/lib/graphql/queries/settings";
import Header from "@/app/components/Header/HeaderClient";
import Footer from "@/app/components/Footer/FooterClient";
import { getAccessToken } from "@/app/actions/authActions";
import { CategoryProvider } from "@/hooks/useCategoryTree";
import NavigationProgress from "@/app/components/NavigationProgress/NavigationProgress";

import StatusModals from "@/app/components/StatusModals/StatusModals";
import CatalogMenuSsrLinks from "@/app/components/Header/DesktopHeader/MainBar/CatalogMenu/CatalogMenuSsrLinks";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  
  // Отримуємо x-pathname із заголовків запиту
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isMenuPage = /^\/(?:[a-z]{2}\/)?menu(?:\/.*)?$/.test(pathname);

  let catalogTree: ProductCategory[] = [];
  let socialLinks: SocialLink[] = [];

  if (!isMenuPage) {
    try {
      const token = await getAccessToken();
      const [tree, links] = await Promise.all([
        getCatalogTreeApi(lang, 768, token ?? undefined).catch((err) => {
          console.error("Failed to fetch catalog tree:", err);
          return [];
        }),
        getSocialLinksApi().catch((err) => {
          console.error("Failed to fetch social links:", err);
          return [];
        }),
      ]);
      catalogTree = tree;
      socialLinks = links;
    } catch (err) {
      console.error("Error loading layout data:", err);
    }
  }

  const htmlLang = lang === 'ua' ? 'uk' : lang;

  return (
    <html lang={htmlLang} className={clsx(houschka.variable, helios.variable)} suppressHydrationWarning>
      <head>
        <JsonLdHeadScripts pathname={pathname} />
      </head>
      <body>
        <noscript>
          <style>{`
            /* Non-JavaScript Graceful Degradation (SEO & Accessibility) */
            [class*="loaderWrapper"],
            [class*="PageLoader"],
            [class*="preloader"] {
              display: none !important;
            }

            .swiper-slide {
              opacity: 1 !important;
              visibility: visible !important;
              transform: none !important;
              pointer-events: auto !important;
            }

            .swiper-wrapper {
              display: flex !important;
              flex-wrap: nowrap !important;
              overflow-x: auto !important;
              gap: 16px !important;
              transform: none !important;
              width: auto !important;
            }

            .swiper-slide {
              width: auto !important;
              max-width: 320px !important;
              min-width: 200px !important;
              flex-shrink: 0 !important;
            }

            .swiper-pagination,
            .swiper-button-next,
            .swiper-button-prev,
            [class*="navArrow"],
            [class*="prevBtn"],
            [class*="nextBtn"] {
              display: none !important;
            }

            #hero .swiper-wrapper {
              display: block !important;
              overflow: hidden !important;
            }

            #hero .swiper-slide {
              width: 100% !important;
              min-width: unset !important;
              max-width: unset !important;
            }

            #hero .swiper-slide:not(:first-child) {
              display: none !important;
            }

            [class*="faqAnswerWrap"] {
              height: auto !important;
              overflow: visible !important;
            }
          `}</style>
        </noscript>
        <ReduxProvider>
          <CategoryProvider initialCategories={catalogTree}>
            <NavigationProgress />
            {!isMenuPage && <AuthInitializer />}
            {!isMenuPage && <Header lang={lang as Locale} initialCategories={catalogTree} />}
            {/* SSR-посилання категорій каталогу для SEO-павуків (приховані візуально) */}
            {!isMenuPage && catalogTree.length > 0 && (
                <CatalogMenuSsrLinks categories={catalogTree} lang={lang as Locale} />
            )}
            {children}
            {!isMenuPage && <Footer lang={lang as Locale} initialSocialLinks={socialLinks} />}
            <StatusModals lang={lang as Locale} />
          </CategoryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
