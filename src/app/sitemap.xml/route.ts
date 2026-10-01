import { NextResponse } from "next/server";
import { getSitemapBaseUrl, buildSitemapIndexXml } from "@/utils/sitemap-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const baseUrl = await getSitemapBaseUrl(req);
    const sitemaps = [
        { loc: `${baseUrl}/categories.xml` },
        { loc: `${baseUrl}/products.xml` },
        { loc: `${baseUrl}/publications.xml` },
        { loc: `${baseUrl}/actions.xml` },
        { loc: `${baseUrl}/complex-discounts.xml` },
        { loc: `${baseUrl}/stores.xml` },
        { loc: `${baseUrl}/pages.xml` },
    ];

    const xml = buildSitemapIndexXml(sitemaps);

    return new NextResponse(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=600, s-maxage=3600",
        },
    });
}
