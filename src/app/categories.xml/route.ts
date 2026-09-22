import { NextResponse } from "next/server";
import { getSitemapBaseUrl, formatDate, buildPairedUrlSetXml, PairedSitemapEntry } from "@/utils/sitemap-helpers";
import { getCatalogTreeApi, ProductCategory } from "@/lib/graphql";

export const dynamic = "force-dynamic";

interface CategoryWithDates extends ProductCategory {
    updatedAt?: string | null;
}

function collectCategories(categories: ProductCategory[]): Map<string, ProductCategory> {
    const map = new Map<string, ProductCategory>();
    const traverse = (item: ProductCategory) => {
        if (item.id && item.slug) {
            map.set(String(item.id), item);
        }
        for (const child of item.children ?? []) {
            traverse(child);
        }
    };
    for (const cat of categories) {
        traverse(cat);
    }
    return map;
}

export async function GET(req: Request) {
    try {
        const baseUrl = await getSitemapBaseUrl(req);
        const [treeUa, treeRu] = await Promise.all([
            getCatalogTreeApi("ua", 768).catch(() => [] as ProductCategory[]),
            getCatalogTreeApi("ru", 768).catch(() => [] as ProductCategory[]),
        ]);

        const uaMap = collectCategories(treeUa);
        const ruMap = collectCategories(treeRu);
        const allIds = new Set([...uaMap.keys(), ...ruMap.keys()]);

        const entries: PairedSitemapEntry[] = [];
        const seenIds = new Set<string>();
        const today = formatDate();

        for (const id of allIds) {
            const uaCat = uaMap.get(id);
            const ruCat = ruMap.get(id);
            const cat = uaCat || ruCat;
            if (!cat) continue;

            const uaSlug = uaCat?.slug || ruCat?.slug;
            const ruSlug = ruCat?.slug || uaCat?.slug;

            if (uaSlug && ruSlug && !seenIds.has(id)) {
                seenIds.add(id);
                const categoryDates = cat as CategoryWithDates;
                entries.push({
                    ukPath: `/category/${uaSlug}/`,
                    ruPath: `/category/${ruSlug}/`,
                    lastmod: formatDate(categoryDates.updatedAt || today),
                });
            }
        }

        const xml = buildPairedUrlSetXml(entries, baseUrl);

        return new NextResponse(xml, {
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=600, s-maxage=3600",
            },
        });
    } catch (error) {
        console.error("[categories.xml] Error generating categories sitemap:", error);
        return new NextResponse(buildPairedUrlSetXml([]), {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
}
