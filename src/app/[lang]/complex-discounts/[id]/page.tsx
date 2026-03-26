import { getDictionary } from "@/i18n/get-dictionary";
import Footer from "../../../components/Footer/Footer";
import Header from "../../../components/Header/Header";
import ComplexDiscountDetail from "../../../components/ComplexDiscountDetail/ComplexDiscountDetail";

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
                <ComplexDiscountDetail dict={dict} lang={lang} id={id} />
            </main>
            <Footer lang={lang} />
        </>
    );
}
