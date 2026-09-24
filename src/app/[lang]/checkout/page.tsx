import { Locale } from "@/i18n/config";
import CheckoutPage from "@/app/pages/Checkout/CheckoutPage";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getDefaultSeoData, getHreflangAlternates, getDynamicBaseUrl } from "@/utils/seo";

interface CheckoutProps {
    params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: CheckoutProps): Promise<Metadata> {
    const { lang } = await params;
    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);

    const pageTitle = lang === "ru" ? "Оформление заказа" : "Оформлення замовлення";
    const seo = getDefaultSeoData(pageTitle, lang);
    const alternates = getHreflangAlternates("/checkout/", lang, dynamicBaseUrl);

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

export default async function Checkout({
    params,
}: CheckoutProps) {
    const { lang } = await params;

    return <CheckoutPage lang={lang} />;
}
