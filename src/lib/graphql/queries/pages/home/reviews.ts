import { gqlRequest } from "../../../client";

export interface ReviewUser {
    id: string;
    isGuest: boolean;
    name: string | null;
    surname: string | null;
    avatar: {
        size1x?: string | null;
        size2x?: string | null;
        size3x?: string | null;
    } | null;
}

export interface HomeReview {
    id: number;
    rating: number;
    text: string;
    created_at: string;
    published: boolean;
    user: ReviewUser | null;
}

export interface ProductReviewsResponse {
    productReviews: {
        per_page: number;
        current_page: number;
        from: number;
        to: number;
        data: HomeReview[];
    };
}

export const PRODUCT_REVIEWS_QUERY = /* GraphQL */ `
    query ProductReviews {
        productReviews {
            per_page
            current_page
            from
            data {
                id
                rating
                text
                created_at
                published
                user {
                    id
                    isGuest
                    name
                    surname
                    avatar {
                        size1x
                        size2x
                        size3x
                    }
                }
            }
            to
        }
    }
`;

export async function getReviewsApi(): Promise<HomeReview[]> {
    const data = await gqlRequest<ProductReviewsResponse>(
        PRODUCT_REVIEWS_QUERY,
        undefined,
        { next: { revalidate: 3600 } }
    );
    // User wants only the last 8 reviews. 
    // Usually the API returns them ordered, but we can slice just in case or if it returns more.
    return data.productReviews.data.slice(0, 8);
}
