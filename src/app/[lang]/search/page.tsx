import Search from "@/app/pages/Search";
import { Locale } from "@/i18n/config";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getDefaultSeoData, getHreflangAlternates, getDynamicBaseUrl, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

interface SearchPageProps {
    params: Promise<{ lang: Locale }>;
}

export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
    const { lang } = await params;
    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);

    const pageTitle = lang === "ru" ? "Поиск" : "Пошук";
    const seo = getDefaultSeoData(pageTitle, lang);
    const alternates = getHreflangAlternates("/search/", lang, dynamicBaseUrl);

    const isRu = lang === "ru";
    const breadcrumbs = [
        { label: isRu ? "Главная" : "Головна", href: "/" },
        { label: isRu ? "Поиск" : "Пошук" }
    ];
    const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, lang, alternates.canonical, dynamicBaseUrl);
    setRequestBreadcrumbJsonLd(breadcrumbJsonLd);

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

export default async function SearchPage({ params }: SearchPageProps) {
    const { lang } = await params;
    const alternates = getHreflangAlternates("/search/", lang, getDynamicBaseUrl(await headers()));

    return (
        <>
            <HreflangLinks canonical={alternates.canonical} languages={alternates.languages} />
            <Search />
        </>
    );
}
