import { gqlRequest } from '../client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlogImageUrl {
    size1x: string;
    size2x: string;
    size3x: string;
}

export interface BlogImage {
    url: BlogImageUrl;
}

export interface BlogType {
    id: string;
    name: string;
    slug: string;
    title: string | null;
    h1: string | null;
    keywords: string | null;
    description: string | null;
    blogsCount: number;
}

export interface BlogProduct {
    id: string;
    categoryId: string | null;
    siteId: string | null;
    productType: string | null;
    oldCost: number | null;
    cost: number;
    unit: string | null;
    multiplier: number | null;
    rating: number | null;
    hasCostVariants: boolean;
    hasGift: boolean;
    giftText: string | null;
    inLikes: boolean;
    name: string;
    image_alt: string | null;
    image_title: string | null;
    available: boolean;
    is_new: boolean;
}

export interface RelatedBlog {
    id: string;
    name: string;
    slug: string;
    text: string | null;
    title: string | null;
    h1: string | null;
    keywords: string | null;
    description: string | null;
    publishedAt: string | null;
    likesCount: number;
}

export interface BlogRecipe {
    id: string;
    name: string;
    slug: string;
    text: string | null;
    rating: number | null;
}

export interface BlogPost {
    id: string;
    name: string;
    slug: string;
    text: string | null;
    title: string | null;
    h1: string | null;
    keywords: string | null;
    description: string | null;
    publishedAt: string | null;
    likesCount: number;
    image: BlogImage | null;
    blogType: BlogType | null;
    products: BlogProduct[];
    relatedBlogs: RelatedBlog[];
    recipes: BlogRecipe[];
}

export interface BlogsFilter {
    typeId?: number | null;
    typeSlug?: string | null;
    search?: string | null;
    sort?: string | null;
    limit?: number | null;
    page?: number | null;
}

export interface BlogsPagination {
    per_page: number;
    current_page: number;
    from: number | null;
    to: number | null;
    has_more_pages: boolean;
    data: BlogPost[];
}

// ---------------------------------------------------------------------------
// Fragments
// ---------------------------------------------------------------------------

const BLOG_POST_PREVIEW_FRAGMENT = /* GraphQL */ `
    id
    name
    slug
    publishedAt
    likesCount
    image {
        url {
            size1x
            size2x
        }
    }
    blogType {
        id
        name
        slug
    }
`;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const BLOGS_QUERY = /* GraphQL */ `
    query Blogs(
        $typeId: Int
        $typeSlug: String
        $search: String
        $sort: String
        $limit: Int
        $page: Int
    ) {
        blogs(
            typeId: $typeId
            typeSlug: $typeSlug
            search: $search
            sort: $sort
            limit: $limit
            page: $page
        ) {
            per_page
            current_page
            from
            to
            has_more_pages
            data {
                ${BLOG_POST_PREVIEW_FRAGMENT}
            }
        }
    }
`;

const BLOG_BY_SLUG_QUERY = /* GraphQL */ `
    query Blog($slug: String!) {
        blog(slug: $slug) {
            id
            name
            slug
            text
            title
            h1
            keywords
            description
            publishedAt
            likesCount
            image {
                url {
                    size1x
                    size2x
                    size3x
                }
            }
            blogType {
                id
                name
                slug
            }
            products {
                id
                name
                cost
                oldCost
                unit
                rating
                hasCostVariants
                hasGift
                giftText
                inLikes
                available
                is_new
                image_alt
            }
            relatedBlogs {
                ${BLOG_POST_PREVIEW_FRAGMENT}
            }
            recipes {
                id
                name
                slug
                rating
            }
        }
    }
`;

const BLOG_TYPES_QUERY = /* GraphQL */ `
    query BlogTypes {
        blogTypes {
            id
            name
            slug
        }
    }
`;

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function getBlogsApi(filter?: BlogsFilter): Promise<BlogsPagination> {
    const data = await gqlRequest<{ blogs: BlogsPagination }>(
        BLOGS_QUERY,
        {
            typeId: filter?.typeId ?? null,
            typeSlug: filter?.typeSlug ?? null,
            search: filter?.search ?? null,
            sort: filter?.sort ?? null,
            limit: filter?.limit ?? null,
            page: filter?.page ?? null,
        },
        { next: { revalidate: 60 } },
    );
    return data.blogs;
}

export async function getBlogBySlugApi(slug: string): Promise<BlogPost | null> {
    const data = await gqlRequest<{ blog: BlogPost | null }>(
        BLOG_BY_SLUG_QUERY,
        { slug },
        { next: { revalidate: 60 } },
    );
    return data.blog;
}

export async function getBlogTypesApi(): Promise<BlogType[]> {
    return [];
}
