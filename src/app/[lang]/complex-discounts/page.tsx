import ActionsGrid from "../../components/ActionsGrid/ActionsGrid";
import { getSpecialsApi } from "@/lib/graphql";
import { getAccessToken } from "@/app/actions/authActions";

// This is the index page for Complex Discounts: /[lang]/complex-discounts
export default async function ComplexDiscountsPage({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru" }>;
}) {
    const { lang } = await params;
    const token = await getAccessToken();
    const specialsResponse = await getSpecialsApi(12, 1, lang, token ?? undefined);

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

    return (
        <main>
            <ActionsGrid
                initialItems={initialItems}
                lang={lang}
                pageType="complex-discounts"
                initialHasMore={specialsResponse.has_more_pages}
            />
        </main>
    );
}
