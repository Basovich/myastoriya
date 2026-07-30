import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import StoreMenuPage from "@/app/pages/StoreMenu/StoreMenuPage";
import { getShopBySlugApi } from "@/lib/graphql/queries/shops";
import { getRestaurantMenuApi, getShopCustomMenuApi } from "@/lib/graphql/queries/pages/restaurantMenu";
import { getApiSlugFromMenu } from "@/config/menuSlugMap";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function MenuPage({
    params,
}: {
    params: Promise<{ lang: Locale; menuSlug: string }>;
}) {
    const { lang, menuSlug } = await params;
    const dict = await getDictionary(lang);

    try {
        // Ресторани: menu slug → API slug (obolon → shop-1).
        // Мітбари: menu slug === API slug напряму.
        const apiSlug = getApiSlugFromMenu(menuSlug);

        const shopResponse = await getShopBySlugApi(apiSlug, lang);
        const shop = shopResponse.shop;

        if (!shop) {
            notFound();
        }

        const shopIdNum = parseInt(shop.id, 10);

        const [menuResponse, customMenuResponse] = await Promise.all([
            getRestaurantMenuApi(shopIdNum, lang).catch((error) => {
                console.error("Failed to fetch restaurant menu:", error);
                return { restaurantMenu: [] };
            }),
            getShopCustomMenuApi(shopIdNum, lang).catch((error) => {
                console.error("Failed to fetch custom store menu:", error);
                return { shopCustomMenu: [] };
            }),
        ]);

        const initialMenu = menuResponse?.restaurantMenu || [];
        const initialCustomMenu = customMenuResponse?.shopCustomMenu || [];

        return (
            <StoreMenuPage
                shop={shop}
                lang={lang}
                dict={dict}
                initialMenu={initialMenu}
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
