import { gqlRequest } from "../../../client";

export interface PopularCategory {
    id: string;
    name: string;
    slug?: string | null;
    menuIcon?: {
        icon1x: string | null;
        icon2x: string | null;
        icon3x: string | null;
    } | null;
    image: {
        square1x: string | null;
        square2x: string | null;
        square3x: string | null;
        rectangle1x: string | null;
        rectangle2x: string | null;
        rectangle3x: string | null;
        big1x: string | null;
        big2x: string | null;
        big3x: string | null;
    } | null;
    thumbnail?: {
        thumb1x: string | null;
        thumb2x: string | null;
        thumb3x: string | null;
    } | null;
    appMini?: {
        mini1x: string | null;
        mini2x: string | null;
        mini3x: string | null;
    } | null;
    banner?: {
        size1x?: string | null;
    } | null;
    productsCount?: number;
}

const POPULAR_CATEGORIES_QUERY = /* GraphQL */ `
    query PopularCategories {
        popularCategories {
            id
            name
            slug
            productsCount
            menuIcon {
                icon1x
                icon2x
                icon3x
            }
            image {
                square1x
                square2x
                square3x
                rectangle1x
                rectangle2x
                rectangle3x
                big1x
                big2x
                big3x
            }
            thumbnail {
                thumb1x
                thumb2x
                thumb3x
            }
            appMini {
                mini1x
                mini2x
                mini3x
            }
            banner {
                size1x
            }
        }
    }
`;

import { getProductsApi } from "@/lib/graphql/queries/products";

export async function getPopularCategoriesApi(lang?: string): Promise<PopularCategory[]> {
    const data = await gqlRequest<{ popularCategories: PopularCategory[] }>(
        POPULAR_CATEGORIES_QUERY,
        undefined,
        { next: { revalidate: 3600 }, lang },
    );
    const categories = data.popularCategories ?? [];
    
    // Filter out categories that explicitly have 0 productsCount as per backend instruction
    // If the backend says 0, we don't show it.
    return categories.filter(cat => (cat.productsCount ?? 0) > 0);
}
