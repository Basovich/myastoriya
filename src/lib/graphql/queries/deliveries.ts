import { gqlRequest } from '../client';

export interface Delivery {
    id: string;
    type: string;
    driver?: string | null;
    showDeliveryTime: boolean;
    name?: string | null;
    disabled: boolean;
    needForAvailable?: number | null;
    deliveryCost?: number | null;
    elapsedForFree?: number | null;
}

export interface Schedule {
    days?: string | null;
    workTime?: string | null;
}

export interface UserPickupPoint {
    id: string;
    isDefault: boolean;
    type: string;
    name: string;
    schedule?: Schedule[] | null;
}

export interface Warehouse {
    ref: string;
    name: string;
    lat?: number | null;
    lng?: number | null;
    schedule?: Schedule[] | null;
}

export interface WarehousePagination {
    data: Warehouse[];
    total: number;
    per_page: number;
    current_page: number;
    has_more_pages: boolean;
}

const DELIVERIES_QUERY = /* GraphQL */ `
    query GetDeliveries($type: String, $localityId: Int) {
        deliveries(type: $type, localityId: $localityId) {
            id
            type
            driver
            showDeliveryTime
            name
            disabled
            needForAvailable
            deliveryCost
            elapsedForFree
        }
    }
`;

const DELIVERY_TIMES_QUERY = /* GraphQL */ `
    query GetDeliveryTimes($id: Int!, $date: String!) {
        deliveryTimes(id: $id, date: $date)
    }
`;

const WAREHOUSES_QUERY = /* GraphQL */ `
    query GetWarehouses($localityId: Int, $search: String, $limit: Int, $page: Int) {
        warehouses(localityId: $localityId, search: $search, limit: $limit, page: $page) {
            data {
                ref
                name
                lat
                lng
                schedule {
                    days
                    workTime
                }
            }
            total
            per_page
            current_page
            has_more_pages
        }
    }
`;

const ADD_USER_PICKUP_POINT_MUTATION = /* GraphQL */ `
    mutation AddUserPickupPoint($type: String!, $key: String!) {
        addUserPickupPoint(type: $type, key: $key) {
            id
            isDefault
            type
            name
            schedule {
                days
                workTime
            }
        }
    }
`;

const DELETE_USER_PICKUP_POINT_MUTATION = /* GraphQL */ `
    mutation DeleteUserPickupPoint($id: Int!) {
        deleteUserPickupPoint(id: $id)
    }
`;

const USER_PICKUP_POINTS_QUERY = /* GraphQL */ `
    query GetUserPickupPoints($type: String) {
        userPickupPoints(type: $type) {
            id
            isDefault
            type
            name
            schedule {
                days
                workTime
            }
        }
    }
`;

export async function getDeliveriesApi(
    type?: string,
    localityId?: number,
    lang?: string
): Promise<Delivery[]> {
    const data = await gqlRequest<{ deliveries: Delivery[] }>(
        DELIVERIES_QUERY,
        { type, localityId },
        { lang }
    );
    return data.deliveries;
}

export async function getDeliveryTimesApi(
    id: number,
    date: string,
    lang?: string
): Promise<string[]> {
    const data = await gqlRequest<{ deliveryTimes: string[] }>(
        DELIVERY_TIMES_QUERY,
        { id, date },
        { lang }
    );
    return data.deliveryTimes;
}

export async function getWarehousesApi(
    localityId?: number,
    search?: string,
    limit: number = 50,
    page: number = 1,
    lang?: string
): Promise<WarehousePagination> {
    const data = await gqlRequest<{ warehouses: WarehousePagination }>(
        WAREHOUSES_QUERY,
        { localityId, search, limit, page },
        { lang }
    );
    return data.warehouses;
}

export async function addUserPickupPointApi(
    type: string,
    key: string,
    token: string,
    lang?: string
): Promise<UserPickupPoint> {
    const data = await gqlRequest<{ addUserPickupPoint: UserPickupPoint }>(
        ADD_USER_PICKUP_POINT_MUTATION,
        { type, key },
        { token, lang }
    );
    return data.addUserPickupPoint;
}

export async function deleteUserPickupPointApi(
    id: number,
    token: string,
    lang?: string
): Promise<boolean> {
    const data = await gqlRequest<{ deleteUserPickupPoint: boolean }>(
        DELETE_USER_PICKUP_POINT_MUTATION,
        { id },
        { token, lang }
    );
    return data.deleteUserPickupPoint;
}

export async function getUserPickupPointsApi(
    type?: string,
    token?: string,
    lang?: string
): Promise<UserPickupPoint[]> {
    const data = await gqlRequest<{ userPickupPoints: UserPickupPoint[] }>(
        USER_PICKUP_POINTS_QUERY,
        { type },
        { token, lang }
    );
    return data.userPickupPoints;
}
