import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import StoreDetailPage from "@/app/pages/OurStores/StoreDetailPage/StoreDetailPage";
import { getShopBySlugApi } from "@/lib/graphql/queries/shops";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function StorePage({
    params,
}: {
    params: Promise<{ lang: Locale; slug: string }>;
}) {
    const { lang, slug } = await params;
    const dict = await getDictionary(lang);

    try {
        const response = await getShopBySlugApi(slug, lang);
        const shop = response.shop;

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
    } catch (error) {
        console.error("Failed to fetch shop:", error);
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
