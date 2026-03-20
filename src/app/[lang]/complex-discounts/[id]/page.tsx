import { getDictionary } from "@/i18n/get-dictionary";
import Footer from "../../../components/Footer/Footer";
import Header from "../../../components/Header/Header";
import ActionDetail from "../../../components/ActionDetail/ActionDetail";

// This is the dynamic stub page for individual combos: /[lang]/complex-discounts/[id]
export default async function ComboDetail({
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
                <ActionDetail dict={dict} lang={lang} id={id} pageType="complex-discounts" />
            </main>
            <Footer lang={lang} />
        </>
    );
}
