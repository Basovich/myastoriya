import { getDictionary } from "@/i18n/get-dictionary";
import PromotionsGrid from "../../components/PromotionsGrid/PromotionsGrid";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

// This is the index page for Promotions: /[lang]/promotions
export default async function PromotionsPage({
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
                    dict={dict.home.promotionsPage}
                    initialItems={dict.home.promotions.items}
                    lang={lang}
                />
            </main>
            <Footer lang={lang} />
        </>
    );
}
