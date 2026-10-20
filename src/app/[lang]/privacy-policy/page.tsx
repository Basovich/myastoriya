import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";
import { getPrivacyPolicyApi } from "@/lib/graphql";
import { PolicyPageContentItem } from "@/i18n/types";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

interface PrivacyPolicyPageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: PrivacyPolicyPageProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const relativeUrl = `/${lang}/privacy-policy/`;
  const seo = await fetchSeoMetadataByUrl(relativeUrl, lang);
  const alternates = getHreflangAlternates("/privacy-policy/", lang, dynamicBaseUrl);
  const canonicalUrl = seo.canonical || alternates.canonical;

  const labels: Record<string, { home: string; privacy: string }> = {
    ua: { home: "Головна", privacy: "Політика конфіденційності" },
    ru: { home: "Главная", privacy: "Политика конфиденциальности" }
  };
  const currentLabels = labels[lang] || labels.ua;
  const finalTitle = seo.title || "";

  const breadcrumbs = [
    { label: currentLabels.home, href: "/" },
    { label: currentLabels.privacy }
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

export default async function Privacy({
  params,
}: PrivacyPolicyPageProps) {
  const { lang } = await params;
  
  const apiData = await getPrivacyPolicyApi();
  const webContent = apiData?.webText;
  const seo = await fetchSeoMetadataByUrl(`/${lang}/privacy-policy/`, lang);

  const labels: Record<string, { home: string; privacy: string }> = {
    ua: { home: "Головна", privacy: "Політика конфіденційності" },
    ru: { home: "Главная", privacy: "Политика конфиденциальности" }
  };
  const currentLabels = labels[lang] || labels.ua;

  const breadcrumbs = [
    { label: currentLabels.home, href: "/" },
    { label: currentLabels.privacy }
  ];

  const content: PolicyPageContentItem[] = webContent
    ? [{ type: 'html', value: webContent }]
    : [];

  const alternates = getHreflangAlternates("/privacy-policy/", lang, getDynamicBaseUrl(await headers()));
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
