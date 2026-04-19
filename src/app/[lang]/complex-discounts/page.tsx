import { getDictionary } from "@/i18n/get-dictionary";
import ActionsGrid from "../../components/ActionsGrid/ActionsGrid";

// This is the index page for Complex Discounts: /[lang]/complex-discounts
export default async function ComplexDiscountsPage({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru" }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <main>
            <ActionsGrid
                dict={dict.home.complexDiscountsPage}
                initialItems={dict.home.discounts.items}
                lang={lang}
                pageType="complex-discounts"
            />
        </main>
    );
}
