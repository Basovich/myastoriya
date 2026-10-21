import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import CareersPage from "@/app/pages/Careers";
import { getCareerApi } from "@/lib/graphql";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

export const dynamic = 'force-dynamic';

interface CareersPageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: CareersPageProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const relativeUrl = `/${lang}/careers/`;
  const seo = await fetchSeoMetadataByUrl(relativeUrl, lang);
  const alternates = getHreflangAlternates("/careers/", lang, dynamicBaseUrl);
  const canonicalUrl = seo.canonical || alternates.canonical;

  const finalTitle = seo.title || "";

  const isRu = lang === "ru";
  const breadcrumbs = [
    { label: isRu ? "Главная" : "Головна", href: "/" },
    { label: isRu ? "Карьера" : "Кар'єра" }
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, lang, canonicalUrl, dynamicBaseUrl);
  setRequestBreadcrumbJsonLd(breadcrumbJsonLd);

  return {
    title: finalTitle,
    description: seo.description,
    ...(seo.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: buildOpenGraphMetadata({
      title: finalTitle,
      description: seo.description,
      canonicalUrl,
      lang,
      type: "website",
    }),
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: seo.description,
      images: ["/images/og-image.jpg"],
    },
  };
}

export default async function Careers({
  params,
}: CareersPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const careerData = await getCareerApi(lang);
  const seo = await fetchSeoMetadataByUrl(`/${lang}/careers/`, lang);
  const alternates = getHreflangAlternates("/careers/", lang, getDynamicBaseUrl(await headers()));
  const canonicalUrl = seo.canonical || alternates.canonical;

  return (
    <>
      <HreflangLinks canonical={canonicalUrl} languages={alternates.languages} />
      <CareersPage lang={lang} dict={dict} careerData={careerData} h1={seo.h1} />
    </>
  );
}
