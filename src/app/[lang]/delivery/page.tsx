import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import DeliveryAndPaymentPage from "@/app/pages/DeliveryAndPayment/DeliveryAndPaymentPage";
import { getShopsApi } from "@/lib/graphql/queries/shops";
import { getPolicyBlocksApi, getDeliveryBlocksApi } from "@/lib/graphql";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl } from "@/utils/seo";

interface DeliveryPageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: DeliveryPageProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const seo = getStaticPageSeoData("delivery", lang);
  const alternates = getHreflangAlternates("/delivery/", lang, dynamicBaseUrl);

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

export default async function DeliveryAndPayment({
  params,
}: DeliveryPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  const [shopsResponse, policyBlocks, deliveryBlocks] = await Promise.all([
    getShopsApi({ limit: 100 }, lang),
    getPolicyBlocksApi(lang),
    getDeliveryBlocksApi(lang)
  ]);

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
