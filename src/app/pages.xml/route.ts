import { NextResponse } from "next/server";
import { getSitemapBaseUrl, formatDate, buildUrlSetXml, SitemapUrlEntry } from "@/utils/sitemap-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const baseUrl = await getSitemapBaseUrl(req);
        const today = formatDate();

        const staticPaths = [
            "/",
            "/catalog/",
            "/blog/",
            "/blog/recipe/",
            "/blog/article/",
            "/actions/",
            "/complex-discounts/",
            "/our-stores/",
            "/delivery/",
            "/delivery-meat-bar/",
            "/contacts/",
            "/privacy-policy/",
            "/oferta/",
            "/careers/",
            "/loyalty-program-rules/",
        ];

        const entries: SitemapUrlEntry[] = staticPaths.map((path) => ({
            relativePath: path,
            lastmod: today,
        }));

        const xml = buildUrlSetXml(entries, baseUrl);

        return new NextResponse(xml, {
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        console.error("[pages.xml] Error generating pages sitemap:", error);
        return new NextResponse(buildUrlSetXml([]), {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
}
