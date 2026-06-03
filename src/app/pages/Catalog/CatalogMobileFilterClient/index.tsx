"use client";

import { useState } from 'react';
import FilterModal from '@/app/pages/Catalog/CatalogModal';

interface CatalogMobileFilterProps {
    sortBy: string;
    children: React.ReactNode;
}

export default function CatalogMobileFilterClient({
    sortBy,
    children,
}: CatalogMobileFilterProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return (
        <>
            {/* The children is the filter button, we clone it or we just expose a trigger context. 
                Actually, it's easier to just pass a wrapper around the button. 
                But let's just use an onClick prop on the button from CatalogToolbarClient.
                Wait! CatalogToolbarClient has the filter button inside it.
                So we can just put FilterModal inside CatalogToolbarClient!
            */}
            <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                sortBy={sortBy}
            />
            {/* 
                We need to trigger setIsFilterOpen from CatalogToolbarClient.
                So let's move FilterModal into CatalogToolbarClient.
            */}
        </>
    );
}
