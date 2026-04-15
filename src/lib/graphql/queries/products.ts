import { gqlRequest } from '../client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductImage {
    url: string;
    alt?: string;
}

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
}

export interface Product {
    id: string;
    categoryId?: number;
    name: string;
    cost: number;
    oldCost?: number;
    unit: string;
    multiplier?: number;
    is_new?: boolean;
    available?: boolean;
    image?: {
        url: {
            grid2x: string;
            grid1x?: string;
            main2x?: string;
            main1x?: string;
            big?: string;
        };
    } | null;
    specifications?: {
        name: string;
        values: string[];
    }[];
}

export interface ProductsFilter {
    categoryId?: number | null;
    limit?: number | null;
    page?: number | null;
}

export interface ProductsResponse {
    data: Product[];
    per_page: number;
    current_page: number;
    has_more_pages: boolean;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const PRODUCTS_QUERY = /* GraphQL */ `
    query Products($categoryId: Int, $limit: Int, $page: Int) {
        products(categoryId: $categoryId, limit: $limit, page: $page) {
            per_page
            current_page
            has_more_pages
            data {
                id
                categoryId
                name
                cost
                oldCost
                unit
                multiplier
                is_new
                available
                image {
                    url {
                        grid2x
                        grid1x
                        main2x
                        main1x
                        big
                    }
                }
                specifications {
                    name
                    values
                }
            }
        }
    }
`;

const PRODUCT_BY_SLUG_QUERY = /* GraphQL */ `
    query ProductBySlug($slug: String!) {
        productBySlug(slug: $slug) {
            id
            name
            slug
            description
            price
            oldPrice
            isNew
            isSale
            weight
            calories
            images {
                url
                alt
            }
            category {
                id
                name
                slug
            }
        }
    }
`;

const CATEGORIES_QUERY = /* GraphQL */ `
    query Categories {
        categories {
            id
            name
            slug
        }
    }
`;

const VIEWED_PRODUCTS_QUERY = /* GraphQL */ `
    query ViewedProducts($limit: Int) {
        products(viewed: true, limit: $limit) {
            data {
                id
                name
                cost
                oldCost
                unit
                multiplier
                is_new
                image {
                    url {
                        grid2x
                    }
                }
                specifications {
                    name
                    values
                }
            }
        }
    }
`;

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function getProductsApi(filter?: ProductsFilter, lang?: string): Promise<ProductsResponse> {
    const data = await gqlRequest<{ products: ProductsResponse }>(
        PRODUCTS_QUERY,
        {
            categoryId: filter?.categoryId ?? null,
            limit: filter?.limit ?? null,
            page: filter?.page ?? null
        },
        { next: { revalidate: 60 }, lang },
    );
    return data.products;
}

export async function getProductBySlugApi(slug: string, lang?: string): Promise<Product> {
    const data = await gqlRequest<{ productBySlug: Product }>(
        PRODUCT_BY_SLUG_QUERY,
        { slug },
        { next: { revalidate: 60 }, lang },
    );
    return data.productBySlug;
}

export async function getCategoriesApi(lang?: string): Promise<ProductCategory[]> {
    const data = await gqlRequest<{ categories: ProductCategory[] }>(
        CATEGORIES_QUERY,
        undefined,
        { next: { revalidate: 3600 }, lang },
    );
    return data.categories;
}

export async function getViewedProductsApi(limit: number = 10, lang?: string, token?: string): Promise<Product[]> {
    const data = await gqlRequest<{ products: { data: Product[] } }>(
        VIEWED_PRODUCTS_QUERY,
        { limit },
        { next: { revalidate: 60 }, lang, token },
    );
    return data.products.data;
}
