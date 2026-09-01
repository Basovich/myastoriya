import { NextResponse } from "next/server";
import { formatDate, buildUrlSetXml, SitemapUrlEntry } from "@/utils/sitemap-helpers";
import { getProductsApi, Product } from "@/lib/graphql";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const products: Product[] = [];
        let page = 1;
        let hasMore = true;
        const maxPages = 50; // Fetch up to 5000 products

        while (hasMore && page <= maxPages) {
            const res = await getProductsApi({ limit: 100, page }, "ua", undefined).catch(() => null);
            if (!res || !res.data || res.data.length === 0) {
                break;
            }
            products.push(...res.data);
            hasMore = res.has_more_pages;
            page++;
        }

        // Deduplicate by slug or id
        const seenSlugs = new Set<string>();
        const entries: SitemapUrlEntry[] = [];
        const today = formatDate();

        for (const prod of products) {
            const slug = prod.slug || prod.id;
            if (slug && !seenSlugs.has(String(slug))) {
                seenSlugs.add(String(slug));
                entries.push({
                    relativePath: `/product/${slug}/`,
                    lastmod: today,
                });
            }
        }

        const xml = buildUrlSetXml(entries);

        return new NextResponse(xml, {
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        console.error("[products.xml] Error generating products sitemap:", error);
        return new NextResponse(buildUrlSetXml([]), {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
}
