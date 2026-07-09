import { gqlRequest } from '../../client';

export interface ShoppingListProduct {
    id: string;
    costVariantId: number | null;
    costVariantName: string | null;
    productId: number;
    oldCost: number | null;
    cost: number;
    unit: string;
    name: string | null;
    image: {
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
    } | null;
}

export interface ShoppingList {
    id: string;
    name: string | null;
    count: number | null;
    total: number | null;
    products: ShoppingListProduct[] | null;
    createdAt?: string | null;
}

export interface ShoppingListSimplePagination {
    data: ShoppingList[];
    per_page: number;
    current_page: number;
    has_more_pages: boolean;
}

const GET_SHOPPING_LISTS_QUERY = /* GraphQL */ `
    query ShoppingLists($limit: Int, $page: Int) {
        shoppingLists(limit: $limit, page: $page) {
            per_page
            current_page
            has_more_pages
            data {
                id
                name
                createdAt
                count
                total
                products {
                    id
                    productId
                    cost
                    oldCost
                    unit
                    name
                    costVariantId
                    costVariantName
                    image {
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

const GET_SHOPPING_LIST_QUERY = /* GraphQL */ `
    query ShoppingList($id: Int!) {
        shoppingList(id: $id) {
            id
            name
            createdAt
            count
            total
            products {
                id
                productId
                cost
                oldCost
                unit
                name
                costVariantId
                costVariantName
                image {
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

const CREATE_SHOPPING_LIST_MUTATION = /* GraphQL */ `
    mutation CreateShoppingList($name: String) {
        createShoppingList(name: $name) {
            id
            name
            createdAt
            count
            total
            products {
                id
                productId
                cost
                oldCost
                unit
                name
                costVariantId
                costVariantName
            }
        }
    }
`;

const DELETE_SHOPPING_LIST_MUTATION = /* GraphQL */ `
    mutation DeleteShoppingList($id: ID!) {
        deleteShoppingList(id: $id)
    }
`;

const RENAME_SHOPPING_LIST_MUTATION = /* GraphQL */ `
    mutation RenameShoppingList($id: ID!, $name: String!) {
        renameShoppingList(id: $id, name: $name)
    }
`;

const ADD_PRODUCT_TO_SHOPPING_LIST_MUTATION = /* GraphQL */ `
    mutation AddProductToShoppingList($id: ID!, $productId: ID!, $costVariantId: ID) {
        addProductToShoppingList(id: $id, productId: $productId, costVariantId: $costVariantId)
    }
`;

const DELETE_PRODUCT_FROM_SHOPPING_LIST_MUTATION = /* GraphQL */ `
    mutation DeleteProductFromShoppingList($id: ID!) {
        deleteProductFromShoppingList(id: $id)
    }
`;

const ADD_SHOPPING_LIST_TO_CART_MUTATION = /* GraphQL */ `
    mutation AddShoppingListToCart($id: ID!) {
        addShoppingListToCart(id: $id)
    }
`;

export async function getShoppingListsApi(
    limit?: number,
    page?: number,
    token?: string,
    lang?: string
): Promise<ShoppingListSimplePagination> {
    const data = await gqlRequest<{ shoppingLists: ShoppingListSimplePagination }>(
        GET_SHOPPING_LISTS_QUERY,
        { limit, page },
        { token, lang, cache: 'no-store' }
    );
    return data.shoppingLists;
}

export async function getShoppingListByIdApi(
    id: number | string,
    token?: string,
    lang?: string
): Promise<ShoppingList | null> {
    const data = await gqlRequest<{ shoppingList: ShoppingList | null }>(
        GET_SHOPPING_LIST_QUERY,
        { id: parseInt(String(id), 10) },
        { token, lang, cache: 'no-store' }
    );
    return data.shoppingList;
}

export async function createShoppingListApi(
    name: string,
    token?: string,
    lang?: string
): Promise<ShoppingList> {
    const data = await gqlRequest<{ createShoppingList: ShoppingList }>(
        CREATE_SHOPPING_LIST_MUTATION,
        { name },
        { token, lang, cache: 'no-store' }
    );
    return data.createShoppingList;
}

export async function deleteShoppingListApi(
    id: string | number,
    token?: string,
    lang?: string
): Promise<boolean> {
    const data = await gqlRequest<{ deleteShoppingList: boolean }>(
        DELETE_SHOPPING_LIST_MUTATION,
        { id: String(id) },
        { token, lang, cache: 'no-store' }
    );
    return data.deleteShoppingList;
}

export async function renameShoppingListApi(
    id: string | number,
    name: string,
    token?: string,
    lang?: string
): Promise<boolean> {
    const data = await gqlRequest<{ renameShoppingList: boolean }>(
        RENAME_SHOPPING_LIST_MUTATION,
        { id: String(id), name },
        { token, lang, cache: 'no-store' }
    );
    return data.renameShoppingList;
}

export async function addProductToShoppingListApi(
    id: string | number,
    productId: string | number,
    costVariantId?: string | number | null,
    token?: string,
    lang?: string
): Promise<boolean> {
    const data = await gqlRequest<{ addProductToShoppingList: boolean }>(
        ADD_PRODUCT_TO_SHOPPING_LIST_MUTATION,
        {
            id: String(id),
            productId: String(productId),
            costVariantId: costVariantId ? String(costVariantId) : undefined,
        },
        { token, lang, cache: 'no-store' }
    );
    return data.addProductToShoppingList;
}

export async function deleteProductFromShoppingListApi(
    id: string | number,
    token?: string,
    lang?: string
): Promise<boolean> {
    const data = await gqlRequest<{ deleteProductFromShoppingList: boolean }>(
        DELETE_PRODUCT_FROM_SHOPPING_LIST_MUTATION,
        { id: String(id) },
        { token, lang, cache: 'no-store' }
    );
    return data.deleteProductFromShoppingList;
}

export async function addShoppingListToCartApi(
    id: string | number,
    token?: string,
    lang?: string
): Promise<boolean> {
    const data = await gqlRequest<{ addShoppingListToCart: boolean }>(
        ADD_SHOPPING_LIST_TO_CART_MUTATION,
        { id: String(id) },
        { token, lang, cache: 'no-store' }
    );
    return data.addShoppingListToCart;
}
