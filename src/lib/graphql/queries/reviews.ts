import { gqlRequest } from '../client';

export interface OrderReviewRating {
    id: string;
    rating: number;
}

export interface OrderReview {
    id: string;
    orderId: number;
    text: string;
    averageRating: number;
    ratings?: OrderReviewRating[] | null;
}

export interface OrderReviewSimplePagination {
    data: OrderReview[];
    per_page: number;
    current_page: number;
    has_more_pages: boolean;
}

export interface ProductReview {
    id: string;
    productId?: number | null;
    rating: number;
    text: string;
    created_at: string;
    published: boolean;
    user?: {
        id: string;
        name?: string | null;
        surname?: string | null;
    } | null;
}

export interface ProductReviewSimplePagination {
    data: ProductReview[];
    per_page: number;
    current_page: number;
    has_more_pages: boolean;
}

const ORDER_REVIEWS_QUERY = /* GraphQL */ `
    query GetOrderReviews($orderId: Int, $limit: Int, $page: Int) {
        orderReviews(orderId: $orderId, limit: $limit, page: $page) {
            data {
                id
                orderId
                text
                averageRating
                ratings {
                    id
                    rating
                }
            }
            per_page
            current_page
            has_more_pages
        }
    }
`;

const PRODUCT_REVIEWS_QUERY = /* GraphQL */ `
    query GetProductReviews($productId: Int, $userId: Int, $limit: Int, $page: Int) {
        productReviews(productId: $productId, userId: $userId, limit: $limit, page: $page) {
            data {
                id
                productId
                rating
                text
                created_at
                published
                user {
                    id
                    name
                    surname
                }
            }
            per_page
            current_page
            has_more_pages
        }
    }
`;

const ADD_ORDER_REVIEW_MUTATION = /* GraphQL */ `
    mutation AddOrderReview($orderId: Int!, $ratings: [ReviewRating], $text: String!) {
        addOrderReview(orderId: $orderId, ratings: $ratings, text: $text)
    }
`;

const ADD_PRODUCT_REVIEW_MUTATION = /* GraphQL */ `
    mutation AddProductReview($productId: Int!, $rating: Int!, $text: String!) {
        addProductReview(productId: $productId, rating: $rating, text: $text)
    }
`;

const UPDATE_ORDER_REVIEW_MUTATION = /* GraphQL */ `
    mutation UpdateOrderReview($orderId: Int!, $ratings: [ReviewRating], $text: String!) {
        updateOrderReview(orderId: $orderId, ratings: $ratings, text: $text)
    }
`;

const UPDATE_PRODUCT_REVIEW_MUTATION = /* GraphQL */ `
    mutation UpdateProductReview($id: Int!, $rating: Int!, $text: String!) {
        updateProductReview(id: $id, rating: $rating, text: $text)
    }
`;

export async function getOrderReviewsApi(
    token: string,
    params?: { orderId?: number; limit?: number; page?: number },
    lang?: string,
): Promise<OrderReviewSimplePagination> {
    const data = await gqlRequest<{ orderReviews: OrderReviewSimplePagination }>(
        ORDER_REVIEWS_QUERY,
        params,
        { token, lang },
    );
    return data.orderReviews;
}

export async function getProductReviewsApi(
    token: string,
    params?: { productId?: number; userId?: number; limit?: number; page?: number },
    lang?: string,
): Promise<ProductReviewSimplePagination> {
    const data = await gqlRequest<{ productReviews: ProductReviewSimplePagination }>(
        PRODUCT_REVIEWS_QUERY,
        params,
        { token, lang },
    );
    return data.productReviews;
}

export async function addOrderReviewApi(
    token: string,
    variables: { orderId: number; ratings: OrderReviewRating[]; text: string },
    lang?: string,
): Promise<boolean> {
    const data = await gqlRequest<{ addOrderReview: boolean }>(
        ADD_ORDER_REVIEW_MUTATION,
        variables,
        { token, lang },
    );
    return data.addOrderReview;
}

export async function addProductReviewApi(
    token: string,
    variables: { productId: number; rating: number; text: string },
    lang?: string,
): Promise<boolean> {
    const data = await gqlRequest<{ addProductReview: boolean }>(
        ADD_PRODUCT_REVIEW_MUTATION,
        variables,
        { token, lang },
    );
    return data.addProductReview;
}

export async function updateOrderReviewApi(
    token: string,
    variables: { orderId: number; ratings: OrderReviewRating[]; text: string },
    lang?: string,
): Promise<boolean> {
    const data = await gqlRequest<{ updateOrderReview: boolean }>(
        UPDATE_ORDER_REVIEW_MUTATION,
        variables,
        { token, lang },
    );
    return data.updateOrderReview;
}

export async function updateProductReviewApi(
    token: string,
    variables: { id: number; rating: number; text: string },
    lang?: string,
): Promise<boolean> {
    const data = await gqlRequest<{ updateProductReview: boolean }>(
        UPDATE_PRODUCT_REVIEW_MUTATION,
        variables,
        { token, lang },
    );
    return data.updateProductReview;
}
