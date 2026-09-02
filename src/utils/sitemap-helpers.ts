import { headers } from "next/headers";
import { siteData } from "@/config/site";

export async function getSitemapBaseUrl(req?: Request): Promise<string> {
    // 1. Explicit env variable override (if configured)
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
    }

    // 2. Dynamic detection from incoming HTTP request headers
    try {
        let host: string | null = null;
        let proto = "https";

        if (req) {
            host = req.headers.get("x-forwarded-host") || req.headers.get("host");
            proto = req.headers.get("x-forwarded-proto") || "https";
        } else {
            const h = await headers();
            host = h.get("x-forwarded-host") || h.get("host");
            proto = h.get("x-forwarded-proto") || "https";
        }

        if (host) {
            if (host.includes("localhost") || host.includes("127.0.0.1")) {
                proto = "http";
            }
            return `${proto}://${host}`.replace(/\/+$/, "");
        }
    } catch {
        // Fallback if headers context unavailable
    }

    // 3. Fallback to production domain from env or site config
    const fallback = process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : siteData.url || "https://myastoriya.vercel.app";

    return fallback.replace(/\/+$/, "");
}

export function formatDate(dateInput?: string | Date | null): string {
    if (!dateInput) return new Date().toISOString().split("T")[0];
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return new Date().toISOString().split("T")[0];
    return date.toISOString().split("T")[0];
}

export function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export interface SitemapIndexItem {
    loc: string;
    lastmod: string;
}

export function buildSitemapIndexXml(items: SitemapIndexItem[]): string {
    const sitemaps = items
        .map(
            (item) => `  <sitemap>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${item.lastmod}</lastmod>
  </sitemap>`
        )
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps}\n</sitemapindex>`;
}

export interface SitemapUrlEntry {
    /** Relative path after domain (e.g. '/product/tryufelniy-steyk-dry-aged/' or '/') */
    relativePath: string;
    /** Date formatted as YYYY-MM-DD */
    lastmod: string;
}

export function buildUrlSetXml(entries: SitemapUrlEntry[], baseUrl?: string): string {
    const domain = (baseUrl || "https://myastoriya.vercel.app").replace(/\/+$/, "");

    const urls = entries
        .flatMap((entry) => {
            const cleanRel = entry.relativePath
                .replace(/^\/(?:ua|ru)(?=\/|$)/, "")
                .replace(/^\/+/, "")
                .replace(/\/+$/, "");

            let ukUrl: string;
            let ruUrl: string;

            if (!cleanRel) {
                ukUrl = `${domain}/`;
                ruUrl = `${domain}/ru/`;
            } else {
                ukUrl = `${domain}/ua/${cleanRel}/`;
                ruUrl = `${domain}/ru/${cleanRel}/`;
            }

            const ukNode = `  <url>
    <loc>${escapeXml(ukUrl)}</loc>
    <xhtml:link rel="alternate" hreflang="uk" href="${escapeXml(ukUrl)}" />
    <xhtml:link rel="alternate" hreflang="ru" href="${escapeXml(ruUrl)}" />
    <lastmod>${entry.lastmod}</lastmod>
  </url>`;

            const ruNode = `  <url>
    <loc>${escapeXml(ruUrl)}</loc>
    <xhtml:link rel="alternate" hreflang="uk" href="${escapeXml(ukUrl)}" />
    <xhtml:link rel="alternate" hreflang="ru" href="${escapeXml(ruUrl)}" />
    <lastmod>${entry.lastmod}</lastmod>
  </url>`;

            return [ukNode, ruNode];
        })
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>`;
}
