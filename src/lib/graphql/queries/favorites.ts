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

const GET_FAVORITES_PAYLOAD_QUERY = /* GraphQL */ `
    query GetFavoritesIds {
        favorites(limit: 1000) {
            data {
                id
            }
        }
    }
`;

const GET_FAVORITES_QUERY = /* GraphQL */ `
    query GetFavorites($limit: Int) {
        favorites(limit: $limit) {
            data {
                id
                name
                slug
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
            }
            per_page
            current_page
            has_more_pages
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
 * The payload is a base64 encoded JSON object: {"type":"WezomCms\\Catalog\\Models\\Product","id":<productId>}
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
 * Fetches the list of favorites as raw payload strings (IDs)
 */
export async function getFavoritesPayloadApi(token?: string, lang?: string): Promise<string[]> {
    const data = await gqlRequest<{ favorites: { data: Array<{ id: string }> } }>(
        GET_FAVORITES_PAYLOAD_QUERY,
        {},
        { token, lang }
    );
    return data.favorites.data.map(item => item.id);
}

export async function getFavoritesApi(limit?: number, token?: string, lang?: string): Promise<ProductSimplePagination> {
    const data = await gqlRequest<{ favorites: ProductSimplePagination }>(
        GET_FAVORITES_QUERY,
        { limit },
        { token, lang, cache: 'no-store' }
    );
    return data.favorites;
}
