import { getDictionary } from "@/i18n/get-dictionary";
import ActionDetail from "../../../components/ActionDetail/ActionDetail";
import { getSalesApi, getProductsApi } from "@/lib/graphql";
import { notFound } from "next/navigation";

// This is the dynamic stub page for individual actions: /[lang]/actions/[slug]
export default async function ActionDetailPage({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru"; slug: string }>;
}) {
    const { lang, slug } = await params;
    const dict = await getDictionary(lang);

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

    const productsResponse = await getProductsApi(
        { saleId: parseInt(sale.id), limit: 24 },
        lang,
    );

    return (
        <main>
            <ActionDetail
                dict={dict}
                lang={lang}
                id={slug}
                sale={sale}
                initialProducts={productsResponse.data}
                initialHasMore={productsResponse.has_more_pages}
            />
        </main>
    );
}
