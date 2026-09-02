import { NextResponse } from "next/server";
import { getSitemapBaseUrl, formatDate, buildUrlSetXml, SitemapUrlEntry } from "@/utils/sitemap-helpers";
import { getSalesApi, getSpecialsApi } from "@/lib/graphql";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const baseUrl = await getSitemapBaseUrl(req);
        const entries: SitemapUrlEntry[] = [];
        const seenUrls = new Set<string>();

        // 1. Fetch Promotions / Sales
        const salesRes = await getSalesApi(100, 1, "ua").catch(() => null);
        for (const sale of salesRes?.data ?? []) {
            const identifier = sale.slug || sale.id;
            const url = `/actions/${identifier}/`;
            if (!seenUrls.has(url)) {
                seenUrls.add(url);
                entries.push({
                    relativePath: url,
                    lastmod: formatDate(sale.expiresAt),
                });
            }
        }

        // 2. Fetch Complex Discounts / Specials
        const specialsRes = await getSpecialsApi(100, 1, "ua").catch(() => null);
        for (const special of specialsRes?.data ?? []) {
            const identifier = special.slug || special.id;
            const url = `/complex-discounts/${identifier}/`;
            if (!seenUrls.has(url)) {
                seenUrls.add(url);
                entries.push({
                    relativePath: url,
                    lastmod: formatDate(special.expiresAt),
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
        console.error("[actions.xml] Error generating actions sitemap:", error);
        return new NextResponse(buildUrlSetXml([]), {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
}
