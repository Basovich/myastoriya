"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import s from "../CatalogContent/CatalogContent.module.scss"; 
import SortSelect from "@/app/components/ui/SortSelect/SortSelect";
import ViewToggle from "@/app/components/ui/ViewToggle/ViewToggle";
import type { ViewType } from "@/app/components/ui/ViewToggle/ViewToggle";
import FilterModal from "@/app/pages/Catalog/CatalogModal";
import type { FilterBlock, FilterStateInput } from "@/lib/graphql";

interface CatalogToolbarProps {
    sortBy: string;
    view: ViewType;
    sortOptions: string[];
    categoryId?: number;
    className?: string;
    hideFilter?: boolean;
    sortLabel?: string;
    filterLabel?: string;
    clearLabel?: string;
    filterBlocks?: FilterBlock[];
    activeFilters?: FilterStateInput[];
}

export default function CatalogToolbarClient({
    sortBy,
    view,
    sortOptions,
    categoryId,
    className,
    hideFilter = false,
    sortLabel = "Сортувати:",
    filterLabel = "Фільтр",
    clearLabel = "Очистити",
    filterBlocks,
    activeFilters,
}: CatalogToolbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const updateParams = (key: string, value: string, resetPage = true) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        if (resetPage) {
            params.set("page", "1");
        }
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('catalog-loading-start'));
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <>
            <div className={clsx(s.toolbar, className)}>
                <SortSelect
                    label={sortLabel}
                    value={sortBy || sortOptions[0]}
                    options={sortOptions}
                    onChange={(val) => updateParams("sort", val)}
                    className={s.sortWrap}
                />

                {!hideFilter && (
                    <button
                        id="filter-btn"
                        type="button"
                        className={s.filterBtn}
                        onClick={() => setIsFilterOpen(true)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_2764_1074)">
                                <path d="M21 18V21H19V18H17V16H23V18H21ZM5 18V21H3V18H1V16H7V18H5ZM11 6V3H13V6H15V8H9V6H11ZM11 10H13V21H11V10ZM3 14V3H5V14H3ZM19 14V3H21V14H19Z" fill="black" />
                            </g>
                            <circle cx="19.957" cy="6" r="4" fill="#E20B1C" />
                            <defs>
                                <clipPath id="clip0_2764_1074">
                                    <rect width="24" height="24" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        <span className={s.filterBtnText}>{filterLabel}</span>
                    </button>
                )}

                <ViewToggle 
                    view={view} 
                    onViewChange={(newView) => updateParams("view", newView, false)} 
                    className={s.viewToggle} 
                />
            </div>
            
            <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                sortBy={sortBy}
                onSortChange={(val) => updateParams("sort", val)}
                categoryId={categoryId}
                sortOptions={sortOptions}
                filterLabel={filterLabel}
                clearLabel={clearLabel}
                filterBlocks={filterBlocks}
                activeFilters={activeFilters}
            />
        </>
    );
}
