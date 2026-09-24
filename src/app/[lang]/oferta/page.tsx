import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";
import { getContractOfferApi } from "@/lib/graphql";
import { PolicyPageContentItem } from "@/i18n/types";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl } from "@/utils/seo";

interface OfertaPageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: OfertaPageProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const seo = getStaticPageSeoData("oferta", lang);
  const alternates = getHreflangAlternates("/oferta/", lang, dynamicBaseUrl);

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

export default async function OfertaPage({
  params,
}: OfertaPageProps) {
  const { lang } = await params;
  
  const apiData = await getContractOfferApi();
  const webContent = apiData?.webText;

  const labels: Record<string, { home: string; oferta: string }> = {
    ua: { home: "Головна", oferta: "Публічна оферта" },
    ru: { home: "Главная", oferta: "Публичная оферта" }
  };
  const currentLabels = labels[lang] || labels.ua;

  const breadcrumbs = [
    { label: currentLabels.home, href: "/" },
    { label: currentLabels.oferta }
  ];

  const content: PolicyPageContentItem[] = webContent
    ? [{ type: 'html', value: webContent }]
    : [];

  return (
    <PolicyPage 
      lang={lang} 
      breadcrumbs={breadcrumbs}
      content={content}
    />
  );
}
