import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";
import { getPrivacyPolicyApi } from "@/lib/graphql";
import { PolicyPageContentItem } from "@/i18n/types";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl } from "@/utils/seo";

interface PrivacyPolicyPageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: PrivacyPolicyPageProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const seo = getStaticPageSeoData("privacy-policy", lang);
  const alternates = getHreflangAlternates("/privacy-policy/", lang, dynamicBaseUrl);

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

export default async function Privacy({
  params,
}: PrivacyPolicyPageProps) {
  const { lang } = await params;
  
  const apiData = await getPrivacyPolicyApi();
  const webContent = apiData?.webText;

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

  return (
    <PolicyPage 
      lang={lang} 
      breadcrumbs={breadcrumbs}
      content={content}
    />
  );
}
