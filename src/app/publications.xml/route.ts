import { NextResponse } from "next/server";
import { getSitemapBaseUrl, formatDate, buildPairedUrlSetXml, PairedSitemapEntry } from "@/utils/sitemap-helpers";
import { getBlogsApi, BlogPost } from "@/lib/graphql";
import { getBlogPostHref } from "@/utils/blog-url";

export const dynamic = "force-dynamic";

interface BlogWithDates extends BlogPost {
    updatedAt?: string | null;
}

export async function GET(req: Request) {
    try {
        const baseUrl = await getSitemapBaseUrl(req);
        
        // Fetch UA blogs
        const uaBlogsMap = new Map<string, BlogPost>();
        let pageUa = 1;
        let hasMoreUa = true;

        while (hasMoreUa && pageUa <= 20) {
            const res = await getBlogsApi({ limit: 50, page: pageUa }, "ua").catch(() => null);
            if (!res || !res.data || res.data.length === 0) break;
            for (const post of res.data) {
                uaBlogsMap.set(String(post.id), post);
            }
            hasMoreUa = res.has_more_pages;
            pageUa++;
        }

        // Fetch RU blogs
        const ruBlogsMap = new Map<string, BlogPost>();
        let pageRu = 1;
        let hasMoreRu = true;

        while (hasMoreRu && pageRu <= 20) {
            const res = await getBlogsApi({ limit: 50, page: pageRu }, "ru").catch(() => null);
            if (!res || !res.data || res.data.length === 0) break;
            for (const post of res.data) {
                ruBlogsMap.set(String(post.id), post);
            }
            hasMoreRu = res.has_more_pages;
            pageRu++;
        }

        const allIds = new Set([...uaBlogsMap.keys(), ...ruBlogsMap.keys()]);
        const entries: PairedSitemapEntry[] = [];
        const seenIds = new Set<string>();

        for (const id of allIds) {
            const uaPost = uaBlogsMap.get(id);
            const ruPost = ruBlogsMap.get(id);
            const post = uaPost || ruPost;
            if (!post) continue;

            const ukHref = uaPost ? getBlogPostHref(uaPost) : (ruPost ? getBlogPostHref(ruPost) : null);
            const ruHref = ruPost ? getBlogPostHref(ruPost) : (uaPost ? getBlogPostHref(uaPost) : null);

            if (ukHref && ruHref && !seenIds.has(id)) {
                seenIds.add(id);
                const postDates = post as BlogWithDates;
                entries.push({
                    ukPath: ukHref,
                    ruPath: ruHref,
                    lastmod: formatDate(post.publishedAt || postDates.updatedAt),
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
        console.error("[publications.xml] Error generating publications sitemap:", error);
        return new NextResponse(buildPairedUrlSetXml([]), {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
}
