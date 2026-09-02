import { NextResponse } from "next/server";
import { getSitemapBaseUrl, formatDate, buildUrlSetXml, SitemapUrlEntry } from "@/utils/sitemap-helpers";
import { getBlogsApi, BlogPost } from "@/lib/graphql";
import { getBlogPostHref } from "@/utils/blog-url";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const baseUrl = await getSitemapBaseUrl(req);
        const posts: BlogPost[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 20) {
            const res = await getBlogsApi({ limit: 50, page }, "ua").catch(() => null);
            if (!res || !res.data || res.data.length === 0) {
                break;
            }
            posts.push(...res.data);
            hasMore = res.has_more_pages;
            page++;
        }

        const seenUrls = new Set<string>();
        const entries: SitemapUrlEntry[] = [];

        for (const post of posts) {
            const href = getBlogPostHref(post);
            if (href && !seenUrls.has(href)) {
                seenUrls.add(href);
                entries.push({
                    relativePath: href,
                    lastmod: formatDate(post.publishedAt),
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
        console.error("[publications.xml] Error generating publications sitemap:", error);
        return new NextResponse(buildUrlSetXml([]), {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
}
