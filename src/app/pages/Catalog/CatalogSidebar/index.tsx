'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation';
import s from './FilterSidebar.module.scss';
import FilterGroup from '@/app/components/ui/FilterGroup/FilterGroup';
import FilterCheckbox from '@/app/components/ui/FilterCheckbox/FilterCheckbox';
import FilterPill from '@/app/components/ui/FilterPill/FilterPill';
import PriceRange from '@/app/components/ui/PriceRange/PriceRange';
import CategorySwitcher from '@/app/components/ui/CategorySwitcher/CategorySwitcher';
import clsx from 'clsx';
import Spinner from '@/app/components/ui/Spinner/Spinner';
import type { FilterBlock, FilterStateInput } from '@/lib/graphql';
import { getProductsFilterApi } from '@/lib/graphql/queries/products';
import {
    isRangeBlock,
    buildFilterParams,
    clearFilterParams,
    getFilterForBlock,
    setFilterValue,
    removeFilter,
    hasActiveFilters,
} from '@/utils/filter-params';
import { buildCategoryFilterUrl, splitFiltersForUrl } from '@/utils/catalog-filter-url';
import { getCategorySeoConfig } from '@/config/seo-filters';
import { getLocalizedHref } from '@/utils/i18n-helpers';

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
    hasMixedRawProduction?: boolean;
}

const LOCALIZED_SIDEBAR_TEXTS = {
    ua: {
        applyFilter: 'ЗАСТОСУВАТИ ФІЛЬТР',
        apply: 'ЗАСТОСУВАТИ',
        clear: 'Очистити',
        defaultSortOption: 'За популярністю',
        cookedFirst: 'СПОЧАТКУ ГОТОВЕ',
        rawFirst: 'СПОЧАТКУ СИРЕ',
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
        clear: 'Очистить',
        defaultSortOption: 'По популярности',
        cookedFirst: 'СНАЧАЛА ГОТОВОЕ',
        rawFirst: 'СНАЧАЛА СЫРОЕ',
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
    return key.includes('vaga') || key.includes('masa') || key.includes('weight') || label === 'вага' || label === 'вес';
}

export default function CatalogSidebar({
    onApply,
    onClose,
    onClearAll,
    onModifiedChange,
    categoryId,
    filterBlocks,
    activeFilters,
    isSubcategory,
    hasMixedRawProduction,
}: CatalogSidebarProps) {
    const routeParams = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const lang = routeParams?.lang === 'ru' ? 'ru' : 'ua';

    // На сторінках категорій фільтри живуть у шляху URL (`/category/<slug>/vyd-steika=ribai/`)
    const routeSlug = routeParams?.slug;
    const categorySlug = Array.isArray(routeSlug) ? routeSlug[0] : undefined;
    const isCategoryRoute = Boolean(categorySlug) && pathname.includes('/category/');
    const seoFilterSlugs = categorySlug ? (getCategorySeoConfig(categorySlug)?.allowedFilterSlugs ?? []) : [];
    const texts = LOCALIZED_SIDEBAR_TEXTS[lang];
    const [pendingPrice, setPendingPrice] = useState<Record<string, { from: number; to: number }>>({});

    // Динамічні блоки фільтрів, отримані напряму через gqlRequest (getProductsFilterApi)
    const [dynamicBlocks, setDynamicBlocks] = useState<FilterBlock[]>(
        (filterBlocks ?? []).filter(block => !shouldExcludeBlock(block))
    );
    const [isLoadingFilters, setIsLoadingFilters] = useState(() => {
        if (!categoryId) return false;
        return !filterBlocks || filterBlocks.length === 0;
    });

    const isInitialMountRef = useRef(true);

    useEffect(() => {
        if (!categoryId) {
            return;
        }
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            if (filterBlocks && filterBlocks.length > 0) {
                return;
            }
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
    }, [categoryId, routeParams?.lang, filterBlocks]);

    useEffect(() => {
        setPendingPrice({});
    }, [activeFilters]);

    // --- Helpers ---

    const startCatalogTransition = () => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('catalog-loading-start'));
        }
    };

    /**
     * Переходить на URL з новим набором фільтрів.
     * Категорії: фільтри зі slug йдуть у шлях, діапазон ціни та блоки без slug — у GET.
     * Інші сторінки: усі фільтри в GET (`filter_<id>`).
     */
    const navigateWithFilters = useCallback((filters: FilterStateInput[], clearOnly = false) => {
        const currentParams = new URLSearchParams(searchParams.toString());
        startCatalogTransition();
        if (isCategoryRoute && categorySlug) {
            const { pathFilters, queryFilters } = splitFiltersForUrl(filters, dynamicBlocks);
            const params = clearOnly
                ? clearFilterParams(currentParams)
                : buildFilterParams(queryFilters, currentParams, dynamicBlocks);
            const basePath = getLocalizedHref(
                buildCategoryFilterUrl(categorySlug, clearOnly ? [] : pathFilters, dynamicBlocks),
                lang,
            );
            router.push(`${basePath}?${params.toString()}`, { scroll: false });
        } else {
            const params = clearOnly
                ? clearFilterParams(currentParams)
                : buildFilterParams(filters, currentParams, dynamicBlocks);
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }, [searchParams, isCategoryRoute, categorySlug, dynamicBlocks, lang, router, pathname]);

    /**
     * Автоматично перемикає опцію та одразу переходить на новий URL.
     */
    const handleToggleOption = useCallback((blockKey: string, optionKey: string) => {
        const currentListFilters = (activeFilters ?? []).filter(f => f.minValue === undefined && f.maxValue === undefined);
        const current = getFilterForBlock(currentListFilters, blockKey);
        const currentValues = current?.values ?? [];
        const newValues = currentValues.includes(optionKey)
            ? currentValues.filter(v => v !== optionKey)
            : [...currentValues, optionKey];

        const nextList = newValues.length === 0
            ? removeFilter(currentListFilters, blockKey)
            : setFilterValue(currentListFilters, { key: blockKey, values: newValues });

        const rangeFilters = (activeFilters ?? []).filter(f => f.minValue !== undefined || f.maxValue !== undefined);
        navigateWithFilters([...nextList, ...rangeFilters]);
        onApply?.();
        onClose?.();
    }, [activeFilters, navigateWithFilters, onApply, onClose]);

    const handlePriceChange = useCallback((blockKey: string, from: number, to: number) => {
        setPendingPrice(prev => ({ ...prev, [blockKey]: { from, to } }));
    }, []);

    const handlePriceOk = useCallback((blockKey: string, blockMin: number, blockMax: number) => {
        const draft = pendingPrice[blockKey];
        if (!draft) return;
        
        let newFilters: FilterStateInput[];
        const currentActive = activeFilters ?? [];
        if (draft.from === blockMin && draft.to === blockMax) {
            newFilters = removeFilter(currentActive, blockKey);
        } else {
            newFilters = setFilterValue(currentActive, { key: blockKey, minValue: draft.from, maxValue: draft.to });
        }

        navigateWithFilters(newFilters);
        onApply?.();
        onClose?.();
    }, [pendingPrice, activeFilters, navigateWithFilters, onApply, onClose]);

    const isModified = hasActiveFilters(activeFilters ?? []);

    useEffect(() => {
        onModifiedChange?.(isModified);
    }, [isModified, onModifiedChange]);

    const handleClear = () => {
        navigateWithFilters([], true);
        onClearAll?.();
        onClose?.();
    };

    const renderToggleCard = () => {
        if (!hasMixedRawProduction) return null;
        const currentMeatType = searchParams.get('filter_meat_type') ?? searchParams.get('rawProduction');
        const isRawPath = pathname.includes('steyki-siri') || pathname.includes('siri') || pathname.includes('syry');
        const isRawActive = currentMeatType === 'raw' || currentMeatType === 'true' || (currentMeatType === null && isRawPath);
        const isCookedActive = !isRawActive;

        const handleToggle = (targetType: 'raw' | 'cooked') => {
            let targetUrl: string;

            if (targetType === 'raw') {
                if (pathname.includes('steyki-na-grili')) {
                    targetUrl = pathname.replace('steyki-na-grili', 'steyki-siri');
                } else if (pathname.includes('steyki-na-grile')) {
                    targetUrl = pathname.replace('steyki-na-grile', 'steyki-siri');
                } else {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('filter_meat_type', 'raw');
                    params.set('page', '1');
                    targetUrl = `${pathname}?${params.toString()}`;
                }
            } else {
                if (pathname.includes('steyki-siri')) {
                    targetUrl = pathname.replace('steyki-siri', 'steyki-na-grili');
                } else {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('filter_meat_type', 'cooked');
                    params.set('page', '1');
                    targetUrl = `${pathname}?${params.toString()}`;
                }
            }

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('catalog-loading-start'));
            }
            router.push(targetUrl, { scroll: false });
        };

        return (
            <div className={s.toggleCard}>
                <button
                    type="button"
                    className={clsx(
                        s.typeBtn,
                        isRawActive ? s.typeBtnActive : s.typeBtnOutline
                    )}
                    onClick={() => handleToggle('raw')}
                >
                    {texts.rawFirst}
                </button>
                <button
                    type="button"
                    className={clsx(
                        s.typeBtn,
                        isCookedActive ? s.typeBtnActive : s.typeBtnOutline
                    )}
                    onClick={() => handleToggle('cooked')}
                >
                    {texts.cookedFirst}
                </button>
            </div>
        );
    };

    return (
        <div className={s.sidebar}>
            {renderToggleCard()}

            {categoryId && (
                <CategorySwitcher
                    categoryId={categoryId}
                    lang={lang}
                    isSidebar={false}
                    isSubcategory={isSubcategory}
                />
            )}

            <div className={s.filtersWrapper}>
                {/* Динамічні блоки фільтрів з API */}
                {isLoadingFilters ? (
                    <Spinner centered={true} />
                ) : dynamicBlocks.length > 0 ? (
                    dynamicBlocks.map(block => {
                        if (!block.key || block.key === 'categories') return null;
                        const blockKey = block.key;

                        // --- Range block (double_range) → PriceRange ---
                        if (isRangeBlock(block)) {
                            const blockMin = block.min ?? 0;
                            const blockMax = block.max ?? 10000;
                            if (blockMin === blockMax) return null;
                            const activeFilter = getFilterForBlock(activeFilters ?? [], blockKey);
                            const from = activeFilter?.minValue ?? blockMin;
                            const to = activeFilter?.maxValue ?? blockMax;
                            
                            const hasAppliedFilters = hasActiveFilters(activeFilters ?? []);

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
                                    onClear={handleClear}
                                    showClear={hasAppliedFilters}
                                    onOk={() => handlePriceOk(blockKey, blockMin, blockMax)}
                                />
                            );
                        }

                        // --- List/Buttons block → FilterPill або FilterCheckbox ---
                        const options = block.values ?? [];
                        if (options.length <= 1) return null;
                        if (!block.label) return null;

                        const currentFilter = getFilterForBlock(activeFilters ?? [], blockKey);
                        const selectedValues = currentFilter?.values ?? [];

                        // "buttons" → FilterPill, "list" → FilterCheckbox
                        const usePill = block.type === 'buttons';

                        return (
                            <FilterGroup key={blockKey} title={block.label.toUpperCase()} initialOpen={true}>
                                {options.map(option => {
                                    if (!option.key) return null;
                                    const isActive = selectedValues.includes(option.key);
                                    const isDisabled = option.disabled === true;
                                    const isSeoOption =
                                        isCategoryRoute &&
                                        Boolean(categorySlug && block.slug && option.slug) &&
                                        seoFilterSlugs.includes(block.slug ?? '');
                                    const seoHref = isSeoOption && !isDisabled && categorySlug
                                        ? buildCategoryFilterUrl(categorySlug, [{ key: blockKey, values: [option.key] }], dynamicBlocks)
                                        : undefined;
                                    const handleClick = isDisabled
                                        ? undefined
                                        : () => handleToggleOption(blockKey, option.key!);

                                    if (usePill) {
                                        return (
                                            <FilterPill
                                                key={option.key}
                                                active={isActive}
                                                href={seoHref}
                                                onClick={handleClick}
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
                                            href={seoHref}
                                            onClick={handleClick}
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


                {hasActiveFilters(activeFilters ?? []) && (
                    <button
                        type="button"
                        className={s.clearBottomBtn}
                        onClick={handleClear}
                    >
                        {texts.clear}
                    </button>
                )}
            </div>
        </div>
    );
}
