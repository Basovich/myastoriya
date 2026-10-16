import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";
import { getTermsOfUseApi } from "@/lib/graphql";
import { PolicyPageContentItem } from "@/i18n/types";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

interface LoyaltyProgramRulesProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: LoyaltyProgramRulesProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const seo = getStaticPageSeoData("loyalty-program-rules", lang);
  const alternates = getHreflangAlternates("/loyalty-program-rules/", lang, dynamicBaseUrl);

  const labels: Record<string, { home: string; loyalty: string }> = {
    ua: { home: "Головна", loyalty: "Правила програми лояльності" },
    ru: { home: "Главная", loyalty: "Правила программы лояльности" }
  };
  const currentLabels = labels[lang] || labels.ua;

  const breadcrumbs = [
    { label: currentLabels.home, href: "/" },
    { label: currentLabels.loyalty }
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

export default async function LoyaltyProgramRules({
  params,
}: LoyaltyProgramRulesProps) {
  const { lang } = await params;
  
  const apiData = await getTermsOfUseApi();
  const webContent = apiData?.webText;
  const seo = getStaticPageSeoData("loyalty-program-rules", lang);

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

  const alternates = getHreflangAlternates("/loyalty-program-rules/", lang, getDynamicBaseUrl(await headers()));

  return (
    <>
      <HreflangLinks canonical={alternates.canonical} languages={alternates.languages} />
      <PolicyPage 
        lang={lang} 
        breadcrumbs={breadcrumbs}
        content={content}
        h1={seo.h1}
      />
    </>
  );
}
