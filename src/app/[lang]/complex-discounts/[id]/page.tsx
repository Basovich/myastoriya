import { getDictionary } from "@/i18n/get-dictionary";
import ComplexDiscountDetail from "../../../components/ComplexDiscountDetail/ComplexDiscountDetail";

export default async function ComboDetail({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru"; id: string }>;
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    return (
        <main>
            <ComplexDiscountDetail dict={dict} lang={lang} id={id} />
        </main>
    );
}
