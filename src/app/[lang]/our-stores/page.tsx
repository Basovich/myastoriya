import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import OurStoresPage from "@/app/pages/OurStores";
import { getShopsApi } from "@/lib/graphql/queries/shops";
import { getStaticPageSeoData } from "@/utils/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const seo = getStaticPageSeoData('our-stores', lang);

  return {
    title: lang === 'ru' ? { absolute: seo.title } : seo.title,
    description: seo.description,
    openGraph: {
      title: seo.h1,
      description: seo.description,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.h1,
      description: seo.description,
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
