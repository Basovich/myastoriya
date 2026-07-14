import ComplexDiscountDetail from "../../../components/ComplexDiscountDetail/ComplexDiscountDetail";
import { findSpecialIdBySlug, getSpecialApi } from "@/lib/graphql";
import { notFound, redirect } from "next/navigation";
import { getAccessToken } from "@/app/actions/authActions";

export default async function ComboDetail({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru"; slug: string }>;
}) {
    const { lang, slug } = await params;
    const token = await getAccessToken();

    // Try to resolve slug to ID
    let finalId = slug;
    if (isNaN(Number(slug))) {
        let resolvedId = await findSpecialIdBySlug(slug, lang, token ?? undefined);
        if (!resolvedId) {
            // Fallback to public list (without token) to resolve the ID so we can redirect instead of 404
            resolvedId = await findSpecialIdBySlug(slug, lang, undefined);
        }
        if (resolvedId) {
            finalId = resolvedId;
        }
    }

    let special = null;
    let publicSpecial = null;
    try {
        [special, publicSpecial] = await Promise.all([
            getSpecialApi(finalId, lang, token ?? undefined),
            getSpecialApi(finalId, lang, undefined)
        ]);
    } catch (err) {
        console.warn(`[ComboDetailPage] Failed to fetch special with id ${finalId}:`, err);
    }

    // If it doesn't exist even in the public catalog, then it's a true 404
    if (!publicSpecial) {
        notFound();
    }

    // Determine the expected count of products from the public catalog version
    const expectedCount = Math.max(
        publicSpecial.products?.length ?? 0,
        publicSpecial.productsCount ?? 0,
        2 // A bundle must have at least 2 products
    );

    // The special is considered unavailable if:
    // 1. It wasn't returned for this city (special is null)
    // 2. The list of products is missing or shorter than expected
    // 3. Any of the products is marked as not available
    const hasUnavailableProduct = !special || 
        !special.products || 
        special.products.length < expectedCount ||
        special.products.some(product => !product.available);

    if (hasUnavailableProduct || !special) {
        redirect(`/${lang}/complex-discounts`);
    }

    return (
        <main>
            <ComplexDiscountDetail lang={lang} initialData={special} />
        </main>
    );
}
