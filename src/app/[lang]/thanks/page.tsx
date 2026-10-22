import { Locale } from "@/i18n/config";
import ThanksPage from "@/app/pages/Thanks";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getDefaultSeoData, getHreflangAlternates, getDynamicBaseUrl, buildOpenGraphMetadata } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

interface ThanksProps {
    params: Promise<{ lang: Locale }>;
    searchParams: Promise<{ orderId?: string | string[]; payment?: string; isOnline?: string; status?: string }>;
}

export async function generateMetadata({ params }: ThanksProps): Promise<Metadata> {
    const { lang } = await params;
    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);

    const pageTitle = lang === "ru" ? "Спасибо за ваш заказ!" : "Дякуємо за ваше замовлення!";
    const seo = getDefaultSeoData(pageTitle, lang);
    const alternates = getHreflangAlternates("/thanks/", lang, dynamicBaseUrl);

    return {
        title: { absolute: seo.title },
        description: seo.description,
        robots: {
            index: false,
            follow: true,
        },
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

export default async function Thanks({
    params,
    searchParams,
}: ThanksProps) {
    const { lang } = await params;
    const { orderId, payment, isOnline, status } = await searchParams;

    const isOnlinePayment = isOnline === 'true' || payment === 'online' || Boolean(status);

    const alternates = getHreflangAlternates("/thanks/", lang, getDynamicBaseUrl(await headers()));

    return (
        <>
            <HreflangLinks canonical={alternates.canonical} languages={alternates.languages} />
            <ThanksPage 
                lang={lang} 
                orderId={typeof orderId === 'string' ? orderId : undefined}
                isOnline={isOnlinePayment}
            />
        </>
    );
}
