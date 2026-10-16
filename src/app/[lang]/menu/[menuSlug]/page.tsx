import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import StoreMenuPage from "@/app/pages/StoreMenu/StoreMenuPage";
import { getShopBySlugApi } from "@/lib/graphql/queries/shops";
import { getStoreFullMenuApi } from "@/lib/graphql/queries/pages/restaurantMenu";
import { getApiSlugFromMenu, getRestaurantEnglishName, RESTAURANT_MENU_SLUG_MAP } from "@/config/menuSlugMap";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getHreflangAlternates, getDynamicBaseUrl, buildOpenGraphMetadata } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";
import { notFound, permanentRedirect } from "next/navigation";

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
        const shop = shopResponse?.shop;

        if (!shop || !shop.isCompanyStore) {
            return {};
        }

        const rawShopName = lang === "en"
            ? getRestaurantEnglishName(menuSlug, shop.name || "")
            : (shop.name || "");
        const cleanShopName = rawShopName.replace(/\s*\(.*?\)\s*$/, '').trim();

        const alternates = getHreflangAlternates(`/menu/${menuSlug}/`, lang, dynamicBaseUrl);

        const siteBrand = lang === "en" ? "Myastoriya" : (lang === "ru" ? "Мястория" : "М'ясторія");
        let title: string;
        let description: string;

        if (lang === "en") {
            title = `Menu ${cleanShopName} | ${siteBrand}`;
            description = `Explore the menu of ${cleanShopName}. Grilled steaks, appetizers, main courses, desserts and more.`;
        } else if (lang === "ru") {
            title = `Меню ${cleanShopName} | ${siteBrand}`;
            description = `Ознакомьтесь с меню ${cleanShopName}. Стейки на гриле, закуски, основные блюда, десерты и другие позиции.`;
        } else {
            title = `Меню ${cleanShopName} | ${siteBrand}`;
            description = `Ознайомтеся з меню ${cleanShopName}. Стейки на грилі, закуски, основні страви, десерти та інші позиції.`;
        }

        return {
            title: { absolute: title },
            description,
            robots: {
                index: false,
                follow: false,
            },
            openGraph: buildOpenGraphMetadata({
                title,
                description,
                canonicalUrl: alternates.canonical,
                lang,
                type: 'website',
            }),
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

    const canonicalMenuSlug = RESTAURANT_MENU_SLUG_MAP[menuSlug];
    if (canonicalMenuSlug && canonicalMenuSlug !== menuSlug) {
        permanentRedirect(`/${lang}/menu/${canonicalMenuSlug}/`);
    }

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

        if (!shop || !shop.isCompanyStore) {
            notFound();
        }

        const fullMenuData = await getStoreFullMenuApi(apiSlug, lang).catch((error) => {
            console.error("Failed to fetch full store menu:", error);
            return { restaurantMenu: [], shop: null };
        });

        const initialMenu = fullMenuData?.restaurantMenu || [];
        const electronicMenu = fullMenuData?.shop?.electronicMenu || [];

        const alternates = getHreflangAlternates(`/menu/${menuSlug}/`, lang, getDynamicBaseUrl(await headers()));

        return (
            <>
                <HreflangLinks canonical={alternates.canonical} languages={alternates.languages} />
                <StoreMenuPage
                    shop={shop}
                    lang={lang}
                    dict={dict}
                    initialMenu={initialMenu}
                    electronicMenu={electronicMenu}
                />
            </>
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
