import { gqlRequest } from '../client';

export interface OrderStatus {
    id: string;
    createdAt?: string | null;
    name?: string | null;
    icon?: string | null;
}

export interface Order {
    id: string;
    orderNo: string;
    createdAt: string;
    total: number;
    status?: OrderStatus | null;
    statusHistory?: (OrderStatus | null)[] | null;
}

export interface OrderSimplePagination {
    data: Order[];
    per_page: number;
    current_page: number;
    has_more_pages: boolean;
}

const ORDERS_QUERY = /* GraphQL */ `
    query GetOrders($withoutCancelled: Boolean, $limit: Int, $page: Int) {
        orders(withoutCancelled: $withoutCancelled, limit: $limit, page: $page) {
            data {
                id
                orderNo
                createdAt
                total
                status {
                    id
                    createdAt
                    name
                }
                statusHistory {
                    id
                    createdAt
                    name
                }
            }
            per_page
            current_page
            has_more_pages
        }
    }
`;

export async function getOrdersApi(
    token: string,
    params?: { withoutCancelled?: boolean; limit?: number; page?: number },
    lang?: string,
): Promise<OrderSimplePagination> {
    const data = await gqlRequest<{ orders: OrderSimplePagination }>(
        ORDERS_QUERY,
        params,
        { token, lang },
    );
    return data.orders;
}
