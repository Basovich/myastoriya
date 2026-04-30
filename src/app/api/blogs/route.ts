import { NextRequest, NextResponse } from "next/server";
import { getBlogsApi } from "@/lib/graphql/queries/blog";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const page: number = body.page ?? 1;
        const typeSlug: string | null = body.typeSlug ?? null;

        const langHeader = req.headers.get('content-language');
        const lang = langHeader === 'ru_RU' ? 'ru' : 'ua';

        const result = await getBlogsApi({ page, typeSlug }, lang);

        return NextResponse.json({
            items: result.data,
            hasMore: result.has_more_pages,
            currentPage: result.current_page,
            totalPages: result.last_page,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Помилка";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
