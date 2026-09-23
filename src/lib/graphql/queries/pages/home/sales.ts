import { gqlRequest } from "@/lib/graphql/client";

export interface SaleImages {
    size1x?: string | null;
    size2x?: string | null;
    size3x?: string | null;
    push?: string | null;
    notification1x?: string | null;
    notification2x?: string | null;
    notification3x?: string | null;
}

export interface SaleBannerImages {
    size1x?: string | null;
    size2x?: string | null;
    size3x?: string | null;
}

export interface WebImageVariants {
    desktop?: string | null;
    laptop?: string | null;
    tablet?: string | null;
}

export interface Sale {
    id: string;
    name: string;
    slug?: string | null;
    image?: SaleImages | null;
    banner?: SaleBannerImages | null;
    imageWeb?: WebImageVariants | null;
    bannerWeb?: WebImageVariants | null;
    expiresAt?: string | null;
    publishedAt?: string | null;
    title?: string | null;
    description?: string | null;
    keywords?: string | null;
    text?: string | null;
}

export interface SalesResponse {
    data: Sale[];
    per_page: number;
    current_page: number;
    has_more_pages: boolean;
}

export const SALES_QUERY = /* GraphQL */ `
    query Sales($limit: Int, $page: Int) {
        sales(limit: $limit, page: $page) {
            per_page
            current_page
            has_more_pages
            data {
                id
                name
                slug
                title
                description
                keywords
                text
                publishedAt
                expiresAt
                image {
                    size1x
                    size2x
                    size3x
                    push
                    notification1x
                    notification2x
                    notification3x
                }
                banner {
                    size1x
                    size2x
                    size3x
                }
                imageWeb {
                    desktop
                    laptop
                    tablet
                }
                bannerWeb {
                    desktop
                    laptop
                    tablet
                }
            }
        }
    }
`;

export async function getSalesApi(
    limit: number = 10,
    page: number = 1,
    lang?: string,
    token?: string,
    options?: { cache?: RequestCache },
): Promise<SalesResponse> {
    const data = await gqlRequest<{ sales: SalesResponse }>(
        SALES_QUERY,
        { limit, page },
        { next: { revalidate: 3600 }, lang, token, ...options },
    );
    return data.sales;
}


export const SALE_BY_ID_QUERY = /* GraphQL */ `
    query Sale($id: ID!) {
        sale(id: $id) {
            id
            name
            slug
            title
            description
            text
            expiresAt
            image {
                size1x
                size2x
                size3x
            }
            banner {
                size1x
                size2x
                size3x
            }
            imageWeb {
                desktop
                laptop
                tablet
            }
            bannerWeb {
                desktop
                laptop
                tablet
            }
        }
    }
`;

export async function getSaleApi(id: string, lang?: string): Promise<Sale | null> {
    try {
        const data = await gqlRequest<{ sale: Sale | null }>(
            SALE_BY_ID_QUERY,
            { id },
            { next: { revalidate: 3600 }, lang },
        );
        return data.sale;
    } catch (error) {
        console.error(`[Sale] Failed to fetch sale by id/slug: ${id}`, error);
        return null;
    }
}

/**
 * Resolves a sale slug to its ID by scanning the list of sales (with fallback to other language if slug is transliterated/old).
 */
export async function findSaleIdBySlug(slug: string, lang?: string): Promise<string | null> {
    try {
        const response = await getSalesApi(100, 1, lang);
        let sale = response.data.find(s => s.slug === slug);
        if (sale) return sale.id;

        // Fallback to alternate language
        const altLang = lang === 'ru' ? 'ua' : 'ru';
        const altResponse = await getSalesApi(100, 1, altLang);
        sale = altResponse.data.find(s => s.slug === slug);
        return sale ? sale.id : null;
    } catch (error) {
        console.error(`[Sale] Failed to resolve slug: ${slug}`, error);
        return null;
    }
}

/**
 * Resolves localized slugs for a sale ID across both languages (uk and ru).
 */
export async function getSaleSlugsById(id: string): Promise<{ uk: string; ru: string }> {
    try {
        const [uaRes, ruRes] = await Promise.all([
            getSalesApi(100, 1, 'ua').catch(() => null),
            getSalesApi(100, 1, 'ru').catch(() => null),
        ]);

        const uaSale = uaRes?.data.find(s => String(s.id) === String(id));
        const ruSale = ruRes?.data.find(s => String(s.id) === String(id));

        const ukSlug = uaSale?.slug || ruSale?.slug || id;
        const ruSlug = ruSale?.slug || uaSale?.slug || id;

        return { uk: ukSlug, ru: ruSlug };
    } catch (error) {
        console.error(`[Sale] Failed to fetch sale slugs for ID: ${id}`, error);
        return { uk: id, ru: id };
    }
}

