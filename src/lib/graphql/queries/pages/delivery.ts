import { gqlRequest } from "../../client";

export interface OrderingInfoBlockImage {
    size1x?: string;
    size2x?: string;
    size3x?: string;
}

export interface OrderingInfoBlock {
    id: string;
    name: string;
    text: string[];
    textWeb?: string[];
    type: string;
    icon?: string;
    image?: OrderingInfoBlockImage;
}

export interface OrderingInfoBlocksResponse {
    orderingInfoBlocks: OrderingInfoBlock[];
}

export const GET_ORDERING_INFO_BLOCKS = `
    query getOrderingInfoBlocks($type: String!) {
        orderingInfoBlocks(type: $type) {
            id
            name
            text
            textWeb
            type
            icon
            image {
                size1x
                size2x
                size3x
            }
        }
    }
`;

export async function getPolicyBlocksApi(lang: string): Promise<OrderingInfoBlock[]> {
    const data = await gqlRequest<OrderingInfoBlocksResponse>(GET_ORDERING_INFO_BLOCKS, { type: "payment" }, {
        lang,
        next: { revalidate: 3600 },
        public: true
    });
    return data.orderingInfoBlocks;
}

export async function getDeliveryBlocksApi(lang: string): Promise<OrderingInfoBlock[]> {
    const data = await gqlRequest<OrderingInfoBlocksResponse>(GET_ORDERING_INFO_BLOCKS, { type: "delivery" }, {
        lang,
        next: { revalidate: 3600 },
        public: true
    });
    return data.orderingInfoBlocks;
}
