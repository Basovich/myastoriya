export type BlogCategorySegment = 'recipe' | 'article';

export interface BlogItemLike {
    slug: string;
    blogType?: {
        slug?: string | null;
        name?: string | null;
    } | null;
}

/**
 * Returns the SEO URL category segment ('recipe' | 'article') for a given blog post or blogType slug.
 * 'recepty' / 'recipe' -> 'recipe'
 * 'stati' / 'sovety' / 'article' -> 'article'
 */
export function getBlogCategorySegment(itemOrSlug?: BlogItemLike | string | null): BlogCategorySegment {
    if (!itemOrSlug) return 'article';

    let rawSlug = '';
    if (typeof itemOrSlug === 'string') {
        rawSlug = itemOrSlug;
    } else {
        rawSlug = itemOrSlug.blogType?.slug || '';
    }

    const lower = rawSlug.toLowerCase();
    if (lower === 'recepty' || lower === 'recipe') {
        return 'recipe';
    }
    return 'article';
}

/**
 * Maps a URL category segment ('recipe' | 'article') to the backend API typeSlug ('recepty' | 'stati').
 */
export function mapUrlCategoryToApiTypeSlug(categorySegment: string): string | null {
    const lower = (categorySegment || '').toLowerCase();
    if (lower === 'recipe' || lower === 'recepty') {
        return 'recepty';
    }
    if (lower === 'article' || lower === 'stati' || lower === 'sovety') {
        return 'stati';
    }
    return null;
}

/**
 * Builds the canonical relative URL for a single blog post.
 * e.g. /blog/recipe/sup-z-frikadelkami-tri-domashni-retsepti
 */
export function getBlogPostHref(item: BlogItemLike): string {
    const category = getBlogCategorySegment(item);
    return `/blog/${category}/${item.slug}`;
}
