import { ProductCategory } from '@/lib/graphql/queries/products';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryIndexEntry {
    node: ProductCategory;
    parent: ProductCategory | null;
    grandParent: ProductCategory | null;
    level: 1 | 2 | 3;
}

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

// ---------------------------------------------------------------------------
// buildCategoryIndex
// ---------------------------------------------------------------------------

/**
 * Recursively builds a flat index of all categories in the tree.
 * Each entry stores the node, its parent, grandparent, and depth level (1–3).
 * If a category appears at multiple levels (API duplicates), keeps the shallowest.
 */
export function buildCategoryIndex(
    categories: ProductCategory[],
): Map<string, CategoryIndexEntry> {
    const index = new Map<string, CategoryIndexEntry>();

    const setEntry = (
        node: ProductCategory,
        parent: ProductCategory | null,
        grandParent: ProductCategory | null,
        level: 1 | 2 | 3,
    ) => {
        const existing = index.get(node.id);
        if (!existing || level < existing.level) {
            index.set(node.id, { node, parent, grandParent, level });
        }
    };

    for (const cat of categories) {
        setEntry(cat, null, null, 1);
        for (const sub of cat.children ?? []) {
            setEntry(sub, cat, null, 2);
            for (const subsub of sub.children ?? []) {
                setEntry(subsub, sub, cat, 3);
            }
        }
    }

    return index;
}

// ---------------------------------------------------------------------------
// getCategoryHref
// ---------------------------------------------------------------------------

/**
 * Returns the canonical href for a category based on its position in the tree:
 *   Level 1 (no parent)            → /{slug}
 *   Level 2 (has parent)           → /{parentSlug}/{slug}
 *   Level 3 (has parent + gParent) → /catalog/{slug}
 */
export function getCategoryHref(
    node: ProductCategory,
    parent?: ProductCategory | null,
    grandParent?: ProductCategory | null,
): string {
    if (grandParent && parent) {
        return `/catalog/${grandParent.slug}/${parent.slug}/${node.slug}`;
    }
    if (parent) {
        return `/catalog/${parent.slug}/${node.slug}`;
    }
    return `/catalog/${node.slug}`;
}

// ---------------------------------------------------------------------------
// buildCategoryBreadcrumbs
// ---------------------------------------------------------------------------

/**
 * Builds breadcrumb items for a product page based on its categoryId.
 * Uses the shallowest occurrence of the category in the tree index.
 */
export function buildCategoryBreadcrumbs(
    categoryId: number | string | null | undefined,
    categoryIndex: Map<string, CategoryIndexEntry>,
): BreadcrumbItem[] {
    const base: BreadcrumbItem[] = [{ label: 'Головна', href: '/' }];
    if (!categoryId) return base;

    const entry = categoryIndex.get(String(categoryId));
    if (!entry) return base;

    const { node, parent, grandParent, level } = entry;

    if (level === 1) {
        return [...base, { label: node.name, href: `/catalog/${node.slug}` }];
    }

    if (level === 2 && parent) {
        return [
            ...base,
            { label: parent.name, href: `/catalog/${parent.slug}` },
            { label: node.name, href: `/catalog/${parent.slug}/${node.slug}` },
        ];
    }

    if (level === 3 && parent && grandParent) {
        return [
            ...base,
            { label: grandParent.name, href: `/catalog/${grandParent.slug}` },
            { label: parent.name, href: `/catalog/${grandParent.slug}/${parent.slug}` },
            { label: node.name, href: `/catalog/${grandParent.slug}/${parent.slug}/${node.slug}` },
        ];
    }

    return base;
}

// ---------------------------------------------------------------------------
// shouldRedirectForLocality
// ---------------------------------------------------------------------------

/**
 * Returns true when the page should redirect due to no products being available
 * for the user's selected locality.
 *
 * Redirect only fires when:
 *  - it's the first page (page 1)
 *  - no user-applied filters or sort are active (to avoid redirecting on user's own empty search)
 *  - the backend returned 0 products
 *
 * The main catalog (/catalog) always has products for any locality — use it as the safe fallback.
 */
export function shouldRedirectForLocality(
    productsCount: number,
    page: number,
    hasActiveFilters: boolean,
): boolean {
    return page === 1 && !hasActiveFilters && productsCount === 0;
}

