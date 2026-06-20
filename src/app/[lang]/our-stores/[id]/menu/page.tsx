import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import StoreMenuPage from "@/app/pages/StoreMenu/StoreMenuPage";
import { getShopApi } from "@/lib/graphql/queries/shops";
import { getRestaurantMenuApi } from "@/lib/graphql/queries/pages/restaurantMenu";
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

        const [shopResponse, menuResponse] = await Promise.all([
            getShopApi(id, lang),
            getRestaurantMenuApi(shopIdNum, lang).catch(error => {
                console.error("Failed to fetch restaurant menu from API:", error);
                return { restaurantMenu: [] };
            })
        ]);

        const shop = shopResponse.shop;
        const initialMenu = menuResponse?.restaurantMenu || [];

        if (!shop) {
            notFound();
        }

        return (
            <StoreMenuPage 
                shop={shop} 
                lang={lang} 
                dict={dict} 
                initialMenu={initialMenu}
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
