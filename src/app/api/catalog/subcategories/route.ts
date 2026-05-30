import { NextRequest, NextResponse } from "next/server";
import { getSubcategoriesApi } from "@/lib/graphql";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const parentIdStr = searchParams.get("parentId");
        
        if (!parentIdStr) {
            return NextResponse.json({ error: "parentId query parameter is required" }, { status: 400 });
        }
        
        const parentId = parseInt(parentIdStr, 10);
        if (isNaN(parentId)) {
            return NextResponse.json({ error: "parentId must be a number" }, { status: 400 });
        }

        const langHeader = req.headers.get('content-language');
        const lang = langHeader === 'ru_RU' ? 'ru' : 'ua';

        const result = await getSubcategoriesApi(parentId, lang);

        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Помилка при завантаженні підкатегорій";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
