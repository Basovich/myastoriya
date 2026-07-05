'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation';
import s from './FilterSidebar.module.scss';
import FilterGroup from '@/app/components/ui/FilterGroup/FilterGroup';
import FilterCheckbox from '@/app/components/ui/FilterCheckbox/FilterCheckbox';
import FilterPill from '@/app/components/ui/FilterPill/FilterPill';
import PriceRange from '@/app/components/ui/PriceRange/PriceRange';
import Button from "@/app/components/ui/Button/Button";
import CategorySwitcher from '@/app/components/ui/CategorySwitcher/CategorySwitcher';
import clsx from 'clsx';
import type { FilterBlock, FilterStateInput } from '@/lib/graphql';
import { getProductsFilterApi } from '@/lib/graphql/queries/products';
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
    isSubcategory?: boolean;
}

const LOCALIZED_SIDEBAR_TEXTS = {
    ua: {
        applyFilter: 'ЗАСТОСУВАТИ ФІЛЬТР',
        apply: 'ЗАСТОСУВАТИ',
        defaultSortOption: 'За популярністю',
        sortOptions: [
            'За популярністю',
            'За зниженням ціни',
            'За зростанням ціни',
            'За рейтингом',
            'За обговорюваністю',
            'За датою',
        ]
    },
    ru: {
        applyFilter: 'ПРИМЕНИТЬ ФИЛЬТР',
        apply: 'ПРИМЕНИТЬ',
        defaultSortOption: 'По популярности',
        sortOptions: [
            'По популярности',
            'По снижению цены',
            'По возрастанию цены',
            'По рейтингу',
            'По обсуждаемости',
            'По дате',
        ]
    }
};

function shouldExcludeBlock(block: FilterBlock): boolean {
    const key = (block.key ?? '').toLowerCase();
    const label = (block.label ?? '').toLowerCase();

    // Check for caloric value / energy
    if (key.includes('kalor') || label.includes('калорі') || label.includes('калори')) return true;
    // Check for carbohydrates
    if (key.includes('vuhl') || key.includes('uglev') || label.includes('вуглевод') || label.includes('углевод')) return true;
    // Check for proteins
    if (key.includes('bilk') || key.includes('belk') || label.includes('білк') || label.includes('белк')) return true;
    // Check for fats
    if (key.includes('zhy') || key.includes('zhi') || label.includes('жир')) return true;
    // Check for storage conditions
    if (key.includes('zber') || key.includes('storage') || label.includes('зберіг') || label.includes('хранени')) return true;
    // Check for weight
    if (key.includes('vaga') || key.includes('masa') || key.includes('weight') || label === 'вага' || label === 'вес') return true;

    return false;
}

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
    isSubcategory,
}: CatalogSidebarProps) {
    const routeParams = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const lang = routeParams?.lang === 'ru' ? 'ru' : 'ua';
    const texts = LOCALIZED_SIDEBAR_TEXTS[lang];
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [floatingButtonPos, setFloatingButtonPos] = useState<{ top: number; left: number } | null>(null);
    const optionsToUse = sortOptions || texts.sortOptions;
    const defaultSortOption = optionsToUse[0] || texts.defaultSortOption;

    // Локальний стан фільтрів (pending до натискання «Застосувати»)
    const [pendingFilters, setPendingFilters] = useState<FilterStateInput[]>(activeFilters ?? []);

    // Локальний стан «чернетки» ціни — не впливає на isPendingChanged
    const [pendingPrice, setPendingPrice] = useState<Record<string, { from: number; to: number }>>({});

    // Динамічні блоки фільтрів, отримані напряму через gqlRequest (getProductsFilterApi)
    const [dynamicBlocks, setDynamicBlocks] = useState<FilterBlock[]>(
        (filterBlocks ?? []).filter(block => !shouldExcludeBlock(block))
    );
    const [isLoadingFilters, setIsLoadingFilters] = useState(!filterBlocks || filterBlocks.length === 0);

    const renderedBlocks = dynamicBlocks.filter(block => {
        if (!block.key || block.key === 'categories') return false;
        if (isRangeBlock(block)) {
            const blockMin = block.min ?? 0;
            const blockMax = block.max ?? 10000;
            if (blockMin === blockMax) return false;
            return true;
        } else {
            const options = block.values ?? [];
            if (options.length <= 1) return false;
            if (!block.label) return false;
            return true;
        }
    });

    const isOnlyPriceRange = renderedBlocks.length === 1 && isRangeBlock(renderedBlocks[0]);

    useEffect(() => {
        if (!categoryId) {
            setIsLoadingFilters(false);
            return;
        }
        setIsLoadingFilters(true);
        const langParam = routeParams?.lang === 'ru' ? 'ru' : 'ua';
        getProductsFilterApi(categoryId, langParam)
            .then(data => {
                if (data.blocks && Array.isArray(data.blocks)) {
                    setDynamicBlocks(data.blocks.filter((block: FilterBlock) => !shouldExcludeBlock(block)));
                }
            })
            .catch(() => { /* залишаємо dynamicBlocks порожніми */ })
            .finally(() => setIsLoadingFilters(false));
    }, [categoryId, routeParams?.lang]);

    // Синхронізуємо з props при скиданні через key={clearTrigger}
    useEffect(() => {
        setPendingFilters(activeFilters ?? []);
        setPendingPrice({});
        setFloatingButtonPos(null);
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

    const handleOptionClick = useCallback((e: React.MouseEvent<HTMLButtonElement>, blockKey: string, optionKey: string) => {
        toggleListOption(blockKey, optionKey);

        if (typeof window !== 'undefined' && window.innerWidth >= 1280 && sidebarRef.current) {
            const sidebarRect = sidebarRef.current.getBoundingClientRect();
            const clickedRect = e.currentTarget.getBoundingClientRect();

            // Вертикально — по центру клікнутого елемента відносно сайдбару
            const top = clickedRect.top - sidebarRect.top + (clickedRect.height / 2);
            // Горизонтально — завжди праворуч від сайдбару (ширина сайдбару + відступ)
            const left = sidebarRect.width + 16;

            setFloatingButtonPos({ top, left });
        }
    }, [toggleListOption]);

    const setPriceRange = useCallback((blockKey: string, min: number, max: number, blockMin: number, blockMax: number) => {
        // Якщо значення = межам блоку — видаляємо фільтр (скидаємо)
        if (min === blockMin && max === blockMax) {
            setPendingFilters(prev => removeFilter(prev, blockKey));
        } else {
            setPendingFilters(prev => setFilterValue(prev, { key: blockKey, minValue: min, maxValue: max }));
        }
    }, []);


    const handlePriceChange = useCallback((blockKey: string, from: number, to: number) => {
        setPendingPrice(prev => ({ ...prev, [blockKey]: { from, to } }));
    }, []);

    const handlePriceOk = useCallback((blockKey: string, blockMin: number, blockMax: number) => {
        const draft = pendingPrice[blockKey];
        if (!draft) return;
        
        let newFilters: FilterStateInput[];
        if (draft.from === blockMin && draft.to === blockMax) {
            newFilters = removeFilter(pendingFilters, blockKey);
        } else {
            newFilters = setFilterValue(pendingFilters, { key: blockKey, minValue: draft.from, maxValue: draft.to });
        }
        setPendingFilters(newFilters);

        if (isOnlyPriceRange) {
            const params = buildFilterParams(newFilters, new URLSearchParams(searchParams.toString()), dynamicBlocks);
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
            setFloatingButtonPos(null);
            onApply?.();
            onClose?.();
        }
    }, [pendingPrice, pendingFilters, isOnlyPriceRange, searchParams, dynamicBlocks, router, pathname, onApply, onClose]);


    const clearPriceRange = useCallback((blockKey: string) => {
        const newFilters = removeFilter(pendingFilters, blockKey);
        setPendingFilters(newFilters);
        setPendingPrice(prev => { const next = { ...prev }; delete next[blockKey]; return next; });

        if (isOnlyPriceRange) {
            const params = buildFilterParams(newFilters, new URLSearchParams(searchParams.toString()), dynamicBlocks);
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
            setFloatingButtonPos(null);
            onClearAll?.();
            onClose?.();
        }
    }, [pendingFilters, isOnlyPriceRange, searchParams, dynamicBlocks, router, pathname, onClearAll, onClose]);

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
        setFloatingButtonPos(null);
        onApply?.();
        onClose?.();
    };

    const handleClear = () => {
        setPendingFilters([]);
        const params = clearFilterParams(new URLSearchParams(searchParams.toString()));
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        setFloatingButtonPos(null);
        onClearAll?.();
        onClose?.();
    };

    const selectedCount = countActiveFilterValues(pendingFilters);

    return (
        <div className={s.sidebar} ref={sidebarRef}>
            {categoryId && (
                <CategorySwitcher
                    categoryId={categoryId}
                    lang={lang}
                    isSidebar={false}
                    isSubcategory={isSubcategory}
                />
            )}

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
                    <div className={s.loaderContainer}>
                        <svg className={s.spinner} viewBox="0 0 50 50">
                            <circle className={s.path} cx="25" cy="25" r="20" fill="none" strokeWidth="4.5"></circle>
                        </svg>
                    </div>
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
                                    from={pendingPrice[blockKey]?.from ?? from}
                                    to={pendingPrice[blockKey]?.to ?? to}
                                    step={10}
                                    onChange={(f, t) => handlePriceChange(blockKey, f, t)}
                                    label={block.label ? block.label.toUpperCase() : undefined}
                                    onClear={() => clearPriceRange(blockKey)}
                                    showClear={showClear}
                                    onOk={() => handlePriceOk(blockKey, blockMin, blockMax)}
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
                                                onClick={isDisabled ? undefined : (e) => handleOptionClick(e, blockKey, option.key!)}
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
                                            onClick={isDisabled ? undefined : (e) => handleOptionClick(e, blockKey, option.key!)}
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


                {!isOnlyPriceRange && (
                    <Button
                        variant="red"
                        type="button"
                        className={s.applyBtn}
                        onClick={handleApply}
                        disabled={!isPendingChanged && !isSortChanged}
                    >
                        {selectedCount > 0
                            ? `${texts.apply} (${selectedCount})`
                            : texts.applyFilter}
                    </Button>
                )}

                {!isOnlyPriceRange && isPendingChanged && floatingButtonPos && (
                    <button
                        type="button"
                        className={s.floatingApply}
                        style={{
                            top: `${floatingButtonPos.top}px`,
                            left: `${floatingButtonPos.left}px`,
                        }}
                        onClick={handleApply}
                    >
                        {selectedCount > 0
                            ? `${texts.apply} (${selectedCount})`
                            : texts.apply}
                    </button>
                )}
            </div>
        </div>
    );
}
