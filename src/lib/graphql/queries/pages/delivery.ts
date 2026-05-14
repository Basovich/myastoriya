import { gqlRequest } from "../../client";

export interface OrderingInfoBlock {
    id: string;
    name: string;
    text: string[];
    type: string;
    icon?: string;
}

export interface OrderingInfoBlocksResponse {
    orderingInfoBlocks: OrderingInfoBlock[];
}

export const GET_POLICY_BLOCKS = `
    query getPolicyBlocks($type: String!) {
        orderingInfoBlocks(type: $type) {
            id
            name
            text
            type
            icon
        }
    }
`;

export async function getPolicyBlocksApi(type: string, lang: string): Promise<OrderingInfoBlock[]> {
    const data = await gqlRequest<OrderingInfoBlocksResponse>(GET_POLICY_BLOCKS, { type }, {
        lang,
        next: { revalidate: 3600 }
    });
    return data.orderingInfoBlocks;
}
