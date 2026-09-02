import { NextResponse } from "next/server";
import { getSitemapBaseUrl, formatDate, buildSitemapIndexXml } from "@/utils/sitemap-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const baseUrl = await getSitemapBaseUrl(req);
    const today = formatDate();

    const sitemaps = [
        { loc: `${baseUrl}/categories.xml`, lastmod: today },
        { loc: `${baseUrl}/products.xml`, lastmod: today },
        { loc: `${baseUrl}/publications.xml`, lastmod: today },
        { loc: `${baseUrl}/actions.xml`, lastmod: today },
        { loc: `${baseUrl}/stores.xml`, lastmod: today },
        { loc: `${baseUrl}/pages.xml`, lastmod: today },
    ];

    const xml = buildSitemapIndexXml(sitemaps);

    return new NextResponse(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}
