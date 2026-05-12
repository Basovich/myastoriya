import { getDictionary } from "@/i18n/get-dictionary";
import ComplexDiscountDetail from "../../../components/ComplexDiscountDetail/ComplexDiscountDetail";
import { findSpecialIdBySlug, getSpecialApi } from "@/lib/graphql";
import { notFound } from "next/navigation";

export default async function ComboDetail({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru"; slug: string }>;
}) {
    const { lang, slug } = await params;
    const dict = await getDictionary(lang);

    // Try to resolve slug to ID
    let finalId = slug;
    if (isNaN(Number(slug))) {
        const resolvedId = await findSpecialIdBySlug(slug, lang);
        if (resolvedId) {
            finalId = resolvedId;
        }
    }

    const special = await getSpecialApi(finalId, lang);

    if (!special) {
        notFound();
    }

    return (
        <main>
            <ComplexDiscountDetail dict={dict} lang={lang} initialData={special} />
        </main>
    );
}
