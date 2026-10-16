import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import CareersPage from "@/app/pages/Careers";
import { getCareerApi } from "@/lib/graphql";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

interface CareersPageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: CareersPageProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const seo = getStaticPageSeoData("careers", lang);
  const alternates = getHreflangAlternates("/careers/", lang, dynamicBaseUrl);

  const isRu = lang === "ru";

  const breadcrumbs = [
    { label: isRu ? "Главная" : "Головна", href: "/" },
    { label: isRu ? "Карьера" : "Кар'єра" }
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, lang, alternates.canonical, dynamicBaseUrl);
  setRequestBreadcrumbJsonLd(breadcrumbJsonLd);

  return {
    title: { absolute: seo.title },
    description: seo.description,
    openGraph: buildOpenGraphMetadata({
      title: seo.title,
      description: seo.description,
      canonicalUrl: alternates.canonical,
      lang,
      type: "website",
    }),
    twitter: {
      card: "summary_large_image",
      title: seo.title,
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
  const seo = getStaticPageSeoData("careers", lang);

  const alternates = getHreflangAlternates("/careers/", lang, getDynamicBaseUrl(await headers()));

  return (
    <>
      <HreflangLinks canonical={alternates.canonical} languages={alternates.languages} />
      <CareersPage lang={lang} dict={dict} careerData={careerData} h1={seo.h1} />
    </>
  );
}
