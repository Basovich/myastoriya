import { NextRequest, NextResponse } from "next/server";
import { getCatalogTreeApi } from "@/lib/graphql/queries/products";

export async function GET(req: NextRequest) {
    try {
        const langHeader = req.headers.get('content-language');
        const lang = langHeader === 'ru_RU' ? 'ru' : 'ua';

        const result = await getCatalogTreeApi(lang);

        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Помилка при завантаженні категорій";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
