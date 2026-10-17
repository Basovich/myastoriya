import { Locale } from "@/i18n/config";
import PolicyPage from "@/app/pages/PolicyPage/PolicyPage";
import { getContractOfferApi } from "@/lib/graphql";
import { PolicyPageContentItem } from "@/i18n/types";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

interface OfertaPageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: OfertaPageProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const relativeUrl = `/${lang}/oferta/`;
  const seo = await fetchSeoMetadataByUrl(relativeUrl, lang);
  const alternates = getHreflangAlternates("/oferta/", lang, dynamicBaseUrl);
  const canonicalUrl = seo.canonical || alternates.canonical;

  const labels: Record<string, { home: string; oferta: string }> = {
    ua: { home: "Головна", oferta: "Публічна оферта" },
    ru: { home: "Главная", oferta: "Публичная оферта" }
  };
  const currentLabels = labels[lang] || labels.ua;
  const finalTitle = seo.title || currentLabels.oferta;

  const breadcrumbs = [
    { label: currentLabels.home, href: "/" },
    { label: currentLabels.oferta }
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

export default async function OfertaPage({
  params,
}: OfertaPageProps) {
  const { lang } = await params;
  
  const apiData = await getContractOfferApi();
  const webContent = apiData?.webText;
  const seo = await fetchSeoMetadataByUrl(`/${lang}/oferta/`, lang);

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

  const alternates = getHreflangAlternates("/oferta/", lang, getDynamicBaseUrl(await headers()));
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
