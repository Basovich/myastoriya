import { NextResponse } from "next/server";
import { getSitemapBaseUrl, buildPairedUrlSetXml, PairedSitemapEntry } from "@/utils/sitemap-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const baseUrl = await getSitemapBaseUrl(req);
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

        const entries: PairedSitemapEntry[] = staticPaths.map((path) => ({
            ukPath: path,
            ruPath: path,
            // lastmod відсутній — статичні сторінки не мають API з датами зміни
        }));

        const xml = buildPairedUrlSetXml(entries, baseUrl);

        return new NextResponse(xml, {
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=600, s-maxage=3600",
            },
        });
    } catch (error) {
        console.error("[pages.xml] Error generating pages sitemap:", error);
        return new NextResponse(buildPairedUrlSetXml([]), {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
}
