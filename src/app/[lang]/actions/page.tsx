import type { Metadata } from "next";
import ActionsGrid from "../../components/ActionsGrid/ActionsGrid";
import { getSalesApi } from "@/lib/graphql/queries/pages/home/sales";
import { getProductsApi } from "@/lib/graphql";
import { getAccessToken } from "@/app/actions/authActions";
import { getStaticPageSeoData } from "@/utils/seo";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru" }>;
}): Promise<Metadata> {
    const { lang } = await params;
    const seo = getStaticPageSeoData('actions', lang);

    return {
        title: lang === 'ru' ? { absolute: seo.title } : seo.h1,
        description: seo.description,
        openGraph: {
            title: seo.h1,
            description: seo.description,
        },
        twitter: {
            card: "summary_large_image",
            title: seo.h1,
            description: seo.description,
        },
    };
}

// This is the index page for Actions: /[lang]/actions
export default async function ActionsPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: "ua" | "ru" }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const { lang } = await params;
    const { page: pageQuery } = await searchParams;
    const page = Math.max(1, parseInt(pageQuery || "1", 10));

    const token = await getAccessToken();
    const salesResponse = await getSalesApi(12, page, lang, token ?? undefined);

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
        image: sale.banner?.size2x || sale.banner?.size1x || sale.image?.size2x || sale.image?.size1x || "",
        imageWeb: sale.bannerWeb,
        date: sale.expiresAt ? new Date(sale.expiresAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uk-UA') : ""
    }));

    const totalPages = salesResponse?.has_more_pages ? page + 1 : page;

    return (
        <main>
            <ActionsGrid
                initialItems={initialItems}
                lang={lang}
                pageType="promotions"
                initialHasMore={salesResponse?.has_more_pages}
                initialPage={page}
                totalPages={totalPages}
            />
        </main>
    );
}
