export interface SeoFilterValueConfig {
    ua: string;
    ru: string;
}

export interface CategorySeoConfig {
    allowedFilterSlugs: string[];
}

/**
 * Конфігурація категорій, для яких увімкнена SEO-оптимізація фільтрів.
 * Ключі — це базові slug батьківських категорій або конкретних підкатегорій.
 */
export const SEO_CATEGORY_CONFIGS: Record<string, CategorySeoConfig> = {
    // Категорія «Стейки» та її підкатегорії
    steiky: {
        allowedFilterSlugs: [
            'typ-steika',
            'vyd-steika',
            'vyd-vytrymky',
            'naiavnist-kistky',
            'typ-miasa',
        ],
    },
    'steiky-hotovi': {
        allowedFilterSlugs: [
            'typ-steika',
            'vyd-steika',
            'vyd-vytrymky',
            'naiavnist-kistky',
            'typ-miasa',
        ],
    },
    'steiky-syri': {
        allowedFilterSlugs: [
            'typ-steika',
            'vyd-steika',
            'vyd-vytrymky',
            'naiavnist-kistky',
            'typ-miasa',
        ],
    },
    'nabory-steikiv': {
        allowedFilterSlugs: [
            'typ-steika',
            'vyd-steika',
            'vyd-vytrymky',
            'naiavnist-kistky',
            'typ-miasa',
        ],
    },

    // Категорія «Шашлики» та її підкатегорії
    shashlyky: {
        allowedFilterSlugs: [
            'typ-miasa',
        ],
    },
    'shashlyk-hotovyi': {
        allowedFilterSlugs: [
            'typ-miasa',
        ],
    },
    'shashlyk-marynovanyi': {
        allowedFilterSlugs: [
            'typ-miasa',
        ],
    },
};

/**
 * Таблиця SEO-відмінювання значень фільтрів для шаблонів Title, H1, Description.
 */
export const SEO_FILTER_VALUES_MAP: Record<string, SeoFilterValueConfig> = {
    // Тип стейка
    klasychnyi: {
        ua: 'класичні',
        ru: 'классические',
    },
    alternatyvnyi: {
        ua: 'альтернативні',
        ru: 'альтернативные',
    },

    // Вид витримки
    special: {
        ua: 'Special витримки',
        ru: 'Special выдержки',
    },
    sukha: {
        ua: 'сухої витримки',
        ru: 'сухой выдержки',
    },
    voloha: {
        ua: 'вологої витримки',
        ru: 'влажной выдержки',
    },

    // Тип м'яса
    indychka: {
        ua: 'з індички',
        ru: 'с индейки',
    },
    'fermerska-kurka': {
        ua: 'з фермерської курки',
        ru: 'из фермерской курицы',
    },
    yalovychyna: {
        ua: 'з яловичини',
        ru: 'из говядины',
    },
    svynyna: {
        ua: 'зі свинини',
        ru: 'из свинины',
    },

    // Наявність кістки
    'na-kisttsi': {
        ua: 'на кістці',
        ru: 'на кости',
    },
    'bez-kistky': {
        ua: 'без кістки',
        ru: 'без кости',
    },
};

/**
 * Перевіряє, чи належить категорія (за slug або предками) до SEO-оптимізованих категорій.
 */
export function getCategorySeoConfig(
    categorySlug: string,
    ancestorSlugs: string[] = []
): CategorySeoConfig | null {
    const allSlugs = [categorySlug, ...ancestorSlugs];
    for (const slug of allSlugs) {
        if (SEO_CATEGORY_CONFIGS[slug]) {
            return SEO_CATEGORY_CONFIGS[slug];
        }
    }
    return null;
}

/**
 * Отримує коректне SEO-значення фільтра з урахуванням локалі та відмінювання.
 */
export function getSeoFilterLabel(
    valueSlug: string,
    fallbackLabel: string,
    lang: 'ua' | 'ru'
): string {
    const config = SEO_FILTER_VALUES_MAP[valueSlug];
    if (config && config[lang]) {
        return config[lang];
    }
    return fallbackLabel;
}

