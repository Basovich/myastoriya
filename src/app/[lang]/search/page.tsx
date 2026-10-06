import Search from "@/app/pages/Search";
import { Locale } from "@/i18n/config";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getDefaultSeoData, getHreflangAlternates, getDynamicBaseUrl, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";

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
    const title = isRu ? { absolute: seo.title } : seo.h1;

    const breadcrumbs = [
        { label: isRu ? "Главная" : "Головна", href: "/" },
        { label: isRu ? "Поиск" : "Пошук" }
    ];
    const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, lang, alternates.canonical, dynamicBaseUrl);
    setRequestBreadcrumbJsonLd(breadcrumbJsonLd);

    return {
        title,
        description: seo.description,
        robots: {
            index: false,
            follow: true,
        },
        alternates: {
            canonical: alternates.canonical,
            languages: alternates.languages,
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
            title: seo.h1,
            description: seo.description,
            images: ["/images/og-image.jpg"],
        },
    };
}

export default async function SearchPage() {
    return <Search />;
}
