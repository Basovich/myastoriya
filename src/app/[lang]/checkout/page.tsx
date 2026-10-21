import { Locale } from "@/i18n/config";
import CheckoutPage from "@/app/pages/Checkout/CheckoutPage";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getDefaultSeoData, getHreflangAlternates, getDynamicBaseUrl, buildOpenGraphMetadata } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

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

export default async function Checkout({
    params,
}: CheckoutProps) {
    const { lang } = await params;

    const alternates = getHreflangAlternates("/checkout/", lang, getDynamicBaseUrl(await headers()));

    return (
        <>
            <HreflangLinks canonical={alternates.canonical} languages={alternates.languages} />
            <CheckoutPage lang={lang} />
        </>
    );
}
