import { gqlRequest } from "../../../client";

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
 * Resolves a sale slug to its ID by scanning the list of sales.
 */
export async function findSaleIdBySlug(slug: string, lang?: string): Promise<string | null> {
    try {
        // Fetch a large number of sales to find the matching slug
        const response = await getSalesApi(100, 1, lang);
        const sale = response.data.find(s => s.slug === slug);
        return sale ? sale.id : null;
    } catch (error) {
        console.error(`[Sale] Failed to resolve slug: ${slug}`, error);
        return null;
    }
}
