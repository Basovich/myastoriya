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
    // categoryId and categoryIndex are kept for backward compatibility with existing call sites
    void categoryId;
    void categoryIndex;
    if (!slugOrId) return '/catalog';
    return `/product/${slugOrId}`;
}

export function useProductHref(
    slugOrId: string | undefined,
    categoryId?: number | string | null,
): string {
    // categoryId is kept for backward compatibility with existing call sites
    void categoryId;
    return useMemo(() => {
        return getProductHref(slugOrId);
    }, [slugOrId]);
}
