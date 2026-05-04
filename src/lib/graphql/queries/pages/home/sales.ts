import { gqlRequest } from "../../../client";

export interface SaleImages {
    size1x?: string | null;
    size2x?: string | null;
    size3x?: string | null;
}

export interface Sale {
    id: string;
    name: string;
    slug?: string | null;
    image?: SaleImages | null;
    banner?: SaleImages | null;
    expiresAt?: string | null;
    title?: string | null;
    description?: string | null;
    text?: string | null;
}

export interface SalesResponse {
    data: Sale[];
    per_page: number;
    current_page: number;
    has_more_pages: boolean;
}

export const SALES_QUERY = /* GraphQL */ `
    query Sales($limit: Int, $page: Int) {
        sales(limit: $limit, page: $page) {
            per_page
            current_page
            has_more_pages
            data {
                id
                name
                slug
                image {
                    size1x
                    size2x
                    size3x
                }
                banner {
                    size1x
                    size2x
                    size3x
                }
                expiresAt
                title
                description
            }
        }
    }
`;

export async function getSalesApi(limit: number = 10, page: number = 1, lang?: string): Promise<SalesResponse> {
    const data = await gqlRequest<{ sales: SalesResponse }>(
        SALES_QUERY,
        { limit, page },
        { next: { revalidate: 3600 }, lang },
    );
    return data.sales;
}
