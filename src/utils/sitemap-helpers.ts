import { siteData } from "@/config/site";

export function getSitemapBaseUrl(): string {
    const fallbackUrl = process.env.NEXT_PUBLIC_SITE_URL
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : siteData.url);
    return fallbackUrl.replace(/\/+$/, "");
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

    return `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps}\n</sitemapindex>`;
}

export interface SitemapUrlEntry {
    /** Relative path after domain (e.g. '/product/tryufelniy-steyk-dry-aged/' or '/') */
    relativePath: string;
    /** Date formatted as YYYY-MM-DD */
    lastmod: string;
}

export function buildUrlSetXml(entries: SitemapUrlEntry[]): string {
    const baseUrl = getSitemapBaseUrl();

    const urls = entries
        .flatMap((entry) => {
            const cleanRel = entry.relativePath
                .replace(/^\/(?:ua|ru)(?=\/|$)/, "")
                .replace(/^\/+/, "")
                .replace(/\/+$/, "");

            let ukUrl: string;
            let ruUrl: string;

            if (!cleanRel) {
                ukUrl = `${baseUrl}/`;
                ruUrl = `${baseUrl}/ru/`;
            } else {
                ukUrl = `${baseUrl}/ua/${cleanRel}/`;
                ruUrl = `${baseUrl}/ru/${cleanRel}/`;
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
