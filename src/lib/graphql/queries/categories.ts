import { gqlRequest } from '../client';

export interface PopularCategory {
    id: string;
    name: string;
    image: {
        big2x: string;
    } | null;
}

const POPULAR_CATEGORIES_QUERY = /* GraphQL */ `
    query PopularCategories {
        popularCategories {
            id
            name
            image {
                big2x
            }
        }
    }
`;

export async function getPopularCategoriesApi(): Promise<PopularCategory[]> {
    const data = await gqlRequest<{ popularCategories: PopularCategory[] }>(
        POPULAR_CATEGORIES_QUERY,
        undefined,
        { next: { revalidate: 3600 } },
    );
    return data.popularCategories;
}
