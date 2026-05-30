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
    parentId?: number | null;
    name: string;
    slug: string;
    menuIcon?: {
        icon1x: string | null;
        icon2x: string | null;
        icon3x: string | null;
    } | null;
    image?: {
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
    children?: ProductCategory[];
}

export interface ProductImageUrl {
    grid1x?: string | null;
    grid2x?: string | null;
    grid3x?: string | null;
    list1x?: string | null;
    list2x?: string | null;
    main1x?: string | null;
    main2x?: string | null;
    main3x?: string | null;
    big?: string | null;
    squarePreview1x?: string | null;
    squarePreview2x?: string | null;
}

export interface ProductImageEntry {
    url: ProductImageUrl;
    title?: string | null;
    alt?: string | null;
}

export interface Product {
    id: string;
    slug?: string;
    categoryId?: number;
    name: string;
    cost: number;
    oldCost?: number;
    unit: string;
    multiplier?: number;
    is_new?: boolean;
    available?: boolean;
    /** @deprecated Завжди null на бекенді — використовуйте images[0] */
    image?: ProductImageEntry | null;
    /** Масив зображень товару (основне джерело) */
    images?: ProductImageEntry[] | null;
    specifications?: {
        name: string;
        values: string[];
    }[];
}

/**
 * Повертає перший доступний URL зображення товару.
 * Читає з images[] (актуальне поле), з fallback на застаріле image.
 */
export function resolveProductImageUrl(product: Product): string {
    const entry = product.images?.[0] ?? product.image ?? null;
    const url =
        entry?.url?.grid2x ||
        entry?.url?.main2x ||
        entry?.url?.grid1x ||
        entry?.url?.main1x ||
        entry?.url?.big ||
        null;

    if (!url) return '';
    if (url.startsWith('/')) return `https://dev-api.myastoriya.com.ua${url}`;
    return url;
}

/**
 * Повертає URL зображення категорії.
 */
export function resolveCategoryImageUrl(category: ProductCategory): string {
    const url = 
        category.image?.square3x || 
        category.image?.square2x || 
        category.image?.square1x || 
        category.image?.big3x || 
        category.image?.big2x || 
        category.image?.big1x || 
        category.image?.rectangle3x || 
        category.image?.rectangle2x || 
        category.image?.rectangle1x || 
        category.menuIcon?.icon3x || 
        category.menuIcon?.icon2x || 
        category.menuIcon?.icon1x || 
        null;
        
    if (!url) return '';
    if (url.startsWith('/')) return `https://dev-api.myastoriya.com.ua${url}`;
    return url;
}

export interface ProductsFilter {
    categoryId?: number | null;
    saleId?: number | null;
    search?: string | null;
    limit?: number | null;
    page?: number | null;
    sort?: string | null;
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

const ADD_PRODUCT_VIEW_MUTATION = /* GraphQL */ `
    mutation AddProductView($id: ID!) {
        addProductView(id: $id)
    }
`;

const PRODUCTS_QUERY = /* GraphQL */ `
    query Products($categoryId: Int, $saleId: Int, $search: String, $limit: Int, $page: Int, $sort: String) {
        products(categoryId: $categoryId, saleId: $saleId, search: $search, limit: $limit, page: $page, sort: $sort) {
            per_page
            current_page
            has_more_pages
            data {
                id
                slug
                categoryId
                name
                cost
                oldCost
                unit
                multiplier
                is_new
                available
                specifications {
                    name
                    values
                }
                image {
                    url {
                        grid2x
                        grid1x
                        main2x
                        main1x
                        big
                    }
                }
                images {
                    url {
                        grid2x
                        grid1x
                        main2x
                        main1x
                        big
                    }
                }
            }
        }
    }
`;

const PRODUCT_BY_ID_QUERY = /* GraphQL */ `
    query Product($id: Int!) {
        product(id: $id) {
            id
            slug
            categoryId
            name
            cost
            oldCost
            unit
            multiplier
            is_new
            available
            text
            image_alt
            image_title
            hasCostVariants
            hasGift
            giftText
            rating
            specifications {
                name
                values
            }
            image {
                url {
                    grid2x
                    grid1x
                    main2x
                    main1x
                    big
                }
            }
            images {
                url {
                    grid2x
                    grid1x
                    main2x
                    main1x
                    main3x
                    big
                }
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
                images {
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

const PRODUCTS_BY_IDS_QUERY = /* GraphQL */ `
    query ProductsByIds($ids: [Int!]!) {
        productsByIds(ids: $ids) {
            id
            slug
            categoryId
            name
            cost
            oldCost
            unit
            multiplier
            is_new
            available
            specifications {
                name
                values
            }
            image {
                url {
                    grid2x
                    grid1x
                    main2x
                    main1x
                    big
                }
            }
            images {
                url {
                    grid2x
                    grid1x
                    main2x
                    main1x
                    big
                }
            }
        }
    }
`;


// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

function mapSortOption(sort?: string | null): string | null {
    if (!sort) return null;
    switch (sort) {
        case 'За популярністю':
        case 'По популярности':
            return 'default';
        case 'За зростанням ціни':
        case 'По возрастанию цены':
        case 'Від дешевих до дорогих':
        case 'От дешевых к дорогим':
            return 'cost-asc';
        case 'За зниженням ціни':
        case 'По снижению цены':
        case 'Від дорогих до дешевих':
        case 'От дорогих к дешевым':
            return 'cost-desc';
        case 'За рейтингом':
        case 'По рейтингу':
            return 'rating';
        case 'За обговорюваністю':
        case 'По обсуждаемости':
            return 'most-discussed';
        case 'За датою':
        case 'По дате':
            return 'created-at';
        default:
            return sort;
    }
}

export async function getProductsApi(filter?: ProductsFilter, lang?: string): Promise<ProductsResponse> {
    const sortedValue = mapSortOption(filter?.sort);
    const data = await gqlRequest<{ products: ProductsResponse }>(
        PRODUCTS_QUERY,
        {
            categoryId: filter?.categoryId ?? undefined,
            saleId: filter?.saleId ?? undefined,
            search: filter?.search || undefined,
            limit: filter?.limit ?? undefined,
            page: filter?.page ?? undefined,
            sort: sortedValue ?? undefined,
        },
        { next: { revalidate: 3600 }, lang },
    );
    return data.products;
}

export async function addProductViewApi(id: number | string, lang?: string, token?: string): Promise<boolean> {
    const data = await gqlRequest<{ addProductView: boolean }>(
        ADD_PRODUCT_VIEW_MUTATION,
        { id: String(id) },
        { lang, token, cache: 'no-store' }
    );
    return data.addProductView;
}

export async function getProductByIdApi(id: number | string, lang?: string): Promise<Product> {
    const data = await gqlRequest<{ product: Product }>(
        PRODUCT_BY_ID_QUERY,
        { id: parseInt(String(id)) },
        { next: { revalidate: 60 }, lang },
    );
    return data.product;
}

/**
 * Resolves a product slug to its numeric id.
 * Scans products paginated (100/page, max 2000 products) with 1-hour cache.
 * Used only when the page is not pre-generated by generateStaticParams.
 */
export async function findProductIdBySlug(
    slug: string,
    lang?: string,
): Promise<string | null> {
    const limit = 500;
    const maxPages = 5;

    // Minimal fields query — just id and slug for fast resolution
    const SLUG_SCAN_QUERY = /* GraphQL */ `
        query ProductsScan($limit: Int, $page: Int) {
            products(limit: $limit, page: $page) {
                has_more_pages
                data { id slug }
            }
        }
    `;

    for (let page = 1; page <= maxPages; page++) {
        const data = await gqlRequest<{
            products: { has_more_pages: boolean; data: Array<{ id: string; slug?: string }> };
        }>(
            SLUG_SCAN_QUERY,
            { limit, page },
            { next: { revalidate: 3600 }, lang },
        );

        const found = data.products.data.find((p) => p.slug === slug);
        if (found) return found.id;
        if (!data.products.has_more_pages) return null;
    }

    return null;
}

export async function getCategoriesApi(lang?: string): Promise<ProductCategory[]> {
    const data = await gqlRequest<{ categories: ProductCategory[] }>(
        CATEGORIES_QUERY,
        undefined,
        { next: { revalidate: 3600 }, lang },
    );
    return data.categories;
}

const CATEGORY_TREE_QUERY = /* GraphQL */ `
    query CategoriesTree($parentId: Int) {
        categories(parentId: $parentId) {
            id
            name
            slug
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
            children {
                id
                name
                slug
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
                children {
                    id
                    name
                    slug
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
        }
    }
`;

export async function getCatalogTreeApi(lang?: string, parentId: number = 768): Promise<ProductCategory[]> {
    const data = await gqlRequest<{ categories: ProductCategory[] }>(
        CATEGORY_TREE_QUERY,
        { parentId },
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

export async function getProductsByIdsApi(ids: number[], lang?: string): Promise<Product[]> {
    const data = await gqlRequest<{ productsByIds: Product[] }>(
        PRODUCTS_BY_IDS_QUERY,
        { ids },
        { next: { revalidate: 60 }, lang }
    );
    return data.productsByIds;
}


const SEARCH_POPULAR_QUERIES_QUERY = /* GraphQL */ `
    query SearchPopularQueries($search: String, $limit: Int) {
        searchPopularQueries(search: $search, limit: $limit)
    }
`;

export async function getSearchPopularQueriesApi(search?: string, limit: number = 5, lang?: string): Promise<string[]> {
    const data = await gqlRequest<{ searchPopularQueries: string[] }>(
        SEARCH_POPULAR_QUERIES_QUERY,
        { search: search ?? null, limit },
        { next: { revalidate: 3600 }, lang }
    );
    return data.searchPopularQueries;
}

const SEARCH_CATEGORIES_QUERY = /* GraphQL */ `
    query SearchCategories($search: String, $parentId: Int) {
        categories(search: $search, parentId: $parentId) {
            id
            name
            slug
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
            children {
                id
                name
                slug
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
                children {
                    id
                    name
                    slug
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
        }
    }
`;

export async function getSearchCategoriesApi(search: string, lang?: string, parentId: number = 768): Promise<ProductCategory[]> {
    const data = await gqlRequest<{ categories: ProductCategory[] }>(
        SEARCH_CATEGORIES_QUERY,
        { search, parentId },
        { next: { revalidate: 3600 }, lang }
    );
    return data.categories;
}

const SUBCATEGORIES_QUERY = /* GraphQL */ `
    query Subcategories($parentId: Int) {
        categories(parentId: $parentId) {
            id
            name
            slug
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
            children {
                id
                name
                slug
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
                children {
                    id
                    name
                    slug
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
        }
    }
`;

export async function getSubcategoriesApi(parentId: number, lang?: string): Promise<ProductCategory[]> {
    const data = await gqlRequest<{ categories: ProductCategory[] }>(
        SUBCATEGORIES_QUERY,
        { parentId },
        { next: { revalidate: 3600 }, lang }
    );
    return data.categories;
}

const CATEGORY_BY_ID_QUERY = /* GraphQL */ `
    query GetCategoryById($id: Int!) {
        category(id: $id) {
            id
            parentId
            name
            slug
        }
    }
`;

export async function getCategoryByIdApi(id: number, lang?: string): Promise<ProductCategory | null> {
    const data = await gqlRequest<{ category: ProductCategory | null }>(
        CATEGORY_BY_ID_QUERY,
        { id },
        { next: { revalidate: 3600 }, lang }
    );
    return data.category;
}


