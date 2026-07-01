import { NextRequest, NextResponse } from "next/server";
import { getSalesApi } from "@/lib/graphql";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const limit = body.limit ?? 6;
        const page = body.page ?? 1;

        const langHeader = req.headers.get('content-language');
        const lang = langHeader === 'ru_RU' ? 'ru' : 'ua';

        // cache: 'no-store' — відключаємо кеш, щоб кожна сторінка пагінації
        // отримувала свіжі дані, а не закешований результат page=1
        const result = await getSalesApi(limit, page, lang, { cache: 'no-store' });

        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Помилка при завантаженні акцій";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
