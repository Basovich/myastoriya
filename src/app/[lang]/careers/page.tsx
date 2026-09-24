import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import CareersPage from "@/app/pages/Careers";
import { getCareerApi } from "@/lib/graphql";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl } from "@/utils/seo";

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
  const title = isRu ? { absolute: seo.title } : seo.h1;

  return {
    title,
    description: seo.description,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: [{ url: "/images/og-image.jpg", alt: seo.h1 }],
    },
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

  return (
      <CareersPage lang={lang} dict={dict} careerData={careerData} />
  );
}
