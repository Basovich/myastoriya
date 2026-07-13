import { gqlRequest } from "@/lib/graphql/client";

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

export async function getShowcasesApi(lang?: string, token?: string): Promise<Showcase[]> {
    const data = await gqlRequest<{ showcases: Showcase[] }>(
        SHOWCASES_QUERY,
        undefined,
        { 
            lang,
            token,
            ...(token ? { cache: 'no-store' } : { next: { revalidate: 3600 } })
        },
    );
    return data.showcases ?? [];
}
