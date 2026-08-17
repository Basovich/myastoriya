import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import StoreMenuPage from "@/app/pages/StoreMenu/StoreMenuPage";
import { getShopBySlugApi } from "@/lib/graphql/queries/shops";
import { getStoreFullMenuApi } from "@/lib/graphql/queries/pages/restaurantMenu";
import { getApiSlugFromMenu } from "@/config/menuSlugMap";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function MenuPage({
    params,
}: {
    params: Promise<{ lang: string; menuSlug: string }>;
}) {
    const { lang, menuSlug } = await params;
    const dict = await getDictionary(lang as Locale);

    try {
        // Ресторани: menu slug → API slug (obolon → shop-1).
        // Мітбари: menu slug === API slug напряму.
        const apiSlug = getApiSlugFromMenu(menuSlug);

        const shopResponse = await getShopBySlugApi(apiSlug, lang);
        const shop = shopResponse.shop;

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
