import { gqlRequest } from "../client";

export interface UserAddress {
    id: string;
    isDefault: boolean;
    city: string;
    streetId?: number;
    street?: string;
    house: string;
    apartment?: number;
    entrance?: number;
    floor?: number;
}

const ADDRESS_FRAGMENT = `
    fragment AddressFields on UserAddress {
        id
        isDefault
        city
        streetId
        street
        house
        apartment
        entrance
        floor
    }
`;

export const getUserAddressesApi = async (token: string): Promise<UserAddress[]> => {
    const query = `
        query GetUserAddresses {
            userAddresses {
                ...AddressFields
            }
        }
        ${ADDRESS_FRAGMENT}
    `;
    const res = await gqlRequest<{ userAddresses: UserAddress[] }>(query, {}, { token });
    return res.userAddresses;
};

export const createUserAddressApi = async (
    data: {
        isDefault?: boolean;
        city: string;
        streetId?: number;
        street?: string;
        house: string;
        apartment?: number;
        entrance?: number;
        floor?: number;
    },
    token: string
): Promise<UserAddress> => {
    const mutation = `
        mutation CreateUserAddress(
            $isDefault: Boolean,
            $city: String!,
            $streetId: Int,
            $street: String,
            $house: String!,
            $apartment: Int,
            $entrance: Int,
            $floor: Int
        ) {
            createUserAddress(
                isDefault: $isDefault,
                city: $city,
                streetId: $streetId,
                street: $street,
                house: $house,
                apartment: $apartment,
                entrance: $entrance,
                floor: $floor
            ) {
                ...AddressFields
            }
        }
        ${ADDRESS_FRAGMENT}
    `;
    const res = await gqlRequest<{ createUserAddress: UserAddress }>(mutation, data, { token });
    return res.createUserAddress;
};

export const deleteUserAddressApi = async (id: string, token: string): Promise<boolean> => {
    const mutation = `
        mutation DeleteUserAddress($id: ID!) {
            deleteUserAddress(id: $id)
        }
    `;
    const res = await gqlRequest<{ deleteUserAddress: boolean }>(mutation, { id }, { token });
    return res.deleteUserAddress;
};

export const markUserAddressAsDefaultApi = async (id: string, token: string): Promise<boolean> => {
    const mutation = `
        mutation MarkUserAddressAsDefault($id: Int!) {
            markUserAddressAsDefault(id: $id)
        }
    `;
    // Note: markUserAddressAsDefault expects Int! in schema_tables.md, but id in UserAddress is string (ID).
    // I'll use parseInt if it's a numeric string, otherwise I might need to check if schema expects ID! or Int!
    // schema_tables.md says Int!. Let's follow that.
    const res = await gqlRequest<{ markUserAddressAsDefault: boolean }>(mutation, { id: parseInt(id, 10) }, { token });
    return res.markUserAddressAsDefault;
};
