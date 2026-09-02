import { NextResponse } from "next/server";
import { getSitemapBaseUrl, formatDate, buildUrlSetXml, SitemapUrlEntry } from "@/utils/sitemap-helpers";
import { getCatalogTreeApi, ProductCategory } from "@/lib/graphql";

export const dynamic = "force-dynamic";

function collectCategories(categories: ProductCategory[]): ProductCategory[] {
    const list: ProductCategory[] = [];
    const traverse = (item: ProductCategory) => {
        list.push(item);
        for (const child of item.children ?? []) {
            traverse(child);
        }
    };
    for (const cat of categories) {
        traverse(cat);
    }
    return list;
}

export async function GET(req: Request) {
    try {
        const baseUrl = await getSitemapBaseUrl(req);
        const catalogTree = await getCatalogTreeApi("ua", 768).catch(() => [] as ProductCategory[]);
        const allCategories = collectCategories(catalogTree);

        // Deduplicate by slug
        const seenSlugs = new Set<string>();
        const entries: SitemapUrlEntry[] = [];
        const today = formatDate();

        for (const cat of allCategories) {
            if (cat.slug && !seenSlugs.has(cat.slug)) {
                seenSlugs.add(cat.slug);
                entries.push({
                    relativePath: `/category/${cat.slug}/`,
                    lastmod: today,
                });
            }
        }

        const xml = buildUrlSetXml(entries, baseUrl);

        return new NextResponse(xml, {
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        console.error("[categories.xml] Error generating categories sitemap:", error);
        return new NextResponse(buildUrlSetXml([]), {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
}
