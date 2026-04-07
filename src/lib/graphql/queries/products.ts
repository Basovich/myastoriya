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
    name: string;
    slug: string;
    description?: string;
    price: number;
    oldPrice?: number;
    images: ProductImage[];
    category?: ProductCategory;
    isNew?: boolean;
    isSale?: boolean;
    weight?: string;
    calories?: number;
}

export interface ProductsFilter {
    categoryId?: string;
    search?: string;
    page?: number;
    perPage?: number;
}

export interface ProductsResponse {
    items: Product[];
    total: number;
    page: number;
    perPage: number;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const PRODUCTS_QUERY = /* GraphQL */ `
    query Products($filter: ProductsFilter) {
        products(filter: $filter) {
            items {
                id
                name
                slug
                price
                oldPrice
                isNew
                isSale
                weight
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
            total
            page
            perPage
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

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function getProductsApi(filter?: ProductsFilter): Promise<ProductsResponse> {
    const data = await gqlRequest<{ products: ProductsResponse }>(
        PRODUCTS_QUERY,
        filter ? { filter } : undefined,
        { next: { revalidate: 60 } },
    );
    return data.products;
}

export async function getProductBySlugApi(slug: string): Promise<Product> {
    const data = await gqlRequest<{ productBySlug: Product }>(
        PRODUCT_BY_SLUG_QUERY,
        { slug },
        { next: { revalidate: 60 } },
    );
    return data.productBySlug;
}

export async function getCategoriesApi(): Promise<ProductCategory[]> {
    const data = await gqlRequest<{ categories: ProductCategory[] }>(
        CATEGORIES_QUERY,
        undefined,
        { next: { revalidate: 3600 } },
    );
    return data.categories;
}
