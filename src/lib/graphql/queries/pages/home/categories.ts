import { gqlRequest } from "../../../client";

export interface PopularCategory {
    id: string;
    name: string;
    slug?: string | null;
    menuIcon?: {
        icon1x: string | null;
        icon2x: string | null;
        icon3x: string | null;
    } | null;
    image: {
        big2x: string;
    } | null;
}

const POPULAR_CATEGORIES_QUERY = /* GraphQL */ `
    query PopularCategories {
        popularCategories {
            id
            name
            slug
            menuIcon {
                icon1x
                icon2x
                icon3x
            }
            image {
                big2x
            }
        }
    }
`;

export async function getPopularCategoriesApi(lang?: string): Promise<PopularCategory[]> {
    const data = await gqlRequest<{ popularCategories: PopularCategory[] }>(
        POPULAR_CATEGORIES_QUERY,
        undefined,
        { next: { revalidate: 3600 }, lang },
    );
    return data.popularCategories ?? [];
}
