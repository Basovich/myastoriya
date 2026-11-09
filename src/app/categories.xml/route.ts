import { NextResponse } from "next/server";
import { getSitemapBaseUrl, formatDate, buildPairedUrlSetXml, PairedSitemapEntry } from "@/utils/sitemap-helpers";
import { getCatalogTreeApi, getProductsFilterApi, ProductCategory } from "@/lib/graphql";
import type { FilterBlock } from "@/lib/graphql";
import { SEO_CATEGORY_CONFIGS } from "@/config/seo-filters";

export const dynamic = "force-dynamic";

interface CategoryWithDates extends ProductCategory {
    updatedAt?: string | null;
}

function collectCategories(categories: ProductCategory[]): Map<string, ProductCategory> {
    const map = new Map<string, ProductCategory>();
    const traverse = (item: ProductCategory) => {
        if (item.id && item.slug) {
            map.set(String(item.id), item);
        }
        for (const child of item.children ?? []) {
            traverse(child);
        }
    };
    for (const cat of categories) {
        traverse(cat);
    }
    return map;
}

/**
 * Індексовані SEO-сторінки фільтрів (категорія + один SEO-фільтр з одним значенням).
 * Сторінки з комбінаціями, кількома значеннями, не-SEO фільтрами та пагінацією noindex і сюди не потрапляють.
 */
async function collectSeoFilterEntries(
    uaMap: Map<string, ProductCategory>,
    ruMap: Map<string, ProductCategory>,
): Promise<PairedSitemapEntry[]> {
    const entries: PairedSitemapEntry[] = [];
    const seen = new Set<string>();

    for (const [id, uaCat] of uaMap) {
        const config = SEO_CATEGORY_CONFIGS[uaCat.slug];
        if (!config || uaCat.productsCount === 0) continue;
        const ruCat = ruMap.get(id);
        const ruSlug = ruCat?.slug || uaCat.slug;

        const [uaData, ruData] = await Promise.all([
            getProductsFilterApi(Number(id), "ua"),
            getProductsFilterApi(Number(id), "ru"),
        ]);
        const ruBlocksByKey = new Map<string, FilterBlock>();
        ruData.blocks.forEach(b => b.key && ruBlocksByKey.set(b.key, b));

        for (const block of uaData.blocks) {
            if (!block.slug || !block.key || !config.allowedFilterSlugs.includes(block.slug)) continue;
            const ruBlock = ruBlocksByKey.get(block.key);

            for (const option of block.values ?? []) {
                if (!option.slug || !option.key || option.disabled) continue;
                const ruOption = ruBlock?.values?.find(v => v.key === option.key);
                const ukPath = `/category/${uaCat.slug}/${block.slug}=${option.slug}/`;
                const ruPath = `/category/${ruSlug}/${ruBlock?.slug || block.slug}=${ruOption?.slug || option.slug}/`;
                if (seen.has(ukPath)) continue;
                seen.add(ukPath);
                entries.push({ ukPath, ruPath, lastmod: null });
            }
        }
    }

    return entries;
}

export async function GET(req: Request) {
    try {
        const baseUrl = await getSitemapBaseUrl(req);
        const [treeUa, treeRu] = await Promise.all([
            getCatalogTreeApi("ua", 768).catch(() => [] as ProductCategory[]),
            getCatalogTreeApi("ru", 768).catch(() => [] as ProductCategory[]),
        ]);

        const uaMap = collectCategories(treeUa);
        const ruMap = collectCategories(treeRu);
        const allIds = new Set([...uaMap.keys(), ...ruMap.keys()]);

        const entries: PairedSitemapEntry[] = [];
        const seenIds = new Set<string>();
        for (const id of allIds) {
            const uaCat = uaMap.get(id);
            const ruCat = ruMap.get(id);
            const cat = uaCat || ruCat;
            if (!cat) continue;

            const isUaEmpty = uaCat ? (uaCat.productsCount === 0 && (!uaCat.children || uaCat.children.length === 0)) : true;
            const isRuEmpty = ruCat ? (ruCat.productsCount === 0 && (!ruCat.children || ruCat.children.length === 0)) : true;
            if (isUaEmpty && isRuEmpty) {
                continue;
            }

            const uaSlug = uaCat?.slug || ruCat?.slug;
            const ruSlug = ruCat?.slug || uaCat?.slug;

            if (uaSlug && ruSlug && !seenIds.has(id)) {
                seenIds.add(id);
                const categoryDates = cat as CategoryWithDates;
                entries.push({
                    ukPath: `/category/${uaSlug}/`,
                    ruPath: `/category/${ruSlug}/`,
                    lastmod: formatDate(categoryDates.updatedAt),
                });
            }
        }

        const seoFilterEntries = await collectSeoFilterEntries(uaMap, ruMap).catch(error => {
            console.error("[categories.xml] Failed to collect SEO filter pages:", error);
            return [] as PairedSitemapEntry[];
        });

        const xml = buildPairedUrlSetXml([...entries, ...seoFilterEntries], baseUrl);

        return new NextResponse(xml, {
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=600, s-maxage=3600",
            },
        });
    } catch (error) {
        console.error("[categories.xml] Error generating categories sitemap:", error);
        return new NextResponse(buildPairedUrlSetXml([]), {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
    }
}
