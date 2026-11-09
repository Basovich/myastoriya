import type { FilterBlock, FilterOption, FilterStateInput } from '@/lib/graphql';
import { getCategorySeoConfig, getSeoFilterLabel } from '@/config/seo-filters';

export interface ParsedFilterItem {
    filterSlug: string;
    filterBlock?: FilterBlock;
    valueSlugs: string[];
    valueOptions: FilterOption[];
}

export interface ParsedCategoryFilterResult {
    isValid: boolean;
    hasFilters: boolean;
    items: ParsedFilterItem[];
    filterState: FilterStateInput[];
    canonicalFilterPath: string;
    isNormalized: boolean;
    isSingleSeoFilter: boolean;
    singleSeoDetails?: {
        filterSlug: string;
        filterLabel: string;
        valueSlug: string;
        valueLabel: string;
        seoValueLabelUa: string;
        seoValueLabelRu: string;
    };
}

/**
 * Нормалізує слаг (нижній регістр, слова через дефіс).
 */
export function normalizeSlug(val: string): string {
    return val
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
}

/**
 * Парсить рядок фільтрів із URL (наприклад: `vyd-steika=ribai;vyd-vytrymky=voloha`).
 */
export function parseFilterUrlString(
    filterSegment: string,
    filterBlocks: FilterBlock[],
    categorySlug: string,
    ancestorSlugs: string[] = []
): ParsedCategoryFilterResult {
    if (!filterSegment || !filterSegment.trim()) {
        return {
            isValid: true,
            hasFilters: false,
            items: [],
            filterState: [],
            canonicalFilterPath: '',
            isNormalized: true,
            isSingleSeoFilter: false,
        };
    }

    // Прибираємо кінцеві та початкові слеші
    const cleanSegment = filterSegment.replace(/^\/+|\/+$/g, '');
    const parts = cleanSegment.split(';').map(p => p.trim()).filter(Boolean);

    if (parts.length === 0) {
        return {
            isValid: true,
            hasFilters: false,
            items: [],
            filterState: [],
            canonicalFilterPath: '',
            isNormalized: true,
            isSingleSeoFilter: false,
        };
    }

    const items: ParsedFilterItem[] = [];
    const filterState: FilterStateInput[] = [];

    // Будуємо карти для швидкого пошуку блоків та значень за слагами та ключами
    const blockMap = new Map<string, FilterBlock>();
    filterBlocks.forEach(b => {
        if (b.slug) blockMap.set(b.slug.toLowerCase(), b);
    });
    const seenFilterSlugs = new Set<string>();

    for (const part of parts) {
        const eqIdx = part.indexOf('=');
        if (eqIdx === -1) {
            // Невалідний синтаксис (відсутній =)
            return {
                isValid: false,
                hasFilters: true,
                items: [],
                filterState: [],
                canonicalFilterPath: '',
                isNormalized: false,
                isSingleSeoFilter: false,
            };
        }

        const filterSlugRaw = part.slice(0, eqIdx);
        const valuesRaw = part.slice(eqIdx + 1);

        const filterSlug = normalizeSlug(filterSlugRaw);
        const valueSlugs = valuesRaw.split(',').map(normalizeSlug).filter(Boolean);

        if (!filterSlug || valueSlugs.length === 0) {
            return {
                isValid: false,
                hasFilters: true,
                items: [],
                filterState: [],
                canonicalFilterPath: '',
                isNormalized: false,
                isSingleSeoFilter: false,
            };
        }

        const block = blockMap.get(filterSlug);
        if (!block || seenFilterSlugs.has(filterSlug)) {
            // Фільтр не знайдено серед доступних блоків категорії
            return {
                isValid: false,
                hasFilters: true,
                items: [],
                filterState: [],
                canonicalFilterPath: '',
                isNormalized: false,
                isSingleSeoFilter: false,
            };
        }

        seenFilterSlugs.add(filterSlug);

        const valMap = new Map<string, FilterOption>();
        (block.values || []).forEach(v => {
            if (v.slug) valMap.set(v.slug.toLowerCase(), v);
        });

        const matchedOptions: FilterOption[] = [];
        const canonicalValueSlugs: string[] = [];

        for (const vSlug of valueSlugs) {
            const opt = valMap.get(vSlug);
            if (!opt) {
                // Значення не знайдено серед опцій фільтра
                return {
                    isValid: false,
                    hasFilters: true,
                    items: [],
                    filterState: [],
                    canonicalFilterPath: '',
                    isNormalized: false,
                    isSingleSeoFilter: false,
                };
            }
            if (matchedOptions.includes(opt)) continue;
            matchedOptions.push(opt);
            canonicalValueSlugs.push(vSlug);
        }

        // Бекенд очікує числові ключі фільтра та значень (FilterState.key / values), а не slug
        const apiKey = block.key || '';
        const apiValues = matchedOptions.map(opt => opt.key || '').filter(Boolean);
        if (!apiKey || apiValues.length === 0) {
            return {
                isValid: false,
                hasFilters: true,
                items: [],
                filterState: [],
                canonicalFilterPath: '',
                isNormalized: false,
                isSingleSeoFilter: false,
            };
        }

        items.push({
            filterSlug,
            filterBlock: block,
            valueSlugs: canonicalValueSlugs,
            valueOptions: matchedOptions,
        });

        filterState.push({
            key: apiKey,
            values: apiValues,
        });
    }

    // Канонічний порядок: фільтри та значення — у порядку, в якому їх віддає бекенд
    const blockOrder = (item: ParsedFilterItem) =>
        item.filterBlock ? filterBlocks.indexOf(item.filterBlock) : Number.MAX_SAFE_INTEGER;
    const sortedItems = [...items].sort((a, b) => blockOrder(a) - blockOrder(b));
    const canonicalParts = sortedItems.map(item => {
        const values = item.filterBlock?.values ?? [];
        const sortedVals = [...item.valueSlugs].sort(
            (a, b) =>
                values.findIndex(v => v.slug?.toLowerCase() === a) -
                values.findIndex(v => v.slug?.toLowerCase() === b)
        );
        return `${item.filterSlug}=${sortedVals.join(',')}`;
    });
    const canonicalFilterPath = canonicalParts.join(';');

    const isNormalized = cleanSegment === canonicalFilterPath;

    // Перевірка на SEO-фільтр: рівно 1 фільтр з рівно 1 значенням
    let isSingleSeoFilter = false;
    let singleSeoDetails: ParsedCategoryFilterResult['singleSeoDetails'] = undefined;

    const seoConfig = getCategorySeoConfig(categorySlug, ancestorSlugs);
    if (seoConfig && items.length === 1 && items[0].valueSlugs.length === 1) {
        const singleItem = items[0];
        const isAllowed = seoConfig.allowedFilterSlugs.includes(singleItem.filterSlug);

        if (isAllowed) {
            isSingleSeoFilter = true;
            const opt = singleItem.valueOptions[0];
            const valSlug = singleItem.valueSlugs[0];
            const defaultLabel = opt?.label || valSlug;

            singleSeoDetails = {
                filterSlug: singleItem.filterSlug,
                filterLabel: singleItem.filterBlock?.label || singleItem.filterSlug,
                valueSlug: valSlug,
                valueLabel: defaultLabel,
                seoValueLabelUa: getSeoFilterLabel(valSlug, defaultLabel, 'ua'),
                seoValueLabelRu: getSeoFilterLabel(valSlug, defaultLabel, 'ru'),
            };
        }
    }

    return {
        isValid: true,
        hasFilters: true,
        items,
        filterState,
        canonicalFilterPath,
        isNormalized,
        isSingleSeoFilter,
        singleSeoDetails,
    };
}

/**
 * Розділяє активні фільтри на ті, що йдуть у шлях URL (блоки зі slug), і ті,
 * що залишаються у GET (діапазон ціни та службові блоки без slug).
 */
export function splitFiltersForUrl(
    activeFilters: FilterStateInput[],
    filterBlocks: FilterBlock[]
): { pathFilters: FilterStateInput[]; queryFilters: FilterStateInput[] } {
    const pathFilters: FilterStateInput[] = [];
    const queryFilters: FilterStateInput[] = [];

    for (const filter of activeFilters) {
        const block = filterBlocks.find(b => b.key === filter.key);
        const isPathFilter =
            Boolean(block?.slug) &&
            (filter.values?.length ?? 0) > 0 &&
            (block?.values ?? []).every(v => Boolean(v.slug));
        (isPathFilter ? pathFilters : queryFilters).push(filter);
    }

    return { pathFilters, queryFilters };
}

/**
 * Будує сегмент фільтрів для шляху URL (`vyd-steika=ribai,denver;vyd-vytrymky=voloha`).
 * Порядок фільтрів і значень фіксований (як у відповіді бекенду) і не залежить від порядку вибору.
 * Повертає порожній рядок, якщо немає жодного фільтра зі slug.
 */
export function buildFilterSegment(
    activeFilters: FilterStateInput[],
    filterBlocks: FilterBlock[]
): string {
    const parts: { order: number; filterSlug: string; valueSlugs: string[] }[] = [];

    for (const filter of activeFilters) {
        if (!filter.values || filter.values.length === 0) continue;
        const block = filterBlocks.find(b => b.key === filter.key);
        if (!block?.slug) continue;

        const options = block.values ?? [];
        const valueSlugs = options
            .filter(v => v.slug && filter.values?.includes(v.key ?? ''))
            .map(v => (v.slug as string).toLowerCase());

        if (valueSlugs.length > 0) {
            parts.push({
                order: filterBlocks.indexOf(block),
                filterSlug: block.slug.toLowerCase(),
                valueSlugs,
            });
        }
    }

    parts.sort((a, b) => a.order - b.order);
    return parts.map(p => `${p.filterSlug}=${p.valueSlugs.join(',')}`).join(';');
}

/**
 * Будує шлях категорії з активними фільтрами (без мовного префікса): `/category/steiky/vyd-steika=ribai/`.
 */
export function buildCategoryFilterUrl(
    categorySlug: string,
    activeFilters: FilterStateInput[],
    filterBlocks: FilterBlock[]
): string {
    const segment = buildFilterSegment(activeFilters, filterBlocks);
    return segment ? `/category/${categorySlug}/${segment}/` : `/category/${categorySlug}/`;
}
