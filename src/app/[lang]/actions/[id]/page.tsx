import { getDictionary } from "@/i18n/get-dictionary";
import ActionDetail from "../../../components/ActionDetail/ActionDetail";
import { findSaleIdBySlug, getSaleApi, getProductsApi } from "@/lib/graphql";
import { notFound } from "next/navigation";

// This is the dynamic stub page for individual actions: /[lang]/actions/[id]
export default async function ActionDetailPage({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru"; id: string }>;
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);
    
    let saleId = id;
    // Check if it's a slug (contains non-digits)
    if (!/^\d+$/.test(id)) {
        const resolvedId = await findSaleIdBySlug(id, lang);
        if (!resolvedId) {
            return notFound();
        }
        saleId = resolvedId;
    }

    const sale = await getSaleApi(saleId, lang);
    if (!sale) {
        return notFound();
    }

    const productsResponse = await getProductsApi({ saleId: parseInt(sale.id), limit: 24 }, lang);

    return (
        <main>
            <ActionDetail 
                dict={dict} 
                lang={lang} 
                id={id} 
                sale={sale} 
                initialProducts={productsResponse.data}
                initialHasMore={productsResponse.has_more_pages}
            />
        </main>
    );
}
