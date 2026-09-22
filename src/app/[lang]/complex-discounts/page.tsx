import ActionsGrid from "../../components/ActionsGrid/ActionsGrid";
import { getSpecialsApi } from "@/lib/graphql";
import { getAccessToken } from "@/app/actions/authActions";

// This is the index page for Complex Discounts: /[lang]/complex-discounts
export default async function ComplexDiscountsPage({
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
    const specialsResponse = await getSpecialsApi(12, page, lang, token ?? undefined);

    const activeSpecials = (specialsResponse?.data || []).filter(special => {
        if (!special.products || special.products.length < 2) return false;
        if (typeof special.productsCount === 'number' && special.productsCount > 0 && special.products.length < special.productsCount) {
            return false;
        }
        return special.products.every(product => product.available);
    });

    const initialItems = activeSpecials.map(special => {
        let image = special.image?.size2x || special.image?.size1x || "";
        if (image && image.startsWith('/')) {
            image = `https://dev-api.myastoriya.com.ua${image}`;
        }
        return {
            id: parseInt(special.id),
            slug: special.slug,
            title: special.title || "",
            image: image,
            date: special.expiresAt ? new Date(special.expiresAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uk-UA') : "",
            discount: special.amount ? `-${special.amount}%` : null
        };
    });

    const totalPages = specialsResponse?.has_more_pages ? page + 1 : page;

    return (
        <main>
            <ActionsGrid
                initialItems={initialItems}
                lang={lang}
                pageType="complex-discounts"
                initialHasMore={specialsResponse?.has_more_pages}
                initialPage={page}
                totalPages={totalPages}
            />
        </main>
    );
}
