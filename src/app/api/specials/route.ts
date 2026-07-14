import { NextRequest, NextResponse } from "next/server";
import { getSpecialsApi } from "@/lib/graphql";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const limit = body.limit ?? 12;
        const page = body.page ?? 1;

        const langHeader = req.headers.get('content-language');
        const lang = langHeader === 'ru_RU' ? 'ru' : 'ua';

        const token = req.cookies.get('access_token')?.value;
        const result = await getSpecialsApi(limit, page, lang, token ?? undefined);

        const filteredData = (result?.data || []).filter(special => {
            if (!special.products || special.products.length === 0) return false;
            if (typeof special.productsCount === 'number' && special.products.length < special.productsCount) {
                return false;
            }
            return special.products.every(product => product.available);
        });

        return NextResponse.json({
            ...result,
            data: filteredData
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Помилка при завантаженні комплексних знижок";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
