import Search from "@/app/pages/Search";
import { Locale } from "@/i18n/config";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getDefaultSeoData, getHreflangAlternates, getDynamicBaseUrl } from "@/utils/seo";

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

export default function SearchPage() {
    return (
        <Search />
    );
}
