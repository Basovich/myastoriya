import { NextRequest, NextResponse } from "next/server";
import { getCategoryByIdApi, getSubcategoriesApi, getCatalogTreeApi } from "@/lib/graphql";
import { buildCategoryIndex, getCategoryHref } from "@/utils/category-url";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const categoryIdStr = searchParams.get("categoryId");

        if (!categoryIdStr) {
            return NextResponse.json({ error: "categoryId query parameter is required" }, { status: 400 });
        }

        const categoryId = parseInt(categoryIdStr, 10);
        if (isNaN(categoryId)) {
            return NextResponse.json({ error: "categoryId must be a number" }, { status: 400 });
        }

        // Determine language from query param or header
        const langParam = searchParams.get("lang");
        const langHeader = req.headers.get('content-language');
        const lang = langParam === 'ru' || langHeader === 'ru_RU' ? 'ru' : 'ua';

        // 1. Fetch current category
        const category = await getCategoryByIdApi(categoryId, lang);
        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        // 2. Fetch full catalog tree and build index for href calculation
        const catalogTree = await getCatalogTreeApi(lang);
        const categoryIndex = buildCategoryIndex(catalogTree);

        const getHref = (id: string | number): string => {
            const entry = categoryIndex.get(String(id));
            if (!entry) return "";
            const rawHref = getCategoryHref(entry.node, entry.parent, entry.grandParent);
            // Append locale prefix if needed
            return lang === 'ru' ? `/ru${rawHref}` : rawHref;
        };

        let parent = null;
        let siblings = [];

        const parentId = category.parentId;

        // 3. Fetch parent and siblings based on parentId presence
        if (parentId && parentId !== 768) {
            const parentData = await getCategoryByIdApi(parentId, lang);
            if (parentData) {
                parent = {
                    id: parentData.id,
                    name: parentData.name,
                    slug: parentData.slug,
                    href: getHref(parentData.id)
                };
            }
            const siblingsData = await getSubcategoriesApi(parentId, lang);
            siblings = siblingsData.map(sib => ({
                id: sib.id,
                name: sib.name,
                slug: sib.slug,
                href: getHref(sib.id)
            }));
        } else {
            // If it's a top-level category, the parent is the root Catalog (ID 768)
            parent = {
                id: "768",
                name: lang === 'ru' ? "Каталог" : "Каталог",
                slug: "",
                href: lang === 'ru' ? "/ru" : "/"
            };
            const siblingsData = await getSubcategoriesApi(768, lang);
            siblings = siblingsData.map(sib => ({
                id: sib.id,
                name: sib.name,
                slug: sib.slug,
                href: getHref(sib.id)
            }));
        }

        return NextResponse.json({
            parent,
            siblings
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Помилка при завантаженні фільтра категорій";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
