import { Locale } from "@/i18n/config";
import ThanksPage from "@/app/pages/Thanks";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getDefaultSeoData, getHreflangAlternates, getDynamicBaseUrl } from "@/utils/seo";

interface ThanksProps {
    params: Promise<{ lang: Locale }>;
    searchParams: Promise<{ orderId?: string | string[]; payment?: string; isOnline?: string; status?: string }>;
}

export async function generateMetadata({ params }: ThanksProps): Promise<Metadata> {
    const { lang } = await params;
    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);

    const pageTitle = lang === "ru" ? "Спасибо за заказ" : "Дякуємо за замовлення";
    const seo = getDefaultSeoData(pageTitle, lang);
    const alternates = getHreflangAlternates("/thanks/", lang, dynamicBaseUrl);

    const isRu = lang === "ru";
    const title = isRu ? { absolute: seo.title } : seo.h1;

    return {
        title,
        description: seo.description,
        robots: {
            index: false,
            follow: false,
        },
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

export default async function Thanks({
    params,
    searchParams,
}: ThanksProps) {
    const { lang } = await params;
    const { orderId, payment, isOnline, status } = await searchParams;

    const isOnlinePayment = isOnline === 'true' || payment === 'online' || Boolean(status);

    return (
        <ThanksPage 
            lang={lang} 
            orderId={typeof orderId === 'string' ? orderId : undefined}
            isOnline={isOnlinePayment}
        />
    );
}
