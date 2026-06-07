import { gqlRequest } from '../client';

export interface CartItemGql {
    rowId: string;
    productId: number;
    quantity: number;
    categoryId?: string;
    cost: number;
    unit: string;
    multiplier: number;
    costVariantId?: number | null;
    costVariantName?: string | null;
}

export interface CartGql {
    hasUnavailableProducts: boolean;
    items: CartItemGql[];
    hasRawFoods: boolean;
    total: number;
    cashback: number;
}

const CART_FIELDS = `
    hasUnavailableProducts
    items {
        rowId
        productId
        quantity
        categoryId
        cost
        unit
        multiplier
        costVariantId
        costVariantName
    }
    hasRawFoods
    total
    cashback
`;

export const ADD_PRODUCT_TO_CART_MUTATION = /* GraphQL */ `
    mutation AddProductToCart(
        $productId: Int!
        $quantity: Int
        $costVariantId: Int
        $paymentId: Int
        $deliveryId: Int
        $localityId: Int
        $useBonuses: Boolean
    ) {
        addProductToCart(
            productId: $productId
            quantity: $quantity
            costVariantId: $costVariantId
            paymentId: $paymentId
            deliveryId: $deliveryId
            localityId: $localityId
            useBonuses: $useBonuses
        ) {
            ${CART_FIELDS}
        }
    }
`;

export const EDIT_CART_ITEM_QUANTITY_MUTATION = /* GraphQL */ `
    mutation EditCartItemQuantity(
        $rowId: String!
        $quantity: Int!
        $paymentId: Int
        $deliveryId: Int
        $localityId: Int
        $useBonuses: Boolean
    ) {
        editCartItemQuantity(
            rowId: $rowId
            quantity: $quantity
            paymentId: $paymentId
            deliveryId: $deliveryId
            localityId: $localityId
            useBonuses: $useBonuses
        ) {
            ${CART_FIELDS}
        }
    }
`;

export const REMOVE_CART_ITEM_MUTATION = /* GraphQL */ `
    mutation RemoveCartItem(
        $rowId: String!
        $paymentId: Int
        $deliveryId: Int
        $localityId: Int
        $useBonuses: Boolean
    ) {
        removeCartItem(
            rowId: $rowId
            paymentId: $paymentId
            deliveryId: $deliveryId
            localityId: $localityId
            useBonuses: $useBonuses
        ) {
            ${CART_FIELDS}
        }
    }
`;

export const GET_CART_QUERY = /* GraphQL */ `
    query GetCart(
        $paymentId: Int
        $deliveryId: Int
        $localityId: Int
        $useBonuses: Boolean
    ) {
        cart(
            paymentId: $paymentId
            deliveryId: $deliveryId
            localityId: $localityId
            useBonuses: $useBonuses
        ) {
            ${CART_FIELDS}
        }
    }
`;

/**
 * Adds a product to the cart.
 */
export async function addProductToCartApi(
    params: {
        productId: number;
        quantity?: number;
        costVariantId?: number;
        paymentId?: number;
        deliveryId?: number;
        localityId?: number;
        useBonuses?: boolean;
    },
    token?: string,
    lang?: string
): Promise<CartGql> {
    const data = await gqlRequest<{ addProductToCart: CartGql }>(
        ADD_PRODUCT_TO_CART_MUTATION,
        params,
        { token, lang, cache: 'no-store' }
    );
    return data.addProductToCart;
}

/**
 * Edits the quantity of a product in the cart.
 */
export async function editCartItemQuantityApi(
    params: {
        rowId: string;
        quantity: number;
        paymentId?: number;
        deliveryId?: number;
        localityId?: number;
        useBonuses?: boolean;
    },
    token?: string,
    lang?: string
): Promise<CartGql> {
    const data = await gqlRequest<{ editCartItemQuantity: CartGql }>(
        EDIT_CART_ITEM_QUANTITY_MUTATION,
        params,
        { token, lang, cache: 'no-store' }
    );
    return data.editCartItemQuantity;
}

/**
 * Removes a product from the cart.
 */
export async function removeCartItemApi(
    params: {
        rowId: string;
        paymentId?: number;
        deliveryId?: number;
        localityId?: number;
        useBonuses?: boolean;
    },
    token?: string,
    lang?: string
): Promise<CartGql> {
    const data = await gqlRequest<{ removeCartItem: CartGql }>(
        REMOVE_CART_ITEM_MUTATION,
        params,
        { token, lang, cache: 'no-store' }
    );
    return data.removeCartItem;
}

/**
 * Fetches the user's cart from the backend.
 */
export async function getCartApi(
    params: {
        paymentId?: number;
        deliveryId?: number;
        localityId?: number;
        useBonuses?: boolean;
    } = {},
    token?: string,
    lang?: string
): Promise<CartGql> {
    const data = await gqlRequest<{ cart: CartGql }>(
        GET_CART_QUERY,
        params,
        { token, lang, cache: 'no-store' }
    );
    return data.cart;
}
