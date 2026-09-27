import type { Metadata } from "next";
import { headers } from "next/headers";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import OurStoresPage from "@/app/pages/OurStores";
import { getShopsApi } from "@/lib/graphql/queries/shops";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl } from "@/utils/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const seo = getStaticPageSeoData('our-stores', lang);
  const alternates = getHreflangAlternates('/our-stores/', lang, dynamicBaseUrl);

  return {
    title: lang === 'ru' ? { absolute: seo.title } : seo.h1,
    description: seo.description,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title: seo.h1,
      description: seo.description,
      images: [{ url: '/images/og-image.jpg', alt: seo.h1 }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.h1,
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

  return (
      <OurStoresPage lang={lang} dict={dict} initialShops={shopsResponse.shops.data} />
  );
}
