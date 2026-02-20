import { getDictionary } from "@/i18n/get-dictionary";
import PromotionsGrid from "../../components/PromotionsGrid/PromotionsGrid";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

// This is the index page for Complex Discounts: /[lang]/complex-discounts
export default async function ComplexDiscountsPage({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru" }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <>
            <Header lang={lang} />
            <main>
                <PromotionsGrid
                    dict={dict.home.complexDiscountsPage}
                    initialItems={dict.home.discounts.items}
                    lang={lang}
                    pageType="complex-discounts"
                />
            </main>
            <Footer lang={lang} />
        </>
    );
}
