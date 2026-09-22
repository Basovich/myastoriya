import { NextResponse } from "next/server";
import { getSitemapBaseUrl, formatDate, buildPairedUrlSetXml, PairedSitemapEntry } from "@/utils/sitemap-helpers";
import { getProductsApi, Product } from "@/lib/graphql";

export const dynamic = "force-dynamic";

interface ProductWithDates extends Product {
    updatedAt?: string | null;
    createdAt?: string | null;
}

export async function GET(req: Request) {
    try {
        const baseUrl = await getSitemapBaseUrl(req);
        const maxPages = 50; // Fetch up to 5000 products

        // Fetch UA products
        const uaProductsMap = new Map<string, Product>();
        let pageUa = 1;
        let hasMoreUa = true;

        while (hasMoreUa && pageUa <= maxPages) {
            const res = await getProductsApi({ limit: 100, page: pageUa }, "ua", undefined).catch(() => null);
            if (!res || !res.data || res.data.length === 0) {
                break;
            }
            for (const prod of res.data) {
                if (prod.available !== 3 && prod.available !== 0) {
                    uaProductsMap.set(String(prod.id), prod);
                }
            }
            hasMoreUa = res.has_more_pages;
            pageUa++;
        }

        // Fetch RU products
        const ruProductsMap = new Map<string, Product>();
        let pageRu = 1;
        let hasMoreRu = true;

        while (hasMoreRu && pageRu <= maxPages) {
            const res = await getProductsApi({ limit: 100, page: pageRu }, "ru", undefined).catch(() => null);
            if (!res || !res.data || res.data.length === 0) {
                break;
            }
            for (const prod of res.data) {
                if (prod.available !== 3 && prod.available !== 0) {
                    ruProductsMap.set(String(prod.id), prod);
                }
            }
            hasMoreRu = res.has_more_pages;
            pageRu++;
        }

        const allProductIds = new Set([...uaProductsMap.keys(), ...ruProductsMap.keys()]);
        const entries: PairedSitemapEntry[] = [];
        const seenIds = new Set<string>();

        for (const id of allProductIds) {
            const uaProd = uaProductsMap.get(id);
            const ruProd = ruProductsMap.get(id);
            const prod = uaProd || ruProd;
            if (!prod) continue;

            const uaSlug = uaProd?.slug || uaProd?.id || ruProd?.slug || ruProd?.id;
            const ruSlug = ruProd?.slug || ruProd?.id || uaProd?.slug || uaProd?.id;

            if (uaSlug && ruSlug && !seenIds.has(id)) {
                seenIds.add(id);
                const prodDates = prod as ProductWithDates;
                entries.push({
                    ukPath: `/product/${uaSlug}/`,
                    ruPath: `/product/${ruSlug}/`,
                    lastmod: formatDate(prodDates.updatedAt || prodDates.createdAt || null),
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
        console.error("[products.xml] Error generating products sitemap:", error);
        return new NextResponse(buildPairedUrlSetXml([]), {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
}
