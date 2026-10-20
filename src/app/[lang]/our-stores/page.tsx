import type { Metadata } from "next";
import { headers } from "next/headers";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import OurStoresPage from "@/app/pages/OurStores";
import { getShopsApi } from "@/lib/graphql/queries/shops";
import { getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const relativeUrl = `/${lang}/our-stores/`;
  const seo = await fetchSeoMetadataByUrl(relativeUrl, lang);
  const alternates = getHreflangAlternates('/our-stores/', lang, dynamicBaseUrl);
  const canonicalUrl = seo.canonical || alternates.canonical;

  const finalTitle = seo.title || "";

  const breadcrumbs = [
    { label: isRu ? 'Главная' : 'Головна', href: '/' },
    { label: isRu ? 'Наши заведения' : 'Наші заклади' }
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
      images: ['/images/og-image.jpg'],
    },
  };
}

export default async function OurStores({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const shopsResponse = await getShopsApi({ limit: 100 }, lang);
  const alternates = getHreflangAlternates('/our-stores/', lang, getDynamicBaseUrl(await headers()));
  const seo = await fetchSeoMetadataByUrl(`/${lang}/our-stores/`, lang);

  return (
    <>
      <HreflangLinks canonical={seo.canonical || alternates.canonical} languages={alternates.languages} />
      <OurStoresPage lang={lang} dict={dict} initialShops={shopsResponse.shops.data} h1={seo.h1} />
    </>
  );
}
