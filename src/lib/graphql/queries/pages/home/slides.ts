import { gqlRequest } from "../../../client";

export interface SlideImage {
    size1x?: string | null;
    size2x?: string | null;
    size3x?: string | null;
}

export interface SlideImageWeb {
    desktop?: string | null;
    laptop?: string | null;
    tablet?: string | null;
}

export interface SlideLinkTo {
    type?: string | null;
    id?: string | null;
}

export interface Slide {
    id: string;
    name: string | null;
    image?: SlideImage | null;
    imageWeb?: SlideImageWeb | null;
    linkTo?: SlideLinkTo | null;
}

export const SLIDES_QUERY = /* GraphQL */ `
    query Slides($slide: String!) {
        slides(slide: $slide) {
            id
            name
            image {
                size1x
                size2x
                size3x
            }
            imageWeb {
                desktop
                laptop
                tablet
            }
            linkTo {
                type
                id
            }
        }
    }
`;

export async function getSlidesApi(slideType: string = "main", lang?: string): Promise<Slide[]> {
    const data = await gqlRequest<{ slides: Slide[] }>(
        SLIDES_QUERY,
        { slide: slideType },
        { next: { revalidate: 3600 }, lang },
    );
    return data.slides ?? [];
}
