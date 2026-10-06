import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import StoreDetailPage from "@/app/pages/OurStores/StoreDetailPage/StoreDetailPage";
import { getShopBySlugApi, type Shop } from "@/lib/graphql/queries/shops";
import { resolveStoreBackendSlug, getLegacyStoreRedirectSlug } from "@/utils/store-url";
import { headers } from "next/headers";
import { getStoreSeoData, getHreflangAlternates, getDynamicBaseUrl, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: Locale; slug: string }>;
}): Promise<Metadata> {
    const { lang, slug } = await params;
    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);
    const backendSlug = resolveStoreBackendSlug(slug);

    let shop: Shop | null = null;
    try {
        const response = await getShopBySlugApi(backendSlug, lang);
        shop = response.shop ?? null;
    } catch {
        // Fallback to empty metadata if fetch fails
    }

    if (!shop) return {};

    const match = shop.name.match(/^(.*?)\((.*?)\)$/);
    const brandName = shop.siteName || (match ? match[1].trim() : shop.name);
    const address = shop.siteAddress || (match ? match[2].trim() : (shop.name || ''));

    const seoData = getStoreSeoData(brandName, address, lang);
    const titleConfig = lang === 'ru' ? { absolute: seoData.title } : seoData.title;
    const alternates = getHreflangAlternates(`/our-stores/${slug}/`, lang, dynamicBaseUrl);
    const shopImage = shop.image?.size1x || shop.images?.[0]?.url?.size1x;

    const isRu = lang === 'ru';
    const breadcrumbs = [
        { label: isRu ? 'Главная' : 'Головна', href: '/' },
        { label: isRu ? 'Наши заведения' : 'Наші заклади', href: '/our-stores' },
        { label: shop.siteName || shop.name }
    ];
    const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, lang, alternates.canonical, dynamicBaseUrl);
    setRequestBreadcrumbJsonLd(breadcrumbJsonLd);

    return {
        title: titleConfig,
        description: seoData.description,
        alternates: {
            canonical: alternates.canonical,
            languages: alternates.languages,
        },
        openGraph: buildOpenGraphMetadata({
            title: seoData.title,
            description: seoData.description,
            canonicalUrl: alternates.canonical,
            lang,
            image: shopImage,
            type: 'website',
        }),
        twitter: {
            card: "summary_large_image",
            title: seoData.title,
            description: seoData.description,
            images: shopImage ? [shopImage] : undefined,
        },
    };
}

export const dynamic = "force-dynamic";

export default async function StorePage({
    params,
}: {
    params: Promise<{ lang: Locale; slug: string }>;
}) {
    const { lang, slug } = await params;

    // Legacy redirect (e.g. /our-stores/shop-1 -> /our-stores/myastoriya-na-oboloni)
    const redirectSlug = getLegacyStoreRedirectSlug(slug);
    if (redirectSlug) {
        redirect(`/${lang}/our-stores/${redirectSlug}`);
    }

    const dict = await getDictionary(lang);
    const backendSlug = resolveStoreBackendSlug(slug);

    let shop: Shop | null = null;
    try {
        const response = await getShopBySlugApi(backendSlug, lang);
        shop = response.shop ?? null;
    } catch (error) {
        console.error("Failed to fetch shop:", error);
    }

    if (!shop) {
        notFound();
    }

    return (
        <StoreDetailPage 
            shop={shop} 
            lang={lang} 
            dict={dict} 
        />
    );
}

export async function generateStaticParams() {
    return [];
}
