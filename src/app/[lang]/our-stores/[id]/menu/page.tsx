import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import StoreMenuPage from "@/app/pages/StoreMenu/StoreMenuPage";
import { getShopApi, getShopsApi } from "@/lib/graphql/queries/shops";
import { notFound } from "next/navigation";

export default async function StoreMenuPageRoute({
    params,
}: {
    params: Promise<{ lang: Locale; id: string }>;
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    try {
        const response = await getShopApi(id, lang);
        const shop = response.shop;

        if (!shop) {
            notFound();
        }

        return (
            <StoreMenuPage 
                shop={shop} 
                lang={lang} 
                dict={dict} 
            />
        );
    } catch (error) {
        console.error("Failed to fetch shop for menu:", error);
        notFound();
    }
}

export async function generateStaticParams() {
    try {
        const response = await getShopsApi({ limit: 100 });
        return response.shops.data.map((shop) => ({
            id: shop.id.toString(),
        }));
    } catch (error) {
        console.error("Failed to generate menu static params:", error);
        return [];
    }
}
