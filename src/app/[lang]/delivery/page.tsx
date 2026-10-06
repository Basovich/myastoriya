import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import DeliveryAndPaymentPage from "@/app/pages/DeliveryAndPayment/DeliveryAndPaymentPage";
import { getShopsApi } from "@/lib/graphql/queries/shops";
import { getPolicyBlocksApi, getDeliveryBlocksApi } from "@/lib/graphql";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl } from "@/utils/seo";
import * as Sentry from "@sentry/nextjs";

interface DeliveryPageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: DeliveryPageProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const fallbackSeo = getStaticPageSeoData("delivery", lang);
  const relativeUrl = `/${lang}/delivery/`;
  const seo = await fetchSeoMetadataByUrl(relativeUrl, lang, fallbackSeo);
  const alternates = getHreflangAlternates("/delivery/", lang, dynamicBaseUrl);

  const isRu = lang === "ru";
  const title = isRu ? { absolute: seo.title } : seo.title;

  return {
    title,
    description: seo.description,
    ...(seo.noindex ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical: seo.canonical || alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: [{ url: "/images/og-image.jpg", alt: seo.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: ["/images/og-image.jpg"],
    },
  };
}

export default async function DeliveryAndPayment({
  params,
}: DeliveryPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  let shopsResponse;
  let policyBlocks;
  let deliveryBlocks;

  try {
    [shopsResponse, policyBlocks, deliveryBlocks] = await Promise.all([
      getShopsApi({ limit: 100 }, lang),
      getPolicyBlocksApi(lang),
      getDeliveryBlocksApi(lang)
    ]);
  } catch (err) {
    Sentry.captureException(err);
    console.error("[DeliveryAndPayment] Error fetching delivery data:", err);
    throw err;
  }

  return (
      <DeliveryAndPaymentPage 
        lang={lang} 
        dict={dict} 
        initialShops={shopsResponse.shops.data} 
        policyBlocks={policyBlocks}
        deliveryBlocks={deliveryBlocks}
      />
  );
}
