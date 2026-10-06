import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import ApplicantFormPage from "@/app/pages/ApplicantFormPage";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getDefaultSeoData, getHreflangAlternates, getDynamicBaseUrl, buildOpenGraphMetadata } from "@/utils/seo";

interface ApplyProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: ApplyProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);

  const pageTitle = lang === "ru" ? "Подать заявку" : "Подати заявку";
  const seo = getDefaultSeoData(pageTitle, lang);
  const alternates = getHreflangAlternates("/careers/apply/", lang, dynamicBaseUrl);

  const isRu = lang === "ru";
  const title = isRu ? { absolute: seo.title } : seo.h1;

  return {
    title,
    description: seo.description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
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

  return (
      <ApplicantFormPage lang={lang} dict={dict} />
  );
}
