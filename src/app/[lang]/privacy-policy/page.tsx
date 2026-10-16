import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";
import { getPrivacyPolicyApi } from "@/lib/graphql";
import { PolicyPageContentItem } from "@/i18n/types";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

interface PrivacyPolicyPageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: PrivacyPolicyPageProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const seo = getStaticPageSeoData("privacy-policy", lang);
  const alternates = getHreflangAlternates("/privacy-policy/", lang, dynamicBaseUrl);

  const labels: Record<string, { home: string; privacy: string }> = {
    ua: { home: "Головна", privacy: "Політика конфіденційності" },
    ru: { home: "Главная", privacy: "Политика конфиденциальности" }
  };
  const currentLabels = labels[lang] || labels.ua;

  const breadcrumbs = [
    { label: currentLabels.home, href: "/" },
    { label: currentLabels.privacy }
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

export default async function Privacy({
  params,
}: PrivacyPolicyPageProps) {
  const { lang } = await params;
  
  const apiData = await getPrivacyPolicyApi();
  const webContent = apiData?.webText;
  const seo = getStaticPageSeoData("privacy-policy", lang);

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
