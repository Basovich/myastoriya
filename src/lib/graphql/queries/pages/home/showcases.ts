import { gqlRequest } from "../../../client";

export interface Showcase {
    id: string;
    name: string;
    productsCount?: number;
}

const SHOWCASES_QUERY = /* GraphQL */ `
    query Showcases {
        showcases {
            id
            name
            productsCount
        }
    }
`;

export async function getShowcasesApi(lang?: string): Promise<Showcase[]> {
    const data = await gqlRequest<{ showcases: Showcase[] }>(
        SHOWCASES_QUERY,
        undefined,
        { next: { revalidate: 3600 }, lang },
    );
    return data.showcases ?? [];
}
