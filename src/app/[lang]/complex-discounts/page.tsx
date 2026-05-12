import { getDictionary } from "@/i18n/get-dictionary";
import ActionsGrid from "../../components/ActionsGrid/ActionsGrid";
import { getSpecialsApi } from "@/lib/graphql";

// This is the index page for Complex Discounts: /[lang]/complex-discounts
export default async function ComplexDiscountsPage({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru" }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const specialsResponse = await getSpecialsApi(12, 1, lang);

    const initialItems = specialsResponse.data.map(special => {
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
                dict={dict.home.complexDiscountsPage}
                initialItems={initialItems}
                lang={lang}
                pageType="complex-discounts"
                initialHasMore={specialsResponse.has_more_pages}
            />
        </main>
    );
}
