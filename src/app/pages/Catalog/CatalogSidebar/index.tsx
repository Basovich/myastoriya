'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation';
import s from './FilterSidebar.module.scss';
import FilterGroup from '@/app/components/ui/FilterGroup/FilterGroup';
import FilterCheckbox from '@/app/components/ui/FilterCheckbox/FilterCheckbox';
import FilterPill from '@/app/components/ui/FilterPill/FilterPill';
import PriceRange from '@/app/components/ui/PriceRange/PriceRange';
import Button from "@/app/components/ui/Button/Button";
import clsx from 'clsx';
import type { FilterBlock, FilterStateInput } from '@/lib/graphql';
import {
    isRangeBlock,
    buildFilterParams,
    clearFilterParams,
    countActiveFilterValues,
    getFilterForBlock,
    setFilterValue,
    removeFilter,
    hasActiveFilters,
} from '@/utils/filter-params';

interface CatalogSidebarProps {
    onApply?: () => void;
    onClose?: () => void;
    sortBy?: string;
    onSortChange?: (value: string) => void;
    onClearAll?: () => void;
    onModifiedChange?: (modified: boolean) => void;
    categoryId?: number;
    sortOptions?: string[];
    filterBlocks?: FilterBlock[];
    activeFilters?: FilterStateInput[];
}

const SORT_OPTIONS = [
    'За популярністю',
    'За зниженням ціни',
    'За зростанням ціни',
    'За рейтингом',
    'За обговорюваністю',
    'За датою',
];

export default function CatalogSidebar({
    onApply,
    onClose,
    sortBy,
    onSortChange,
    onClearAll,
    onModifiedChange,
    categoryId,
    sortOptions,
    filterBlocks,
    activeFilters,
}: CatalogSidebarProps) {
    const routeParams = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const lang = routeParams?.lang === 'ru' ? 'ru' : 'ua';
    const optionsToUse = sortOptions || SORT_OPTIONS;
    const defaultSortOption = optionsToUse[0] || 'За популярністю';

    // Локальний стан фільтрів (pending до натискання «Застосувати»)
    const [pendingFilters, setPendingFilters] = useState<FilterStateInput[]>(activeFilters ?? []);

    // Динамічні блоки фільтрів, отримані через /api/catalog/products-filter (з forwarded cookies)
    const [dynamicBlocks, setDynamicBlocks] = useState<FilterBlock[]>(filterBlocks ?? []);
    const [isLoadingFilters, setIsLoadingFilters] = useState(!filterBlocks || filterBlocks.length === 0);

    useEffect(() => {
        if (!categoryId) {
            setIsLoadingFilters(false);
            return;
        }
        setIsLoadingFilters(true);
        const langParam = routeParams?.lang === 'ru' ? 'ru' : 'ua';
        fetch(`/api/catalog/products-filter?categoryId=${categoryId}&lang=${langParam}`)
            .then(r => r.json())
            .then(data => {
                if (data.blocks && Array.isArray(data.blocks)) {
                    setDynamicBlocks(data.blocks);
                }
            })
            .catch(() => { /* залишаємо dynamicBlocks порожніми */ })
            .finally(() => setIsLoadingFilters(false));
    }, [categoryId, routeParams?.lang]);

    // Синхронізуємо з props при скиданні через key={clearTrigger}
    useEffect(() => {
        setPendingFilters(activeFilters ?? []);
    }, [activeFilters]);

    // --- Helpers ---

    const toggleListOption = useCallback((blockKey: string, optionKey: string) => {
        setPendingFilters(prev => {
            const current = getFilterForBlock(prev, blockKey);
            const currentValues = current?.values ?? [];
            const newValues = currentValues.includes(optionKey)
                ? currentValues.filter(v => v !== optionKey)
                : [...currentValues, optionKey];

            if (newValues.length === 0) {
                return removeFilter(prev, blockKey);
            }
            return setFilterValue(prev, { key: blockKey, values: newValues });
        });
    }, []);

    const setPriceRange = useCallback((blockKey: string, min: number, max: number, blockMin: number, blockMax: number) => {
        // Якщо значення = межам блоку — видаляємо фільтр (скидаємо)
        if (min === blockMin && max === blockMax) {
            setPendingFilters(prev => removeFilter(prev, blockKey));
        } else {
            setPendingFilters(prev => setFilterValue(prev, { key: blockKey, minValue: min, maxValue: max }));
        }
    }, []);

    const clearPriceRange = useCallback((blockKey: string) => {
        setPendingFilters(prev => removeFilter(prev, blockKey));
    }, []);

    // --- isModified ---

    const isPendingChanged = JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters ?? []);
    const isSortChanged = sortBy !== undefined && sortBy !== defaultSortOption;
    const isModified = isPendingChanged || isSortChanged || hasActiveFilters(pendingFilters);

    useEffect(() => {
        onModifiedChange?.(isModified);
    }, [isModified, onModifiedChange]);

    // --- Actions ---

    const handleApply = () => {
        if (!isPendingChanged && !isSortChanged) return;
        const params = buildFilterParams(pendingFilters, new URLSearchParams(searchParams.toString()), dynamicBlocks);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        onApply?.();
        onClose?.();
    };

    const handleClear = () => {
        setPendingFilters([]);
        const params = clearFilterParams(new URLSearchParams(searchParams.toString()));
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        onClearAll?.();
        onClose?.();
    };

    const selectedCount = countActiveFilterValues(pendingFilters);

    return (
        <div className={s.sidebar}>
            <div className={s.filtersWrapper}>
                {/* Мобільний блок: Сортування */}
                <div className={s.onlyMobile}>
                    <FilterGroup title={sortBy || defaultSortOption} initialOpen={true}>
                        <div className={s.sortOptions}>
                            {optionsToUse.map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    className={clsx(s.sortOption, (sortBy === option || (!sortBy && option === defaultSortOption)) && s.sortOptionActive)}
                                    onClick={() => onSortChange?.(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </FilterGroup>
                </div>

                {/* Динамічні блоки фільтрів з API */}
                {isLoadingFilters ? (
                    <div className={s.filtersLoading} />
                ) : dynamicBlocks.length > 0 ? (
                    dynamicBlocks.map((block, idx) => {
                        if (!block.key || block.key === 'categories') return null;
                        const blockKey = block.key;

                        // --- Range block (double_range) → PriceRange ---
                        if (isRangeBlock(block)) {
                            const blockMin = block.min ?? 0;
                            const blockMax = block.max ?? 10000;
                            if (blockMin === blockMax) return null;
                            const currentFilter = getFilterForBlock(pendingFilters, blockKey);
                            const from = currentFilter?.minValue ?? blockMin;
                            const to = currentFilter?.maxValue ?? blockMax;
                            const showClear = from !== blockMin || to !== blockMax;

                            return (
                                <PriceRange
                                    key={blockKey}
                                    min={blockMin}
                                    max={blockMax}
                                    from={from}
                                    to={to}
                                    step={10}
                                    onChange={(f, t) => setPriceRange(blockKey, f, t, blockMin, blockMax)}
                                    label={block.label ? block.label.toUpperCase() : undefined}
                                    onClear={() => clearPriceRange(blockKey)}
                                    showClear={showClear}
                                />
                            );
                        }

                        // --- List/Buttons block → FilterPill або FilterCheckbox ---
                        const options = block.values ?? [];
                        if (options.length <= 1) return null;
                        if (!block.label) return null;

                        const currentFilter = getFilterForBlock(pendingFilters, blockKey);
                        const selectedValues = currentFilter?.values ?? [];

                        // "buttons" → FilterPill, "list" → FilterCheckbox
                        const usePill = block.type === 'buttons';

                        return (
                            <FilterGroup key={blockKey} title={block.label.toUpperCase()} initialOpen={true}>
                                {options.map(option => {
                                    if (!option.key) return null;
                                    const isActive = selectedValues.includes(option.key);
                                    const isDisabled = option.disabled === true;

                                    if (usePill) {
                                        return (
                                            <FilterPill
                                                key={option.key}
                                                active={isActive}
                                                onClick={isDisabled ? undefined : () => toggleListOption(blockKey, option.key!)}
                                                className={isDisabled ? s.disabledOption : undefined}
                                            >
                                                {option.label ?? option.key}
                                            </FilterPill>
                                        );
                                    }

                                    return (
                                        <FilterCheckbox
                                            key={option.key}
                                            active={isActive}
                                            onClick={isDisabled ? undefined : () => toggleListOption(blockKey, option.key!)}
                                            className={isDisabled ? s.disabledOption : undefined}
                                        >
                                            {option.label ?? option.key}
                                        </FilterCheckbox>
                                    );
                                })}
                            </FilterGroup>
                        );
                    })
                ) : null}


                <Button
                    variant="red"
                    type="button"
                    className={s.applyBtn}
                    onClick={handleApply}
                    disabled={!isPendingChanged && !isSortChanged}
                >
                    {selectedCount > 0
                        ? `ЗАСТОСУВАТИ (${selectedCount})`
                        : 'ЗАСТОСУВАТИ ФІЛЬТР'}
                </Button>
            </div>
        </div>
    );
}
