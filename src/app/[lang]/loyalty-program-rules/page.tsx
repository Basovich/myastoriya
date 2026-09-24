import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";
import { getTermsOfUseApi } from "@/lib/graphql";
import { PolicyPageContentItem } from "@/i18n/types";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl } from "@/utils/seo";

interface LoyaltyProgramRulesProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: LoyaltyProgramRulesProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const seo = getStaticPageSeoData("loyalty-program-rules", lang);
  const alternates = getHreflangAlternates("/loyalty-program-rules/", lang, dynamicBaseUrl);

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

export default async function LoyaltyProgramRules({
  params,
}: LoyaltyProgramRulesProps) {
  const { lang } = await params;
  
  const apiData = await getTermsOfUseApi();
  const webContent = apiData?.webText;

  const labels: Record<string, { home: string; loyalty: string }> = {
    ua: { home: "Головна", loyalty: "Правила програми лояльності" },
    ru: { home: "Главная", loyalty: "Правила программы лояльности" }
  };
  const currentLabels = labels[lang] || labels.ua;

  const breadcrumbs = [
    { label: currentLabels.home, href: "/" },
    { label: currentLabels.loyalty }
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
