import { cache } from 'react';
import { getProductsFilterApi, getMinPriceApi } from '@/lib/graphql';
import type { FilterBlock } from '@/lib/graphql';
import { parseFilterUrlString, type ParsedCategoryFilterResult } from '@/utils/catalog-filter-url';

export interface CategoryFilterContext {
    /** Блоки фільтрів категорії без застосованого стану (джерело slug → key). */
    blocks: FilterBlock[];
    parsed: ParsedCategoryFilterResult;
}

/**
 * Витягує сегмент фільтрів зі шляху `/category/<slug>/<filters>/`.
 * Повертає `null`, якщо другого сегмента немає, `undefined` — якщо шлях не відповідає формату фільтрів.
 */
export function extractFilterSegment(slug: string[]): string | null | undefined {
    if (slug.length === 1) return null;
    if (slug.length === 2 && safeDecode(slug[1]).includes('=')) return safeDecode(slug[1]);
    return undefined;
}

function safeDecode(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

/**
 * Завантажує блоки фільтрів категорії та парсить сегмент URL.
 * Кешується в межах запиту, щоб `generateMetadata` і сторінка не дублювали роботу.
 */
export const getCategoryFilterContext = cache(
    async (categoryId: number, categorySlug: string, filterSegment: string, lang: string): Promise<CategoryFilterContext> => {
        const data = await getProductsFilterApi(categoryId, lang);
        if (!data.blocks || data.blocks.length === 0) {
            // Не підміняємо збій API на 404: сторінка не повинна «зникати» через тимчасову помилку
            throw new Error(`[catalog-filters] productsFilter returned no blocks for category ${categoryId}`);
        }
        return {
            blocks: data.blocks,
            parsed: parseFilterUrlString(filterSegment, data.blocks, categorySlug),
        };
    },
);

/** Мінімальна ціна для Description SEO-сторінки фільтра (кешується в межах запиту). */
export const getCategoryFilterMinPrice = cache(
    async (categoryId: number, categorySlug: string, filterSegment: string, lang: string, token?: string): Promise<number | null> => {
        const ctx = await getCategoryFilterContext(categoryId, categorySlug, filterSegment, lang);
        if (!ctx.parsed.isValid) return null;
        return getMinPriceApi(categoryId, ctx.parsed.filterState, lang, token);
    },
);

export interface CategoryRobotsInput {
    pageNum: number;
    /** Є хоча б один фільтр (у шляху або в GET) */
    hasFilters: boolean;
    /** Рівно один SEO-фільтр з одним значенням у шляху, без додаткових фільтрів у GET */
    isSingleSeoFilter: boolean;
    /** Бекенд позначив сторінку як noindex (лише для категорії без фільтрів) */
    backendNoindex?: boolean;
}

/**
 * Правила індексації з ТЗ: індексуються категорія та SEO-фільтр з одним значенням;
 * будь-яка пагінація та решта комбінацій фільтрів — `noindex, follow`.
 */
export function getCategoryRobots({ pageNum, hasFilters, isSingleSeoFilter, backendNoindex }: CategoryRobotsInput) {
    const isIndexable =
        pageNum <= 1 && (hasFilters ? isSingleSeoFilter : !backendNoindex);
    return isIndexable ? { index: true, follow: true } : { index: false, follow: true };
}

