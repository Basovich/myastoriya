import { gqlRequest } from '../client';
import { Product } from './products';

export interface ProductSimplePagination {
    data: Product[];
    per_page: number;
    current_page: number;
    has_more_pages: boolean;
}

const ADD_TO_FAVORITES_MUTATION = /* GraphQL */ `
    mutation AddToFavorites($payload: String!) {
        addToFavorites(payload: $payload)
    }
`;

const REMOVE_FROM_FAVORITES_MUTATION = /* GraphQL */ `
    mutation RemoveFromFavorites($payload: String!) {
        removeFromFavorites(payload: $payload)
    }
`;

const GET_FAVORITES_QUERY = /* GraphQL */ `
    query GetFavorites($limit: Int, $page: Int, $full: Boolean!) {
        favorites(limit: $limit, page: $page) {
            data {
                id
                name @include(if: $full)
                slug @include(if: $full)
                image @include(if: $full) {
                    url {
                        grid2x
                        grid1x
                        main2x
                        main1x
                        big
                    }
                }
                images @include(if: $full) {
                    url {
                        grid2x
                        grid1x
                        main2x
                        main1x
                        big
                    }
                }
                cost @include(if: $full)
                oldCost @include(if: $full)
                unit @include(if: $full)
                multiplier @include(if: $full)
                is_new @include(if: $full)
                available @include(if: $full)
                specifications @include(if: $full) {
                    name
                    values
                }
            }
            per_page @include(if: $full)
            current_page @include(if: $full)
            has_more_pages @include(if: $full)
        }
    }
`;

/**
 * Helper to generate the specific base64 payload required by the backend
 * Format: {"type":"WezomCms\\Catalog\\Models\\Product","id":<number>} encoded as base64
 */
function generateFavoritePayload(productId: number | string): string {
    const obj = {
        type: 'WezomCms\\Catalog\\Models\\Product',
        id: Number(productId),
    };
    const jsonString = JSON.stringify(obj);
    // Use Buffer for node-side (tests) or btoa for browser-side
    if (typeof btoa === 'function') {
        return btoa(jsonString);
    }
    return Buffer.from(jsonString).toString('base64');
}

/**
 * Adds a product to the user's favorites.
 */
export async function addToFavoritesApi(productId: number | string, token?: string, lang?: string): Promise<boolean> {
    const payload = generateFavoritePayload(productId);
    
    const data = await gqlRequest<{ addToFavorites: boolean }>(
        ADD_TO_FAVORITES_MUTATION,
        { payload },
        { token, lang, cache: 'no-store' }
    );
    return data.addToFavorites;
}

/**
 * Removes a product from the user's favorites.
 */
export async function removeFromFavoritesApi(productId: number | string, token?: string, lang?: string): Promise<boolean> {
    const payload = generateFavoritePayload(productId);

    const data = await gqlRequest<{ removeFromFavorites: boolean }>(
        REMOVE_FROM_FAVORITES_MUTATION,
        { payload },
        { token, lang, cache: 'no-store' }
    );
    return data.removeFromFavorites;
}

/**
 * Unified API to fetch favorites. 
 * Can return either just IDs (default) or full product data.
 */
export async function getFavoritesApi(
    options: { limit?: number; page?: number; full?: boolean } = {},
    token?: string,
    lang?: string
): Promise<ProductSimplePagination> {
    const { limit = 1000, page = 1, full = false } = options;

    const data = await gqlRequest<{ favorites: ProductSimplePagination }>(
        GET_FAVORITES_QUERY,
        { limit, page, full },
        { token, lang, cache: full ? 'no-store' : 'default' }
    );
    return data.favorites;
}

