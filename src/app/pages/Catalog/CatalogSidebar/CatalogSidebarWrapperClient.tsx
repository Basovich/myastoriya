'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import CatalogSidebar from './index';
import type { FilterBlock, FilterStateInput } from '@/lib/graphql';

interface CatalogSidebarWrapperClientProps {
    sortBy?: string;
    sortOptions?: string[];
    categoryId?: number;
    filterBlocks?: FilterBlock[];
    activeFilters?: FilterStateInput[];
    isSubcategory?: boolean;
}

export default function CatalogSidebarWrapperClient({
    sortBy,
    sortOptions,
    categoryId,
    filterBlocks,
    activeFilters,
    isSubcategory,
}: CatalogSidebarWrapperClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleSortChange = (newSort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (newSort) {
            params.set('sort', newSort);
        } else {
            params.delete('sort');
        }
        params.set('page', '1');

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('catalog-loading-start'));
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <CatalogSidebar
            sortBy={sortBy}
            onSortChange={handleSortChange}
            sortOptions={sortOptions}
            categoryId={categoryId}
            filterBlocks={filterBlocks}
            activeFilters={activeFilters}
            isSubcategory={isSubcategory}
        />
    );
}
