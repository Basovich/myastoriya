import { getDictionary } from "@/i18n/get-dictionary";
import Footer from "../../../components/Footer/Footer";
import Header from "../../../components/Header/Header";
import PromotionDetail from "../../../components/PromotionDetail/PromotionDetail";

// This is the dynamic stub page for individual promotions: /[lang]/promotions/[id]
export default async function PromotionDetailPage({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru"; id: string }>;
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    return (
        <>
            <Header lang={lang} />
            <main>
                <PromotionDetail dict={dict} lang={lang} id={id} />
            </main>
            <Footer lang={lang} />
        </>
    );
}
