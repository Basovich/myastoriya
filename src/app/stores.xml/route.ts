import { NextResponse } from "next/server";
import { formatDate, buildUrlSetXml, SitemapUrlEntry } from "@/utils/sitemap-helpers";
import { getShopsApi } from "@/lib/graphql/queries/shops";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const today = formatDate();
        const entries: SitemapUrlEntry[] = [];
        const seenUrls = new Set<string>();

        const shopsRes = await getShopsApi({ limit: 100, page: 1, onlyCompanyStores: false }, "ua").catch(() => null);
        const shops = shopsRes?.shops?.data ?? [];

        for (const shop of shops) {
            const identifier = shop.slug || shop.id;
            if (identifier) {
                const url = `/our-stores/${identifier}/`;
                if (!seenUrls.has(url)) {
                    seenUrls.add(url);
                    entries.push({
                        relativePath: url,
                        lastmod: today,
                    });
                }
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
        console.error("[stores.xml] Error generating stores sitemap:", error);
        return new NextResponse(buildUrlSetXml([]), {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
}
