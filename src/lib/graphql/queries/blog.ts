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
    image?: BlogImage | null;
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
            }
            recipes {
                id
                name
                slug
                rating
                image {
                    url {
                        size1x
                        size2x
                    }
                }
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
            blogsCount
        }
    }
`;

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function getBlogsApi(filter?: BlogsFilter, lang?: string): Promise<BlogsPagination> {
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
        { next: { revalidate: 60 }, lang },
    );
    return data.blogs;
}

export async function getBlogBySlugApi(slug: string, lang?: string): Promise<BlogPost | null> {
    const data = await gqlRequest<{ blog: BlogPost | null }>(
        BLOG_BY_SLUG_QUERY,
        { slug },
        { next: { revalidate: 60 }, lang },
    );
    return data.blog;
}

export async function getBlogTypesApi(): Promise<BlogType[]> {
    try {
        const data = await gqlRequest<{ blogTypes: BlogType[] }>(
            BLOG_TYPES_QUERY,
            {},
            { next: { revalidate: 60 } },
        );
        return data.blogTypes;
    } catch (error) {
        if (typeof window === 'undefined') {
            const Sentry = require("@sentry/nextjs");
            Sentry.captureException(error, {
                tags: { component: 'getBlogTypesApi', bug: 'sorted_method_undefined' }
            });
        }
        console.warn('[Blog] Failed to fetch blog types from API, using static fallback:', error);
        // Fallback to known types if backend is broken
        return [
            { id: '4', name: 'Поради', slug: 'sovety', title: null, h1: null, keywords: null, description: null, blogsCount: 0 },
            { id: '3', name: 'Статті', slug: 'stati', title: null, h1: null, keywords: null, description: null, blogsCount: 0 },
            { id: '2', name: 'Рецепти', slug: 'recepty', title: null, h1: null, keywords: null, description: null, blogsCount: 0 },
        ];
    }
}

export async function hasBlogsApi(lang?: string): Promise<boolean> {
    try {
        const blogs = await getBlogsApi({ limit: 1 }, lang);
        return blogs.data.length > 0;
    } catch {
        return false;
    }
}
