'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { ProductCategory } from '@/lib/graphql/queries/products';
import { buildCategoryIndex, CategoryIndexEntry } from '@/utils/category-url';

interface CategoryContextType {
    categories: ProductCategory[];
    categoryIndex: Map<string, CategoryIndexEntry>;
}

const CategoryContext = createContext<CategoryContextType | null>(null);

export function CategoryProvider({
    children,
    initialCategories = [],
}: {
    children: React.ReactNode;
    initialCategories?: ProductCategory[];
}) {
    const value = useMemo(() => {
        const categoryIndex = buildCategoryIndex(initialCategories);
        return {
            categories: initialCategories,
            categoryIndex,
        };
    }, [initialCategories]);

    return (
        <CategoryContext.Provider value={value}>
            {children}
        </CategoryContext.Provider>
    );
}

export function useCategoryTree() {
    const context = useContext(CategoryContext);
    if (!context) {
        return {
            categories: [] as ProductCategory[],
            categoryIndex: new Map<string, CategoryIndexEntry>(),
        };
    }
    return context;
}

export function getProductHref(
    slugOrId: string | undefined,
    categoryId?: number | string | null,
    categoryIndex?: Map<string, CategoryIndexEntry>,
): string {
    if (!slugOrId) return '/catalog';
    if (!categoryId || !categoryIndex) return `/catalog/${slugOrId}`;
    const entry = categoryIndex.get(String(categoryId));
    if (!entry) return `/catalog/${slugOrId}`;

    const { node, parent, grandParent, level } = entry;
    if (level === 1) {
        return `/catalog/${node.slug}/${slugOrId}`;
    }
    if (level === 2 && parent) {
        return `/catalog/${parent.slug}/${node.slug}/${slugOrId}`;
    }
    if (level === 3 && parent && grandParent) {
        return `/catalog/${grandParent.slug}/${parent.slug}/${node.slug}/${slugOrId}`;
    }
    return `/catalog/${node.slug}/${slugOrId}`;
}

export function useProductHref(
    slugOrId: string | undefined,
    categoryId?: number | string | null,
): string {
    const { categoryIndex } = useCategoryTree();
    return useMemo(() => {
        return getProductHref(slugOrId, categoryId, categoryIndex);
    }, [slugOrId, categoryId, categoryIndex]);
}
