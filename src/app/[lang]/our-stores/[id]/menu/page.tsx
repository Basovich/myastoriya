import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import StoreMenuPage from "@/app/pages/StoreMenu/StoreMenuPage";
import { getShopApi } from "@/lib/graphql/queries/shops";
import { getRestaurantMenuApi, getShopCustomMenuApi } from "@/lib/graphql/queries/pages/restaurantMenu";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function StoreMenuPageRoute({
    params,
}: {
    params: Promise<{ lang: Locale; id: string }>;
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    try {
        const shopIdNum = parseInt(id, 10);
        if (isNaN(shopIdNum)) {
            notFound();
        }

        const [shopResponse, menuResponse, customMenuResponse] = await Promise.all([
            getShopApi(id, lang),
            getRestaurantMenuApi(shopIdNum, lang).catch(error => {
                console.error("Failed to fetch restaurant menu from API:", error);
                return { restaurantMenu: [] };
            }),
            getShopCustomMenuApi(shopIdNum, lang).catch(error => {
                console.error("Failed to fetch custom store menu from API:", error);
                return { shopCustomMenu: [] };
            })
        ]);

        const shop = shopResponse.shop;
        const initialMenu = menuResponse?.restaurantMenu || [];
        const initialCustomMenu = customMenuResponse?.shopCustomMenu || [];

        if (!shop) {
            notFound();
        }

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
