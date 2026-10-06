import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import StoreMenuPage from "@/app/pages/StoreMenu/StoreMenuPage";
import { getShopBySlugApi } from "@/lib/graphql/queries/shops";
import { getStoreFullMenuApi } from "@/lib/graphql/queries/pages/restaurantMenu";
import { getApiSlugFromMenu } from "@/config/menuSlugMap";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getHreflangAlternates, getDynamicBaseUrl } from "@/utils/seo";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface MenuPageProps {
    params: Promise<{ lang: string; menuSlug: string }>;
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
    const { lang, menuSlug } = await params;
    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);

    try {
        const apiSlug = getApiSlugFromMenu(menuSlug);
        let shopResponse = await getShopBySlugApi(apiSlug, lang).catch(() => null);
        if (!shopResponse?.shop && apiSlug !== menuSlug) {
            shopResponse = await getShopBySlugApi(menuSlug, lang).catch(() => null);
        }
        if (!shopResponse?.shop) {
            shopResponse = await getShopBySlugApi(`myastoriya-${menuSlug}`, lang).catch(() => null);
        }
        const shopName = shopResponse?.shop?.name || "";

        if (!shopName) {
            return {};
        }

        const alternates = getHreflangAlternates(`/menu/${menuSlug}/`, lang, dynamicBaseUrl);

        let title: string;
        let description: string;

        if (lang === "en") {
            title = `Menu ${shopName}`;
            description = `Explore the menu of ${shopName}. Grilled steaks, appetizers, main courses, desserts and more.`;
        } else if (lang === "ru") {
            title = `Меню ${shopName}`;
            description = `Ознакомьтесь с меню ${shopName}. Стейки на гриле, закуски, основные блюда, десерты и другие позиции.`;
        } else {
            title = `Меню ${shopName}`;
            description = `Ознайомтеся з меню ${shopName}. Стейки на грилі, закуски, основні страви, десерти та інші позиції.`;
        }

        return {
            title: lang === "ru" ? { absolute: title } : title,
            description,
            robots: {
                index: false,
                follow: false,
            },
            alternates: {
                canonical: alternates.canonical,
                languages: alternates.languages,
            },
            openGraph: {
                title,
                description,
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
            },
        };
    } catch {
        return {};
    }
}

export default async function MenuPage({
    params,
}: MenuPageProps) {
    const { lang, menuSlug } = await params;
    const dict = await getDictionary(lang as Locale);

    try {
        let apiSlug = getApiSlugFromMenu(menuSlug);
        let shopResponse = await getShopBySlugApi(apiSlug, lang).catch(() => null);
        if (!shopResponse?.shop && apiSlug !== menuSlug) {
            shopResponse = await getShopBySlugApi(menuSlug, lang).catch(() => null);
            if (shopResponse?.shop) apiSlug = menuSlug;
        }
        if (!shopResponse?.shop) {
            const fallbackSlug = `myastoriya-${menuSlug}`;
            shopResponse = await getShopBySlugApi(fallbackSlug, lang).catch(() => null);
            if (shopResponse?.shop) apiSlug = fallbackSlug;
        }
        const shop = shopResponse?.shop;

        if (!shop) {
            notFound();
        }

        const fullMenuData = await getStoreFullMenuApi(apiSlug, lang).catch((error) => {
            console.error("Failed to fetch full store menu:", error);
            return { restaurantMenu: [], shop: null, shopCustomMenu: [] };
        });

        const initialMenu = fullMenuData?.restaurantMenu || [];
        const electronicMenu = fullMenuData?.shop?.electronicMenu || [];
        const initialCustomMenu = fullMenuData?.shopCustomMenu || [];

        return (
            <StoreMenuPage
                shop={shop}
                lang={lang}
                dict={dict}
                initialMenu={initialMenu}
                electronicMenu={electronicMenu}
                initialCustomMenu={initialCustomMenu}
            />
        );
    } catch (error) {
        console.error("Failed to fetch shop for menu:", error);
        notFound();
    }
}

export async function generateStaticParams() {
    /**
     * [LIGHTWEIGHT BUILD]
     * Disable pre-generation to avoid 504 errors on dev-API.
     */
    return [];
}
