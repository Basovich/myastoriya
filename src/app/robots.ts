import type { MetadataRoute } from "next";
import { getSitemapBaseUrl } from "@/utils/sitemap-helpers";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getSitemapBaseUrl();
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/api/", "/checkout/", "/personal/"],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
