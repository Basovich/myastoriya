import ComplexDiscountDetail from "../../../components/ComplexDiscountDetail/ComplexDiscountDetail";
import { findSpecialIdBySlug, getSpecialApi } from "@/lib/graphql";
import { notFound } from "next/navigation";
import { getAccessToken } from "@/app/actions/authActions";

export default async function ComboDetail({
    params,
}: {
    params: Promise<{ lang: "ua" | "ru"; slug: string }>;
}) {
    const { lang, slug } = await params;
    const token = await getAccessToken();

    // Try to resolve slug to ID
    let finalId = slug;
    if (isNaN(Number(slug))) {
        const resolvedId = await findSpecialIdBySlug(slug, lang, token ?? undefined);
        if (resolvedId) {
            finalId = resolvedId;
        }
    }

    let special = null;
    try {
        special = await getSpecialApi(finalId, lang, token ?? undefined);
    } catch (err) {
        console.warn(`[ComboDetailPage] Failed to fetch special with id ${finalId}:`, err);
    }

    if (!special) {
        notFound();
    }

    return (
        <main>
            <ComplexDiscountDetail lang={lang} initialData={special} />
        </main>
    );
}
