import { NextResponse } from "next/server";
import { getSitemapBaseUrl, formatDate, buildPairedUrlSetXml, PairedSitemapEntry } from "@/utils/sitemap-helpers";
import { getSpecialsApi, Special } from "@/lib/graphql";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const baseUrl = await getSitemapBaseUrl(req);
        const entries: PairedSitemapEntry[] = [];
        const seenIds = new Set<string>();

        // Fetch Complex Discounts / Specials for both languages
        const [specialsResUa, specialsResRu] = await Promise.all([
            getSpecialsApi(100, 1, "ua").catch(() => null),
            getSpecialsApi(100, 1, "ru").catch(() => null),
        ]);

        const ruSpecialsMap = new Map<string, Special>();
        for (const special of specialsResRu?.data ?? []) {
            ruSpecialsMap.set(String(special.id), special);
        }

        const uaSpecialsMap = new Map<string, Special>();
        for (const special of specialsResUa?.data ?? []) {
            uaSpecialsMap.set(String(special.id), special);
        }

        const allSpecialIds = new Set([...uaSpecialsMap.keys(), ...ruSpecialsMap.keys()]);

        for (const id of allSpecialIds) {
            const uaSpecial = uaSpecialsMap.get(id);
            const ruSpecial = ruSpecialsMap.get(id);
            const special = uaSpecial || ruSpecial;
            if (!special) continue;

            // Filter active specials (must have >= 2 products and all available)
            const products = special.products || [];
            if (products.length < 2 || !products.every((p) => Boolean(p.available))) {
                continue;
            }

            const uaSlug = uaSpecial?.slug || uaSpecial?.id || ruSpecial?.slug || ruSpecial?.id;
            const ruSlug = ruSpecial?.slug || ruSpecial?.id || uaSpecial?.slug || uaSpecial?.id;

            if (uaSlug && ruSlug && !seenIds.has(`special-${id}`)) {
                seenIds.add(`special-${id}`);
                entries.push({
                    ukPath: `/complex-discounts/${uaSlug}/`,
                    ruPath: `/complex-discounts/${ruSlug}/`,
                    lastmod: formatDate(special.expiresAt),
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
        console.error("[complex-discounts.xml] Error generating complex discounts sitemap:", error);
        return new NextResponse(buildPairedUrlSetXml([]), {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
}
