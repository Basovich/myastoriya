import ActionsGrid from "../../components/ActionsGrid/ActionsGrid";
import { getSalesApi } from "@/lib/graphql/queries/pages/home/sales";
import { getProductsApi } from "@/lib/graphql";
import { getAccessToken } from "@/app/actions/authActions";

// This is the index page for Actions: /[lang]/actions
export default async function ActionsPage({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru" }>;
}) {
    const { lang } = await params;
    const token = await getAccessToken();
    const salesResponse = await getSalesApi(12, 1, lang, token ?? undefined);

    const activeSalesChecks = await Promise.all(
        (salesResponse?.data || []).map(async (sale) => {
            try {
                const products = await getProductsApi(
                    { saleId: parseInt(sale.id), limit: 1, silent: true },
                    lang,
                    token ?? undefined,
                );
                return { sale, hasProducts: products.data.length > 0 };
            } catch {
                return { sale, hasProducts: false };
            }
        })
    );

    const activeSales = activeSalesChecks.filter(c => c.hasProducts).map(c => c.sale);

    const initialItems = activeSales.map(sale => ({
        id: parseInt(sale.id),
        slug: sale.slug,
        title: sale.name,
        image: sale.image?.size2x || sale.image?.size1x || "",
        imageWeb: sale.imageWeb,
        date: sale.expiresAt ? new Date(sale.expiresAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uk-UA') : ""
    }));

    return (
        <main>
            <ActionsGrid
                initialItems={initialItems}
                lang={lang}
                pageType="promotions"
                initialHasMore={salesResponse.has_more_pages}
            />
        </main>
    );
}
