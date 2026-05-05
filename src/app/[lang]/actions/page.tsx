import { getDictionary } from "@/i18n/get-dictionary";
import ActionsGrid from "../../components/ActionsGrid/ActionsGrid";
import { getSalesApi } from "@/lib/graphql/queries/pages/home/sales";

// This is the index page for Actions: /[lang]/actions
export default async function ActionsPage({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru" }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const salesResponse = await getSalesApi(12, 1, lang);

    const initialItems = salesResponse.data.map(sale => ({
        id: parseInt(sale.id),
        slug: sale.slug,
        title: sale.name,
        image: sale.image?.size2x || sale.image?.size1x || "",
        date: sale.expiresAt ? new Date(sale.expiresAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uk-UA') : ""
    }));

    return (
        <main>
            <ActionsGrid
                dict={dict.home.actionsPage}
                initialItems={initialItems}
                lang={lang}
                pageType="promotions"
                initialHasMore={salesResponse.has_more_pages}
            />
        </main>
    );
}
