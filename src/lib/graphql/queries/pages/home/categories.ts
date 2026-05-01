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
        square1x: string | null;
        square2x: string | null;
        square3x: string | null;
        rectangle1x: string | null;
        rectangle2x: string | null;
        rectangle3x: string | null;
        big1x: string | null;
        big2x: string | null;
        big3x: string | null;
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
                square1x
                square2x
                square3x
                rectangle1x
                rectangle2x
                rectangle3x
                big1x
                big2x
                big3x
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
