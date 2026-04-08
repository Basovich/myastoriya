import { NextRequest, NextResponse } from "next/server";
import { getProductsApi } from "@/lib/graphql";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const categoryId = body.categoryId ? parseInt(body.categoryId) : null;
        const limit = body.limit ?? 8;
        const page = body.page ?? 1;

        const langHeader = req.headers.get('content-language');
        const lang = langHeader === 'ru_RU' ? 'ru' : 'ua';

        const result = await getProductsApi({ categoryId, limit, page }, lang);

        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Помилка при завантаженні товарів";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
