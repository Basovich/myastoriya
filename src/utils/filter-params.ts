import type { FilterStateInput, FilterBlock } from '@/lib/graphql';

const PARAM_PREFIX = 'filter_';
const RANGE_MIN_SUFFIX = '_min';
const RANGE_MAX_SUFFIX = '_max';

/**
 * Визначає, чи є блок фільтру ціновим/числовим діапазоном.
 * Бекенд повертає type: "double_range" для слайдерів.
 */
export function isRangeBlock(block: FilterBlock): boolean {
    return block.type === 'double_range' || block.type === 'range';
}

/**
 * Парсить URL search params у масив FilterStateInput.
 *
 * Формат URL:
 *   List:  ?filter_38=268,265&filter_13=94,65
 *   Range: ?filter_cost_min=200&filter_cost_max=800
 */
export function parseFilterParams(
    searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): FilterStateInput[] {
    const result: FilterStateInput[] = [];
    const rangeMap: Record<string, { minValue?: number; maxValue?: number }> = {};

    const getParam = (key: string): string | null => {
        if (searchParams instanceof URLSearchParams) {
            return searchParams.get(key);
        }
        const val = searchParams[key];
        return Array.isArray(val) ? (val[0] ?? null) : (val ?? null);
    };

    const getAllKeys = (): string[] => {
        if (searchParams instanceof URLSearchParams) {
            return Array.from(searchParams.keys());
        }
        return Object.keys(searchParams);
    };

    for (const key of getAllKeys()) {
        if (!key.startsWith(PARAM_PREFIX)) continue;
        const rest = key.slice(PARAM_PREFIX.length);
        const raw = getParam(key);
        if (!raw) continue;

        // Range: filter_cost_min або filter_cost_max
        if (rest.endsWith(RANGE_MIN_SUFFIX)) {
            const blockKey = rest.slice(0, -RANGE_MIN_SUFFIX.length);
            const val = parseInt(raw, 10);
            if (!isNaN(val)) {
                rangeMap[blockKey] = { ...(rangeMap[blockKey] ?? {}), minValue: val };
            }
            continue;
        }
        if (rest.endsWith(RANGE_MAX_SUFFIX)) {
            const blockKey = rest.slice(0, -RANGE_MAX_SUFFIX.length);
            const val = parseInt(raw, 10);
            if (!isNaN(val)) {
                rangeMap[blockKey] = { ...(rangeMap[blockKey] ?? {}), maxValue: val };
            }
            continue;
        }

        // List: filter_38=268,265
        const values = raw.split(',').map(v => v.trim()).filter(Boolean);
        if (values.length > 0) {
            result.push({ key: rest, values });
        }
    }

    // Додаємо range фільтри
    for (const [blockKey, range] of Object.entries(rangeMap)) {
        result.push({ key: blockKey, minValue: range.minValue, maxValue: range.maxValue });
    }

    return result;
}

/**
 * Серіалізує масив FilterStateInput у URLSearchParams.
 * Скидає page=1, зберігає інші поточні параметри (sort, view тощо).
 */
export function buildFilterParams(
    filters: FilterStateInput[],
    existing: URLSearchParams,
    filterBlocks: FilterBlock[],
): URLSearchParams {
    const params = new URLSearchParams(existing.toString());

    // Видаляємо старі filter_ параметри
    const keysToDelete: string[] = [];
    params.forEach((_, key) => {
        if (key.startsWith(PARAM_PREFIX)) {
            keysToDelete.push(key);
        }
    });
    keysToDelete.forEach(k => params.delete(k));

    // Записуємо нові
    for (const f of filters) {
        const block = filterBlocks.find(b => b.key === f.key);
        const isRange = block ? isRangeBlock(block) : false;

        if (isRange) {
            if (f.minValue !== null && f.minValue !== undefined) {
                params.set(`${PARAM_PREFIX}${f.key}${RANGE_MIN_SUFFIX}`, String(f.minValue));
            }
            if (f.maxValue !== null && f.maxValue !== undefined) {
                params.set(`${PARAM_PREFIX}${f.key}${RANGE_MAX_SUFFIX}`, String(f.maxValue));
            }
        } else if (f.values && f.values.length > 0) {
            params.set(`${PARAM_PREFIX}${f.key}`, f.values.join(','));
        }
    }

    params.set('page', '1');
    return params;
}

/**
 * Скидає всі filter_* параметри з URLSearchParams.
 */
export function clearFilterParams(existing: URLSearchParams): URLSearchParams {
    const params = new URLSearchParams(existing.toString());
    const keysToDelete: string[] = [];
    params.forEach((_, key) => {
        if (key.startsWith(PARAM_PREFIX)) {
            keysToDelete.push(key);
        }
    });
    keysToDelete.forEach(k => params.delete(k));
    params.set('page', '1');
    return params;
}

/** Чи є хоча б один активний фільтр */
export function hasActiveFilters(filters: FilterStateInput[]): boolean {
    return filters.some(f => {
        if (f.values && f.values.length > 0) return true;
        if (f.minValue !== null && f.minValue !== undefined) return true;
        if (f.maxValue !== null && f.maxValue !== undefined) return true;
        return false;
    });
}

/** Кількість активних опцій (для лічильника на кнопці «Застосувати») */
export function countActiveFilterValues(filters: FilterStateInput[]): number {
    return filters.reduce((sum, f) => {
        if (f.values) return sum + f.values.length;
        const hasRange = (f.minValue !== null && f.minValue !== undefined) ||
                         (f.maxValue !== null && f.maxValue !== undefined);
        return sum + (hasRange ? 1 : 0);
    }, 0);
}

/** Знаходить FilterStateInput для конкретного ключа блоку. */
export function getFilterForBlock(filters: FilterStateInput[], blockKey: string): FilterStateInput | undefined {
    return filters.find(f => f.key === blockKey);
}

/** Оновлює або додає FilterStateInput у масиві фільтрів (immutable). */
export function setFilterValue(
    filters: FilterStateInput[],
    newFilter: FilterStateInput,
): FilterStateInput[] {
    const existing = filters.find(f => f.key === newFilter.key);
    if (existing) {
        return filters.map(f => f.key === newFilter.key ? newFilter : f);
    }
    return [...filters, newFilter];
}

/** Видаляє FilterStateInput для ключа з масиву (immutable). */
export function removeFilter(filters: FilterStateInput[], blockKey: string): FilterStateInput[] {
    return filters.filter(f => f.key !== blockKey);
}
