import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";
import { getTermsOfUseApi } from "@/lib/graphql";
import { PolicyPageContentItem } from "@/i18n/types";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

interface LoyaltyProgramRulesProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: LoyaltyProgramRulesProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const relativeUrl = `/${lang}/loyalty-program-rules/`;
  const seo = await fetchSeoMetadataByUrl(relativeUrl, lang);
  const alternates = getHreflangAlternates("/loyalty-program-rules/", lang, dynamicBaseUrl);
  const canonicalUrl = seo.canonical || alternates.canonical;

  const labels: Record<string, { home: string; loyalty: string }> = {
    ua: { home: "Головна", loyalty: "Правила програми лояльності" },
    ru: { home: "Главная", loyalty: "Правила программы лояльности" }
  };
  const currentLabels = labels[lang] || labels.ua;
  const finalTitle = seo.title || currentLabels.loyalty;

  const breadcrumbs = [
    { label: currentLabels.home, href: "/" },
    { label: currentLabels.loyalty }
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

export default async function LoyaltyProgramRules({
  params,
}: LoyaltyProgramRulesProps) {
  const { lang } = await params;
  
  const apiData = await getTermsOfUseApi();
  const webContent = apiData?.webText;
  const seo = await fetchSeoMetadataByUrl(`/${lang}/loyalty-program-rules/`, lang);

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
  const canonicalUrl = seo.canonical || alternates.canonical;

  return (
    <>
      <HreflangLinks canonical={canonicalUrl} languages={alternates.languages} />
      <PolicyPage 
        lang={lang} 
        breadcrumbs={breadcrumbs}
        content={content}
        h1={seo.h1}
      />
    </>
  );
}
