import { gqlRequest } from "@/lib/graphql/client";

export interface SpecialImage {
    size1x: string | null;
    size2x: string | null;
    size3x: string | null;
    original?: string | null;
}

export interface SpecialProduct {
    id: string;
    categoryId?: string | number | null;
    name: string;
    slug: string;
    cost: number;
    oldCost: number | null;
    purchaseCost?: number | null;
    purchaseOldCost?: number | null;
    unit: string | null;
    multiplier?: number | null;
    specifications?: {
        name: string;
        values: string[];
    }[] | null;
    available: boolean;
    portionSize?: string | null;
    hasCostVariants?: boolean;
    image?: {
        url: {
            grid1x: string | null;
            grid2x: string | null;
        };
    } | null;
    images?: {
        url: {
            grid1x: string | null;
            grid2x: string | null;
        };
    }[] | null;
}

export interface Special {
    id: string;
    slug: string | null;
    title: string;
    description: string | null;
    oldCost: number | null;
    cost: number | null;
    unit: string | null;
    amount: number | null;
    discountType: string | null;
    productsCount: number;
    publishedAt: string | null;
    expiresAt: string | null;
    image: SpecialImage | null;
    banner: SpecialImage | null;
    products: SpecialProduct[];
}

export interface SpecialsResponse {
    specials: {
        per_page: number;
        current_page: number;
        from: number | null;
        to: number | null;
        has_more_pages: boolean;
        data: Special[];
    };
}

const SPECIALS_QUERY = /* GraphQL */ `
    query Specials($limit: Int, $page: Int) {
        specials(limit: $limit, page: $page) {
            per_page
            current_page
            from
            to
            has_more_pages
            data {
                id
                slug
                title
                description
                oldCost
                cost
                unit
                amount
                discountType
                productsCount
                publishedAt
                expiresAt
                image {
                    size1x
                    size2x
                    size3x
                    original
                }
                banner {
                    size1x
                    size2x
                    size3x
                    original
                }
                products {
                    id
                    categoryId
                    name
                    slug
                    cost
                    oldCost
                    purchaseCost
                    purchaseOldCost
                    unit
                    multiplier
                    specifications {
                        name
                        values
                    }
                    available
                    portionSize
                    hasCostVariants
                    image {
                        url {
                            grid1x
                            grid2x
                        }
                    }
                    images {
                        url {
                            grid1x
                            grid2x
                        }
                    }
                }
            }
        }
    }
`;

export const SPECIAL_BY_ID_QUERY = /* GraphQL */ `
    query Special($id: Int!) {
        special(id: $id) {
            id
            slug
            title
            description
            oldCost
            cost
            unit
            amount
            discountType
            productsCount
            publishedAt
            expiresAt
            image {
                size1x
                size2x
                size3x
                original
            }
            banner {
                size1x
                size2x
                size3x
                original
            }
            products {
                id
                categoryId
                name
                slug
                cost
                oldCost
                purchaseCost
                purchaseOldCost
                unit
                multiplier
                specifications {
                    name
                    values
                }
                available
                portionSize
                hasCostVariants
                image {
                    url {
                        grid1x
                        grid2x
                    }
                }
                images {
                    url {
                        grid1x
                        grid2x
                    }
                }
            }
        }
    }
`;

export async function getSpecialsApi(limit = 10, page = 1, lang?: string, token?: string): Promise<SpecialsResponse['specials']> {
    const data = await gqlRequest<SpecialsResponse>(
        SPECIALS_QUERY,
        { limit, page },
        token 
            ? { cache: 'no-store', lang, token }
            : { next: { revalidate: 3600 }, lang }
    );
    return data.specials;
}

export async function getSpecialApi(id: string | number, lang?: string, token?: string): Promise<Special | null> {
    try {
        const data = await gqlRequest<{ special: Special | null }>(
            SPECIAL_BY_ID_QUERY,
            { id: parseInt(String(id)) },
            token
                ? { cache: 'no-store', lang, token, silent: true }
                : { next: { revalidate: 3600 }, lang, silent: true }
        );
        return data.special;
    } catch (error) {
        console.warn(`[Special] Failed to fetch special by id: ${id}`, error);
        return null;
    }
}

/**
 * Resolves a special slug to its ID by scanning the list of specials.
 */
export async function findSpecialIdBySlug(slug: string, lang?: string, token?: string): Promise<string | null> {
    try {
        // Fetch a large number of specials to find the matching slug
        const response = await getSpecialsApi(100, 1, lang, token);
        const special = response.data.find(s => s.slug === slug);
        return special ? special.id : null;
    } catch (error) {
        console.warn(`[Special] Failed to resolve slug: ${slug}`, error);
        return null;
    }
}
