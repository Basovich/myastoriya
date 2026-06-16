import { gqlRequest } from '../client';

export interface OrderStatus {
    id: string;
    createdAt?: string | null;
    name?: string | null;
    icon?: string | null;
}

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    cost: number;
    totalCost: number;
    image?: {
        list1x?: string | null;
        grid1x?: string | null;
        main1x?: string | null;
    } | null;
}

export interface Order {
    id: string;
    orderNo: string;
    createdAt: string;
    total: number;
    status?: OrderStatus | null;
    statusHistory?: (OrderStatus | null)[] | null;
    items?: OrderItem[] | null;
    reviewId?: number | null;
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
                reviewId
                items {
                    id
                    name
                    quantity
                    cost
                    totalCost
                    image {
                        list1x
                        grid1x
                        main1x
                    }
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

// ── Payments & Order Creation ────────────────────────────────────────────────

export interface Payment {
    id: string;
    name?: string | null;
    driver?: string | null;
    showChangeField?: boolean | null;
}

export interface CheckoutUserData {
    localityId: number;
    name: string;
    surname: string;
    phone: string;
    email?: string | null;
    anotherRecipient?: boolean | null;
    recipientFullName?: string | null;
    recipientPhone?: string | null;
}

export interface CheckoutDeliveryData {
    deliveryId: number;
    userAddressId?: number | null;
    desiredDeliveryDate?: string | null;
    desiredDeliveryTime?: string | null;
    userPickupPointId?: number | null;
}

export interface CheckoutPaymentData {
    paymentId: number;
    userCardId?: number | null;
    change?: number | null;
    browserInfo?: {
        screenWidth: number;
        screenHeight: number;
    } | null;
}

export interface CreateOrderResponse {
    action: string;
    actionToken?: string | null;
    url?: string | null;
    orderId: string;
    driver?: string | null;
    currencyCode?: string | null;
    total: number;
}

const PAYMENTS_QUERY = /* GraphQL */ `
    query GetPayments($localityId: Int, $os: String) {
        payments(localityId: $localityId, os: $os) {
            id
            name
            driver
            showChangeField
        }
    }
`;

const CREATE_ORDER_MUTATION = /* GraphQL */ `
    mutation CreateOrder(
        $userData: CheckoutUserData!,
        $deliveryData: CheckoutDeliveryData!,
        $paymentData: CheckoutPaymentData!,
        $useBonuses: Boolean,
        $comment: String,
        $personsCount: Int,
        $communicationMethod: String,
        $dontCallBack: Boolean,
        $registerMe: Boolean,
        $password: String
    ) {
        createOrder(
            userData: $userData,
            deliveryData: $deliveryData,
            paymentData: $paymentData,
            useBonuses: $useBonuses,
            comment: $comment,
            personsCount: $personsCount,
            communicationMethod: $communicationMethod,
            dontCallBack: $dontCallBack,
            registerMe: $registerMe,
            password: $password
        ) {
            action
            actionToken
            url
            orderId
            driver
            currencyCode
            total
        }
    }
`;

export async function getPaymentsApi(
    localityId?: number,
    os?: string,
    token?: string,
    lang?: string,
): Promise<Payment[]> {
    const data = await gqlRequest<{ payments: Payment[] }>(
        PAYMENTS_QUERY,
        { localityId, os },
        { token, lang },
    );
    return data.payments;
}

export async function createOrderApi(
    variables: {
        userData: CheckoutUserData;
        deliveryData: CheckoutDeliveryData;
        paymentData: CheckoutPaymentData;
        useBonuses?: boolean;
        comment?: string;
        personsCount?: number;
        communicationMethod?: string;
        dontCallBack?: boolean;
        registerMe?: boolean;
        password?: string;
    },
    token: string,
    lang?: string,
): Promise<CreateOrderResponse> {
    const data = await gqlRequest<{ createOrder: CreateOrderResponse }>(
        CREATE_ORDER_MUTATION,
        variables,
        { token, lang },
    );
    return data.createOrder;
}
