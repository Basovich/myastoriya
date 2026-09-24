import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import StoreDetailPage from "@/app/pages/OurStores/StoreDetailPage/StoreDetailPage";
import { getShopBySlugApi, type Shop } from "@/lib/graphql/queries/shops";
import { resolveStoreBackendSlug, getLegacyStoreRedirectSlug } from "@/utils/store-url";
import { getStoreSeoData } from "@/utils/seo";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: Locale; slug: string }>;
}): Promise<Metadata> {
    const { lang, slug } = await params;
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

    return {
        title: titleConfig,
        description: seoData.description,
        openGraph: {
            title: seoData.title,
            description: seoData.description,
        },
        twitter: {
            card: "summary_large_image",
            title: seoData.title,
            description: seoData.description,
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
