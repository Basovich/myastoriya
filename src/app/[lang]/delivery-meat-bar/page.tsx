import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import DeliveryAndPaymentPage from "@/app/pages/DeliveryAndPayment/DeliveryAndPaymentPage";
import { getShopsApi } from "@/lib/graphql/queries/shops";
import { getPolicyBlocksApi, getDeliveryBlocksApi } from "@/lib/graphql";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getDefaultSeoData, getHreflangAlternates, getDynamicBaseUrl } from "@/utils/seo";

interface DeliveryMeatBarProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: DeliveryMeatBarProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);

  const pageTitle = lang === "ru" ? "Доставка Мястория Meat Bar" : "Доставка М'ясторія Meat Bar";
  const seo = getDefaultSeoData(pageTitle, lang);
  const alternates = getHreflangAlternates("/delivery-meat-bar/", lang, dynamicBaseUrl);

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

export default async function DeliveryMeatBar({
  params,
}: DeliveryMeatBarProps) {
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
        isMeatBar={true} 
        initialShops={shopsResponse.shops.data} 
        policyBlocks={policyBlocks}
        deliveryBlocks={deliveryBlocks}
      />
  );
}
