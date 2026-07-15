import { gqlRequest } from '../client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductImage {
    url: string;
    alt?: string;
}

export interface FaqQuestion {
    id: string;
    question: string;
    answer: string;
}

export interface FaqGroup {
    id: string;
    name: string;
}

export interface CategoryThumbnails {
    thumb1x: string | null;
    thumb2x: string | null;
    thumb3x: string | null;
}

export interface CategoryAppMini {
    mini1x: string | null;
    mini2x: string | null;
    mini3x: string | null;
}

export interface CategoryBanner {
    size1x?: string | null;
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
    recommendedProducts?: Product[];
    banner?: CategoryBanner | null;
    thumbnail?: CategoryThumbnails | null;
    appMini?: CategoryAppMini | null;
    faqGroups?: FaqGroup[] | null;
    bundles?: ProductBundle[] | null;
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

export interface MeatType {
    image?: {
        size1x?: string | null;
        size2x?: string | null;
        size3x?: string | null;
    } | null;
}

export interface ProductCostVariant {
    id: string;
    name?: string | null;
    cost?: number | null;
    oldCost?: number | null;
    purchaseCost: number;
    purchaseOldCost?: number | null;
    isDefault?: boolean | null;
    image?: {
        size1x?: string | null;
        size2x?: string | null;
        size3x?: string | null;
    } | null;
}

export interface ProductBundleItem {
    id: string;
    product: Product;
}

export interface ProductBundle {
    id: string;
    discountType?: string | null;
    discountAmount?: number | null;
    items?: ProductBundleItem[] | null;
}

export interface ModifierImages {
    icon1x?: string | null;
    icon2x?: string | null;
    icon3x?: string | null;
}

export interface Modifier {
    id: string;
    name: string;
    price: number;
    image?: ModifierImages | null;
}

export interface ModifierGroup {
    id: string;
    name: string;
    modifiers: Modifier[];
}

export interface Product {
    id: string;
    slug?: string;
    categoryId?: number;
    siteId?: number | null;
    productType?: string | null;
    name: string;
    cost: number;
    oldCost?: number | null;
    purchaseCost?: number;
    purchaseOldCost?: number | null;
    unit: string;
    multiplier?: number;
    is_new?: boolean | null;
    pre_order?: boolean | null;
    /** 1 = В наявності, 2 = Немає в наявності, 3 = Знято з виробництва */
    available?: number | null;
    availabilityTracked?: boolean | null;
    text?: string | null;
    image_alt?: string | null;
    image_title?: string | null;
    hasCostVariants?: boolean;
    hasGift?: boolean | null;
    gift?: Product | null;
    giftText?: string | null;
    video?: string | null;
    inLikes?: boolean;
    rating?: number | null;
    favoritesPayload?: string;
    meatType?: MeatType | null;
    /** @deprecated Завжди null на бекенді — використовуйте images[0] */
    image?: ProductImageEntry | null;
    /** Масив зображень товару (основне джерело) */
    images?: ProductImageEntry[] | null;
    specifications?: {
        name: string;
        values: string[];
    }[];
    portionSize?: string | null;
    isWeighty?: boolean | null;
    /** Набори товарів — джерело блоку «З цим товаром купують» */
    bundles?: ProductBundle[] | null;
    /** Групи модифікаторів товару */
    modifierGroups?: ModifierGroup[] | null;
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

    if (!url) return '/images/product-placeholder.svg';
    if (url.startsWith('/images/')) return url;
    if (url.startsWith('/')) return `https://dev-api.myastoriya.com.ua${url}`;
    return url;
}

export function getProductBadge(product: { is_new?: boolean | null; cost: number; oldCost?: number | null }, lang?: string): string | null {
    if (product.is_new) return 'NEW';
    if (product.oldCost && product.oldCost > product.cost) {
        return lang === 'ru' ? 'АКЦИЯ' : 'АКЦІЯ';
    }
    return null;
}


/**
 * Повертає URL зображення категорії.
 */
export function resolveCategoryImageUrl(category: ProductCategory): string {
    const url = 
        category.image?.square3x || 
        category.image?.square2x || 
        category.image?.square1x || 
        category.thumbnail?.thumb3x ||
        category.thumbnail?.thumb2x ||
        category.thumbnail?.thumb1x ||
        category.image?.big3x || 
        category.image?.big2x || 
        category.image?.big1x || 
        category.image?.rectangle3x || 
        category.image?.rectangle2x || 
        category.image?.rectangle1x || 
        category.menuIcon?.icon3x || 
        category.menuIcon?.icon2x || 
        category.menuIcon?.icon1x || 
        category.appMini?.mini3x ||
        category.appMini?.mini2x ||
        category.appMini?.mini1x ||
        category.banner?.size1x ||
        null;
        
    if (!url) return '';
    if (url.startsWith('/')) return `https://dev-api.myastoriya.com.ua${url}`;
    return url;
}

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

export interface FilterOption {
    key: string | null;
    label: string | null;
    selected: boolean | null;
    disabled: boolean | null;
}

export interface FilterBlock {
    /** "range" для цінового слайдера, "list" або інший для checkbox/pill */
    type: string;
    label: string | null;
    key: string | null;
    values: FilterOption[] | null;
    min: number | null;
    max: number | null;
    minValue: number | null;
    maxValue: number | null;
}

export interface ProductsFilterResponse {
    blocks: FilterBlock[];
    productsCount: number;
}

/** Вхідний тип для передачі у products(filter: [FilterState]) */
export interface FilterStateInput {
    key: string;
    values?: string[] | null;
    minValue?: number | null;
    maxValue?: number | null;
}

// ---------------------------------------------------------------------------

export interface ProductsFilter {
    categoryId?: number | null;
    showcaseId?: number | null;
    saleId?: number | null;
    search?: string | null;
    limit?: number | null;
    page?: number | null;
    sort?: string | null;
    filter?: FilterStateInput[] | null;
    /** Suppress console error logging for expected failures */
    silent?: boolean;
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
    query Products($categoryId: Int, $showcaseId: Int, $saleId: Int, $search: String, $filter: [FilterState], $limit: Int, $page: Int, $sort: String) {
        products(categoryId: $categoryId, showcaseId: $showcaseId, saleId: $saleId, search: $search, filter: $filter, limit: $limit, page: $page, sort: $sort) {
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
                portionSize
                isWeighty
                hasCostVariants
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
            siteId
            productType
            name
            cost
            oldCost
            purchaseCost
            purchaseOldCost
            unit
            multiplier
            is_new
            pre_order
            available
            portionSize
            isWeighty
            availabilityTracked
            text
            image_alt
            image_title
            hasCostVariants
            hasGift
            giftText
            video
            inLikes
            rating
            favoritesPayload
            meatType {
                image {
                    size1x
                    size2x
                    size3x
                }
            }
            gift {
                id
                name
                cost
                images {
                    url {
                        grid2x
                        grid1x
                    }
                }
            }
            bundles {
                id
                discountType
                discountAmount
                items {
                    id
                    product {
                        id
                        slug
                        name
                        cost
                        oldCost
                        unit
                        multiplier
                        is_new
                        available
                        hasCostVariants
                        specifications {
                            name
                            values
                        }
                        images {
                            url {
                                grid2x
                                grid1x
                            }
                        }
                    }
                }
            }
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
            modifierGroups {
                id
                name
                modifiers {
                    id
                    name
                    price
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
                title
                alt
            }
        }
    }
`;

const PRODUCT_COST_VARIANTS_QUERY = /* GraphQL */ `
    query ProductCostVariants($productId: ID!) {
        productCostVariants(productId: $productId) {
            id
            name
            cost
            oldCost
            purchaseCost
            purchaseOldCost
            isDefault
            image {
                size1x
                size2x
                size3x
            }
        }
    }
`;

const POPULAR_PRODUCTS_QUERY = /* GraphQL */ `
    query PopularProducts($productId: Int, $limit: Int) {
        popularProducts(productId: $productId, limit: $limit) {
            data {
                id
                slug
                name
                cost
                oldCost
                unit
                multiplier
                is_new
                available
                portionSize
                hasCostVariants
                specifications {
                    name
                    values
                }
                images {
                    url {
                        grid2x
                        grid1x
                    }
                }
            }
        }
    }
`;

const SPECIALS_BY_PRODUCT_QUERY = /* GraphQL */ `
    query SpecialsByProduct($productId: Int, $limit: Int) {
        specials(productId: $productId, limit: $limit) {
            data {
                id
                products {
                    id
                    slug
                    name
                    cost
                    oldCost
                    unit
                    multiplier
                    is_new
                    available
                    portionSize
                    specifications {
                        name
                        values
                    }
                    images {
                        url {
                            grid2x
                            grid1x
                        }
                    }
                }
            }
        }
    }
`;

const BOUGHT_TOGETHER_PRODUCTS_QUERY = /* GraphQL */ `
    query BoughtTogetherProducts($categoryId: Int!, $productId: Int!, $limit: Int) {
        boughtTogetherProducts(categoryId: $categoryId, productId: $productId, limit: $limit) {
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
            portionSize
            hasCostVariants
            specifications {
                name
                values
            }
            images {
                url {
                    grid2x
                    grid1x
                }
            }
        }
    }
`;

const ADD_TO_AVAILABILITY_TRACKER_MUTATION = /* GraphQL */ `
    mutation AddProductToAvailabilityTracker($productId: Int!) {
        addProductToAvailabilityTracker(productId: $productId)
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
                portionSize
                hasCostVariants
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
            purchaseCost
            purchaseOldCost
            unit
            multiplier
            is_new
            available
            portionSize
            isWeighty
            hasCostVariants
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
            modifierGroups {
                id
                name
                modifiers {
                    id
                    name
                    price
                    image {
                        icon1x
                        icon2x
                        icon3x
                    }
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

const PRODUCTS_FILTER_QUERY = /* GraphQL */ `
    mutation ProductsFilter($categoryId: Int, $state: [FilterState]) {
        productsFilter(categoryId: $categoryId, state: $state) {
            productsCount
            blocks {
                type
                label
                key
                min
                max
                minValue
                maxValue
                values {
                    key
                    label
                    selected
                    disabled
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

export async function getProductsApi(filter?: ProductsFilter, lang?: string, token?: string): Promise<ProductsResponse> {
    const sortedValue = mapSortOption(filter?.sort);
    // Передаємо фільтри тільки якщо масив непустий
    const filterInput =
        filter?.filter && filter.filter.length > 0 ? filter.filter : undefined;
    const data = await gqlRequest<{ products: ProductsResponse }>(
        PRODUCTS_QUERY,
        {
            categoryId: filter?.categoryId ?? undefined,
            showcaseId: filter?.showcaseId ?? undefined,
            saleId: filter?.saleId ?? undefined,
            search: filter?.search || undefined,
            filter: filterInput ?? undefined,
            limit: filter?.limit ?? undefined,
            page: filter?.page ?? undefined,
            sort: sortedValue ?? undefined,
        },
        // cache: 'no-store' — товари фільтруються за містом юзера (серверна сесія),
        // тому спільний кеш між юзерами неприпустимий.
        // token передається для SSR-запитів, щоб бекенд міг визначити місто юзера.
        { cache: 'no-store', lang, token, silent: filter?.silent },
    );
    if (!data || !data.products) {
        return {
            per_page: filter?.limit || 12,
            current_page: filter?.page || 1,
            has_more_pages: false,
            data: [],
        };
    }
    if (!Array.isArray(data.products.data)) {
        data.products.data = [];
    }
    return data.products;
}


export async function getProductsFilterApi(
    categoryId?: number,
    lang?: string,
    state?: FilterStateInput[],
): Promise<ProductsFilterResponse> {
    try {
        const data = await gqlRequest<{ productsFilter: ProductsFilterResponse }>(
            PRODUCTS_FILTER_QUERY,
            { categoryId: categoryId ?? undefined, state: state ?? undefined },
            { next: { revalidate: 60 }, lang },
        );
        return data.productsFilter ?? { blocks: [], productsCount: 0 };
    } catch {
        // API може не підтримувати productsFilter на dev-бекенді — повертаємо порожній стан
        return { blocks: [], productsCount: 0 };
    }
}

export async function addProductViewApi(id: number | string, lang?: string, token?: string): Promise<boolean> {
    const data = await gqlRequest<{ addProductView: boolean }>(
        ADD_PRODUCT_VIEW_MUTATION,
        { id: String(id) },
        { lang, token, cache: 'no-store' }
    );
    return data.addProductView;
}

export async function getProductByIdApi(id: number | string, lang?: string, token?: string): Promise<Product> {
    const data = await gqlRequest<{ product: Product }>(
        PRODUCT_BY_ID_QUERY,
        { id: parseInt(String(id)) },
        { 
            lang, 
            token,
            ...(token ? { cache: 'no-store' } : { next: { revalidate: 60 } })
        },
    );
    return data?.product;
}

export async function getProductCostVariantsApi(
    productId: number | string,
    lang?: string,
    token?: string,
): Promise<ProductCostVariant[]> {
    const data = await gqlRequest<{ productCostVariants: ProductCostVariant[] }>(
        PRODUCT_COST_VARIANTS_QUERY,
        { productId: String(productId) },
        { 
            lang, 
            token,
            ...(token ? { cache: 'no-store' } : { next: { revalidate: 60 } })
        },
    );
    return data.productCostVariants ?? [];
}

export async function getPopularProductsApi(
    productId?: number,
    limit: number = 12,
    lang?: string,
    token?: string,
): Promise<Product[]> {
    const data = await gqlRequest<{ popularProducts: { data: Product[] } }>(
        POPULAR_PRODUCTS_QUERY,
        { productId: productId ?? null, limit },
        { 
            lang, 
            token,
            ...(token ? { cache: 'no-store' } : { next: { revalidate: 3600 } })
        },
    );
    return data?.popularProducts?.data ?? [];
}

export async function getSpecialsByProductApi(
    productId: number,
    limit: number = 8,
    lang?: string,
    token?: string,
): Promise<Product[]> {
    const data = await gqlRequest<{
        specials: { data: Array<{ id: string; products?: Product[] | null }> };
    }>(
        SPECIALS_BY_PRODUCT_QUERY,
        { productId, limit },
        { 
            lang, 
            token,
            ...(token ? { cache: 'no-store' } : { next: { revalidate: 3600 } })
        },
    );
    const items = data.specials?.data ?? [];
    // Flatten: collect all products from all specials, deduplicate by id
    const seen = new Set<string>();
    const result: Product[] = [];
    for (const special of items) {
        for (const p of special.products ?? []) {
            if (!seen.has(p.id)) {
                seen.add(p.id);
                result.push(p);
            }
        }
    }
    return result;
}

export async function getBoughtTogetherProductsApi(
    categoryId: number,
    productId: number,
    limit: number = 8,
    lang?: string,
    token?: string,
): Promise<Product[]> {
    const data = await gqlRequest<{ boughtTogetherProducts: Product[] }>(
        BOUGHT_TOGETHER_PRODUCTS_QUERY,
        { categoryId, productId, limit },
        { 
            lang, 
            token,
            ...(token ? { cache: 'no-store' } : { next: { revalidate: 3600 } })
        },
    );
    return data.boughtTogetherProducts ?? [];
}

export async function addProductToAvailabilityTrackerApi(
    productId: number,
    lang?: string,
    token?: string,
): Promise<boolean> {
    const data = await gqlRequest<{ addProductToAvailabilityTracker: boolean }>(
        ADD_TO_AVAILABILITY_TRACKER_MUTATION,
        { productId },
        { cache: 'no-store', lang, token },
    );
    return data.addProductToAvailabilityTracker;
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
        }
    }
`;

export async function getCatalogTreeApi(lang?: string, parentId: number = 768, token?: string): Promise<ProductCategory[]> {
    const data = await gqlRequest<{ categories: ProductCategory[] }>(
        CATEGORY_TREE_QUERY,
        { parentId },
        { 
            lang,
            token,
            ...(token ? { cache: 'no-store' } : { next: { revalidate: 3600 } })
        },
    );
    return data.categories;
}

export async function getViewedProductsApi(limit: number = 10, lang?: string, token?: string): Promise<Product[]> {
    const data = await gqlRequest<{ products: { data: Product[] } }>(
        VIEWED_PRODUCTS_QUERY,
        { limit },
        { next: { revalidate: 60 }, lang, token },
    );
    return data?.products?.data ?? [];
}

export async function getProductsByIdsApi(ids: number[], lang?: string, token?: string): Promise<Product[]> {
    const data = await gqlRequest<{ productsByIds: Product[] }>(
        PRODUCTS_BY_IDS_QUERY,
        { ids },
        { cache: 'no-store', lang, token }
    );
    return data?.productsByIds ?? [];
}

/**
 * Helper to determine the score/rank of a roast degree (higher means more cooked).
 */
export function getRoastDegreeScore(name: string): number {
    const lower = name.toLowerCase();
    if (lower.includes('well done') || lower.includes('well_done') || lower.includes('повн')) return 5;
    if (lower.includes('medium well') || lower.includes('medium_well') || lower.includes('майже')) return 4;
    if (lower.includes('medium rare') || lower.includes('medium_rare') || lower.includes('середньо-слабке')) return 2;
    if (lower.includes('medium') || lower.includes('середнє')) return 3;
    if (lower.includes('rare') || lower.includes('слабке')) return 1;
    return 0;
}

/**
 * Returns the default variant (one with isDefault: true, or the one with the highest roast degree).
 */
export function getDefaultCostVariant(variants: ProductCostVariant[]): ProductCostVariant | undefined {
    if (!variants || variants.length === 0) return undefined;
    const defaultVar = variants.find(v => v.isDefault);
    if (defaultVar) return defaultVar;

    // Fallback: choose the one with the highest roast degree score
    return [...variants].sort((a, b) => getRoastDegreeScore(b.name || '') - getRoastDegreeScore(a.name || ''))[0];
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
            menuIcon {
                icon1x
                icon2x
                icon3x
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
            faqGroups {
                id
                name
            }
            bundles {
                id
                discountType
                discountAmount
                items {
                    id
                    product {
                        id
                        slug
                        name
                        cost
                        oldCost
                        unit
                        multiplier
                        available
                        portionSize
                        images {
                            url {
                                grid2x
                                grid1x
                            }
                        }
                    }
                }
            }
            recommendedProducts {
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
                portionSize
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

export async function getCategoryByIdApi(id: number, lang?: string, token?: string): Promise<ProductCategory | null> {
    const data = await gqlRequest<{ category: ProductCategory | null }>(
        CATEGORY_BY_ID_QUERY,
        { id },
        { 
            lang, 
            token,
            ...(token ? { cache: 'no-store' } : { next: { revalidate: 3600 } })
        }
    );
    return data.category;
}

const FAQ_QUESTIONS_QUERY = /* GraphQL */ `
    query GetFaqQuestions($groupId: Int!, $limit: Int, $page: Int) {
        faqQuestions(groupId: $groupId, limit: $limit, page: $page) {
            data {
                id
                question
                answer
            }
        }
    }
`;

export async function getFaqQuestionsApi(groupId: number, lang?: string): Promise<FaqQuestion[]> {
    const data = await gqlRequest<{
        faqQuestions: { data: FaqQuestion[] };
    }>(
        FAQ_QUESTIONS_QUERY,
        { groupId },
        { next: { revalidate: 3600 }, lang }

    );
    return data.faqQuestions?.data ?? [];
}

function roundWeightString(val: string): string {
    if (!val) return '';
    const trimmed = val.trim();
    
    // 1. Try to match a pure number (e.g. "1441.399" or "1,53")
    if (/^\d+([.,]\d+)?$/.test(trimmed)) {
        const num = parseFloat(trimmed.replace(',', '.'));
        if (!isNaN(num)) {
            if (num >= 10) {
                return String(Math.round(num));
            } else {
                return String(Math.round(num * 100) / 100);
            }
        }
    }
    
    // 2. Try to match a number with a trailing unit (e.g. "1441.399 г" or "1.5339 кг" or "0.75 л")
    const match = trimmed.match(/^(\d+([.,]\d+)?)\s*(л|l|мл|ml|г|g|кг|kg|шт)(?![а-яА-Яa-zA-Z0-9])/i);
    if (match) {
        const numPart = match[1];
        const unitPart = match[3];
        const num = parseFloat(numPart.replace(',', '.'));
        if (!isNaN(num)) {
            let roundedNumStr: string;
            if (num >= 10) {
                roundedNumStr = String(Math.round(num));
            } else {
                roundedNumStr = String(Math.round(num * 100) / 100);
            }
            const originalSpacing = trimmed.substring(numPart.length, trimmed.indexOf(unitPart));
            return `${roundedNumStr}${originalSpacing}${unitPart}`;
        }
    }
    
    return val;
}

export interface ProductWeightInput {
    name: string;
    unit?: string | null;
    multiplier?: number | null;
    portionSize?: string | null;
    specifications?: {
        name: string;
        values: string[];
    }[] | null;
}

export function getProductWeight(product: ProductWeightInput): string {
    // 1. Try specifications with a smart finder that ignores "Вага: 1" / "Вес: 1" defaults if other weight specs exist
    let weightSpec = product.specifications?.find(sp => {
        const name = sp.name.toLowerCase();
        const hasWeightKeyword = name.includes('вага') || name.includes('важ') || name.includes('вес') || name.includes("об'єм");
        if (!hasWeightKeyword) return false;
        const val = sp.values[0] || '';
        return !(val === '1' && (name === 'вага' || name === 'вес'));
    });

    if (!weightSpec) {
        weightSpec = product.specifications?.find(sp => {
            const name = sp.name.toLowerCase();
            return name.includes('вага') || name.includes('важ') || name.includes('вес') || name.includes("об'єм");
        });
    }

    if (weightSpec && weightSpec.values.length > 0) {
        const val = weightSpec.values[0];
        const cleanVal = val.replace(/[0-9.,\s-]/g, '');
        if (cleanVal.length === 0) {
            const specName = weightSpec.name.toLowerCase();
            const titleLower = product.name.toLowerCase();
            const unitLower = product.unit?.toLowerCase() || '';
            const isLiquid = specName.includes("об'єм") || specName.includes('обьем') || 
                specName.includes('мл') || specName.includes('ml') || 
                unitLower.includes('мл') || unitLower.includes('ml') ||
                /вино|пиво|сік|сок|вод|кола|нектар|напій|напиток|лимонад|сидр|wine|beer|juice|beverage/i.test(titleLower);

            let formattedVal: string;
            const unitClean = unitLower.trim();
            const num = parseFloat(val.replace(',', '.'));
            
            if (!isNaN(num) && num === 1) {
                if (unitClean === 'шт') {
                    formattedVal = '1 шт';
                } else if (unitClean === 'уп') {
                    formattedVal = '1 уп';
                } else if (unitClean === 'кг' || unitClean === 'kg') {
                    formattedVal = '1 кг';
                } else if (unitClean === 'г' || unitClean === 'g') {
                    formattedVal = '1 г';
                } else if (unitClean === 'мл' || unitClean === 'ml') {
                    formattedVal = '1 мл';
                } else if (unitClean === 'л' || unitClean === 'l') {
                    formattedVal = '1 л';
                } else {
                    formattedVal = '1 шт';
                }
            } else {
                if (unitClean === 'шт') {
                    formattedVal = `${val} ${isLiquid ? 'мл' : 'г'}`;
                } else if (unitClean === 'уп') {
                    formattedVal = `${val} уп`;
                } else if (specName.includes('кг') || specName.includes('kg') || unitClean === 'кг' || unitClean === 'kg') {
                    formattedVal = `${val} кг`;
                } else if (specName.includes('л') || specName.includes('l') || unitClean === 'л' || unitClean === 'l') {
                    if (!specName.includes('мл') && !specName.includes('ml') && unitClean !== 'мл' && unitClean !== 'ml') {
                        formattedVal = `${val} л`;
                    } else {
                        formattedVal = `${val} мл`;
                    }
                } else if (unitClean === 'г' || unitClean === 'g') {
                    formattedVal = `${val} г`;
                } else if (unitClean === 'мл' || unitClean === 'ml') {
                    formattedVal = `${val} мл`;
                } else {
                    formattedVal = `${val} ${isLiquid ? 'мл' : 'г'}`;
                }
            }
            return roundWeightString(formattedVal);
        }
        return roundWeightString(val);
    }

    // 2. Try portionSize
    if (product.portionSize) {
        const hasUnit = /[гgкmшт]/i.test(product.portionSize);
        if (hasUnit) return roundWeightString(product.portionSize);
    }

    // 3. Try multiplier with unit
    if (product.multiplier && product.multiplier > 0) {
        const normalizedUnit = product.unit?.trim().toLowerCase() || '';
        if (normalizedUnit === '100 г' || normalizedUnit === '100г') {
            return `${Math.round(product.multiplier * 1000)} г`;
        } else if (normalizedUnit === '100 мл') {
            return `${Math.round(product.multiplier * 1000)} мл`;
        }
        if (normalizedUnit === 'шт') {
            return `${product.multiplier} шт`;
        }
        return roundWeightString(`${product.multiplier} ${product.unit}`);
    }

    // 4. Default unit fallback
    if (product.unit && product.unit.toLowerCase() !== 'шт') {
        return product.unit;
    }

    return '';
}




