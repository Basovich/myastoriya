import { redirect, notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import StoreDetailPage from "@/app/pages/OurStores/StoreDetailPage/StoreDetailPage";
import { getShopBySlugApi, type Shop } from "@/lib/graphql/queries/shops";
import { resolveStoreBackendSlug, getLegacyStoreRedirectSlug } from "@/utils/store-url";

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
