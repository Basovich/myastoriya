import { gqlRequest } from "../../../client";

export interface Special {
    id: string;
    title: string;
    oldCost?: number | null;
    cost?: number | null;
    amount?: number | null;
    discountType?: string | null;
    images?: {
        url: {
            grid1x?: string | null;
            grid2x?: string | null;
            grid3x?: string | null;
        } | null;
    }[] | null;
}

export interface SpecialsResponse {
    specials: {
        data: Special[];
    };
}

const SPECIALS_QUERY = /* GraphQL */ `
    query Specials($limit: Int) {
        specials(limit: $limit) {
            data {
                id
                title
                oldCost
                cost
                amount
                discountType
                images {
                    url {
                        grid2x
                        grid3x
                    }
                }
            }
        }
    }
`;

export async function getSpecialsApi(limit = 10, lang?: string): Promise<Special[]> {
    const data = await gqlRequest<SpecialsResponse>(
        SPECIALS_QUERY,
        { limit },
        { next: { revalidate: 3600 }, lang }
    );
    return data.specials?.data || [];
}
