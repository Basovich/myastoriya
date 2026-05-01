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
    
    // Filter out categories that explicitly have 0 productsCount
    const potentialCategories = categories.filter(cat => (cat.productsCount ?? 0) > 0);
    
    // Verify each category actually returns products when queried
    // This handles discrepancies where productsCount > 0 but the product list is empty (e.g. all items unavailable)
    const verifiedCategories = await Promise.all(
        potentialCategories.map(async (cat) => {
            try {
                const productsResponse = await getProductsApi({ 
                    categoryId: parseInt(cat.id), 
                    limit: 1 
                }, lang);
                return productsResponse.data.length > 0 ? cat : null;
            } catch (error) {
                console.error(`Failed to verify products for category ${cat.id}:`, error);
                return null;
            }
        })
    );
    
    return verifiedCategories.filter((cat): cat is PopularCategory => cat !== null);
}
