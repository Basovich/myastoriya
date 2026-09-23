import { NextResponse } from "next/server";
import { getSitemapBaseUrl, formatDate, buildPairedUrlSetXml, PairedSitemapEntry } from "@/utils/sitemap-helpers";
import { getSalesApi, getProductsApi, Sale } from "@/lib/graphql";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const baseUrl = await getSitemapBaseUrl(req);
        const entries: PairedSitemapEntry[] = [];
        const seenIds = new Set<string>();

        // Fetch Promotions / Sales for both languages
        const [salesResUa, salesResRu] = await Promise.all([
            getSalesApi(100, 1, "ua").catch(() => null),
            getSalesApi(100, 1, "ru").catch(() => null),
        ]);

        const ruSalesMap = new Map<string, Sale>();
        for (const sale of salesResRu?.data ?? []) {
            ruSalesMap.set(String(sale.id), sale);
        }

        const uaSalesMap = new Map<string, Sale>();
        for (const sale of salesResUa?.data ?? []) {
            uaSalesMap.set(String(sale.id), sale);
        }

        // Combine all unique sale IDs
        const allSaleIds = new Set([...uaSalesMap.keys(), ...ruSalesMap.keys()]);

        for (const id of allSaleIds) {
            const uaSale = uaSalesMap.get(id);
            const ruSale = ruSalesMap.get(id);
            const sale = uaSale || ruSale;
            if (!sale) continue;

            // Check if sale has active products
            try {
                const products = await getProductsApi(
                    { saleId: parseInt(id, 10), limit: 1, silent: true },
                    "ua",
                    undefined
                );
                if (!products.data || products.data.length === 0) {
                    continue; // Skip sales without active products
                }
            } catch {
                continue;
            }

            const uaSlug = uaSale?.slug || uaSale?.id || ruSale?.slug || ruSale?.id;
            const ruSlug = ruSale?.slug || ruSale?.id || uaSale?.slug || uaSale?.id;

            if (uaSlug && ruSlug && !seenIds.has(`sale-${id}`)) {
                seenIds.add(`sale-${id}`);
                entries.push({
                    ukPath: `/actions/${uaSlug}/`,
                    ruPath: `/actions/${ruSlug}/`,
                    lastmod: formatDate(sale.expiresAt),
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
        console.error("[actions.xml] Error generating actions sitemap:", error);
        return new NextResponse(buildPairedUrlSetXml([]), {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
}
