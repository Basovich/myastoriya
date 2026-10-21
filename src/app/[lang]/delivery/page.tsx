import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import DeliveryAndPaymentPage from "@/app/pages/DeliveryAndPayment/DeliveryAndPaymentPage";
import { getShopsApi } from "@/lib/graphql/queries/shops";
import { getPolicyBlocksApi, getDeliveryBlocksApi } from "@/lib/graphql";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";
import * as Sentry from "@sentry/nextjs";

interface DeliveryPageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: DeliveryPageProps): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const relativeUrl = `/${lang}/delivery/`;
  const seo = await fetchSeoMetadataByUrl(relativeUrl, lang);
  const alternates = getHreflangAlternates("/delivery/", lang, dynamicBaseUrl);
  const canonicalUrl = seo.canonical || alternates.canonical;

  const finalTitle = seo.title || "";

  const isRu = lang === "ru";
  const breadcrumbs = [
    { label: isRu ? "Главная" : "Головна", href: "/" },
    { label: isRu ? "Оплата и доставка" : "Оплата і доставка" }
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

export default async function DeliveryAndPayment({
  params,
}: DeliveryPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const alternates = getHreflangAlternates("/delivery/", lang, getDynamicBaseUrl(await headers()));
  const seo = await fetchSeoMetadataByUrl(`/${lang}/delivery/`, lang);
  
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
    <>
      <HreflangLinks canonical={seo.canonical || alternates.canonical} languages={alternates.languages} />
      <DeliveryAndPaymentPage 
        lang={lang} 
        dict={dict} 
        initialShops={shopsResponse.shops.data} 
        policyBlocks={policyBlocks}
        deliveryBlocks={deliveryBlocks}
        h1={seo.h1 || undefined}
      />
    </>
  );
}
