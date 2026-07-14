import ActionDetail from "../../../components/ActionDetail/ActionDetail";
import { getSalesApi, getProductsApi, type Product } from "@/lib/graphql";
import { notFound } from "next/navigation";
import { getAccessToken } from "@/app/actions/authActions";

// This is the dynamic stub page for individual actions: /[lang]/actions/[slug]
export default async function ActionDetailPage({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru"; slug: string }>;
}) {
    const { lang, slug } = await params;

    // Fetch full list of sales to find by slug or numeric id.
    // sale(id) query crashes on the backend (500), so we use the list endpoint.
    const salesResponse = await getSalesApi(100, 1, lang);

    const isNumericId = /^\d+$/.test(slug);
    const sale = isNumericId
        ? salesResponse.data.find((s) => s.id === slug)
        : salesResponse.data.find((s) => s.slug === slug);

    if (!sale) {
        return notFound();
    }

    const token = await getAccessToken();

    let productsResponse = { data: [] as Product[], has_more_pages: false };
    try {
        productsResponse = await getProductsApi(
            { saleId: parseInt(sale.id), limit: 24, silent: true },
            lang,
            token ?? undefined,
        );
    } catch (err) {
        console.warn(`[ActionDetailPage] Failed to fetch products for sale ${sale.id}:`, err);
    }

    return (
        <main>
            <ActionDetail
                lang={lang}
                id={slug}
                sale={sale}
                initialProducts={productsResponse.data}
                initialHasMore={productsResponse.has_more_pages}
            />
        </main>
    );
}
