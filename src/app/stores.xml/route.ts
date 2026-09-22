import { NextResponse } from "next/server";
import { getSitemapBaseUrl, formatDate, buildPairedUrlSetXml, PairedSitemapEntry } from "@/utils/sitemap-helpers";
import { getShopsApi, Shop } from "@/lib/graphql/queries/shops";

export const dynamic = "force-dynamic";

interface ShopWithDates extends Shop {
    updatedAt?: string | null;
}

export async function GET(req: Request) {
    try {
        const baseUrl = await getSitemapBaseUrl(req);
        const today = formatDate();

        const [shopsResUa, shopsResRu] = await Promise.all([
            getShopsApi({ limit: 100, page: 1, onlyCompanyStores: false }, "ua").catch(() => null),
            getShopsApi({ limit: 100, page: 1, onlyCompanyStores: false }, "ru").catch(() => null),
        ]);

        const uaShopsMap = new Map<string, Shop>();
        for (const shop of shopsResUa?.shops?.data ?? []) {
            if (shop.id) uaShopsMap.set(String(shop.id), shop);
        }

        const ruShopsMap = new Map<string, Shop>();
        for (const shop of shopsResRu?.shops?.data ?? []) {
            if (shop.id) ruShopsMap.set(String(shop.id), shop);
        }

        const allIds = new Set([...uaShopsMap.keys(), ...ruShopsMap.keys()]);
        const entries: PairedSitemapEntry[] = [];
        const seenIds = new Set<string>();

        for (const id of allIds) {
            const uaShop = uaShopsMap.get(id);
            const ruShop = ruShopsMap.get(id);
            const shop = uaShop || ruShop;
            if (!shop) continue;

            const uaSlug = uaShop?.slug || uaShop?.id || ruShop?.slug || ruShop?.id;
            const ruSlug = ruShop?.slug || ruShop?.id || uaShop?.slug || uaShop?.id;

            if (uaSlug && ruSlug && !seenIds.has(id)) {
                seenIds.add(id);
                const shopDates = shop as ShopWithDates;
                entries.push({
                    ukPath: `/our-stores/${uaSlug}/`,
                    ruPath: `/our-stores/${ruSlug}/`,
                    lastmod: formatDate(shopDates.updatedAt || today),
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
        console.error("[stores.xml] Error generating stores sitemap:", error);
        return new NextResponse(buildPairedUrlSetXml([]), {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
}
