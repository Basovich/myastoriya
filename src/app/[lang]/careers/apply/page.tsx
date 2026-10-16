import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import ApplicantFormPage from "@/app/pages/ApplicantFormPage";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getDefaultSeoData, getHreflangAlternates, getDynamicBaseUrl, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

interface ApplyProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: ApplyProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);

  const pageTitle = lang === "ru" ? "Форма для соискателей" : "Форма для претендентів";
  const brandSuffix = lang === "ru" ? "Мястория" : "М'ясторія";
  const title = `${pageTitle} | ${brandSuffix}`;
  const seo = getDefaultSeoData(pageTitle, lang);
  const alternates = getHreflangAlternates("/careers/apply/", lang, dynamicBaseUrl);

  const isRu = lang === "ru";

  const breadcrumbs = [
    { label: isRu ? "Главная" : "Головна", href: "/" },
    { label: isRu ? "Карьера" : "Кар'єра", href: "/careers" },
    { label: pageTitle }
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, lang, alternates.canonical, dynamicBaseUrl);
  setRequestBreadcrumbJsonLd(breadcrumbJsonLd);

  return {
    title: { absolute: title },
    description: seo.description,
    robots: {
      index: false,
      follow: true,
    },
    openGraph: buildOpenGraphMetadata({
      title: seo.title,
      description: seo.description,
      canonicalUrl: alternates.canonical,
      lang,
      type: "website",
    }),
    twitter: {
      card: "summary_large_image",
      title: seo.h1,
      description: seo.description,
      images: ["/images/og-image.jpg"],
    },
  };
}

export default async function Apply({
  params,
}: ApplyProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const alternates = getHreflangAlternates("/careers/apply/", lang, getDynamicBaseUrl(await headers()));

  return (
    <>
      <HreflangLinks canonical={alternates.canonical} languages={alternates.languages} />
      <ApplicantFormPage lang={lang} dict={dict} />
    </>
  );
}
