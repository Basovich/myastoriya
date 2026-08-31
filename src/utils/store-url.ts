export interface StoreSlugTarget {
    id?: string | number | null;
    slug?: string | null;
    name?: string | null;
    siteName?: string | null;
}

/**
 * Transliterates Ukrainian text to a clean Latin URL slug.
 */
export function transliterateUkToSlug(text: string): string {
    const ukMap: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e',
        'є': 'ye', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y',
        'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
        'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya',
        'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'h', 'Ґ': 'g', 'Д': 'd', 'Е': 'e',
        'Є': 'ye', 'Ж': 'zh', 'З': 'z', 'И': 'y', 'І': 'i', 'Ї': 'yi', 'Й': 'y',
        'К': 'k', 'Л': 'l', 'М': 'm', 'Н': 'n', 'О': 'o', 'П': 'p', 'Р': 'r',
        'С': 's', 'Т': 't', 'У': 'u', 'Ф': 'f', 'Х': 'kh', 'Ц': 'ts', 'Ч': 'ch',
        'Ш': 'sh', 'Щ': 'shch', 'Ю': 'yu', 'Я': 'ya'
    };

    return text
        .split('')
        .map(char => ukMap[char] ?? char)
        .join('')
        .toLowerCase()
        .replace(/['"`ʼ’«»]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Map of backend identifiers (slug or id) <-> SEO URL slug
 */
const BACKEND_TO_SEO_SLUG_MAP: Record<string, string> = {
    'shop-1': 'myastoriya-na-oboloni',
    'shop-2': 'myastoriya-na-poznyakah',
    'shop-4': 'myastoriya-na-teremkah',
    'meat-bar-vid-m-yastoriya': 'meat-bar-vid-myastoriya',
    'park-avenue': 'myastoriya-v-zhk-park-avenyu',
    'meat-bar-m-yastoriya': 'meat-bar-myastoriya',
    'm-yastoriya-vid-meat-bar': 'myastoriya-vid-meat-bar',
    '5': 'myastoriya-na-oboloni',
    '1': 'myastoriya-na-poznyakah',
    '6': 'myastoriya-na-teremkah',
    '1259': 'meat-bar-vid-myastoriya',
    '1279': 'myastoriya-v-zhk-park-avenyu',
    '1280': 'meat-bar-myastoriya',
    '1831': 'myastoriya-vid-meat-bar',
};

const SEO_TO_BACKEND_SLUG_MAP: Record<string, string> = {
    'myastoriya-na-oboloni': 'shop-1',
    'myastoriya-na-poznyakah': 'shop-2',
    'myastoriya-na-teremkah': 'shop-4',
    'meat-bar-vid-myastoriya': 'meat-bar-vid-m-yastoriya',
    'myastoriya-v-zhk-park-avenyu': 'park-avenue',
    'meat-bar-myastoriya': 'meat-bar-m-yastoriya',
    'myastoriya-vid-meat-bar': 'm-yastoriya-vid-meat-bar',
};

/**
 * Returns the SEO URL slug for a given store.
 * e.g. myastoriya-na-oboloni
 */
export function getStoreSeoSlug(store: StoreSlugTarget): string {
    const rawSlug = String(store.slug || store.id || '');
    if (BACKEND_TO_SEO_SLUG_MAP[rawSlug]) {
        return BACKEND_TO_SEO_SLUG_MAP[rawSlug];
    }
    const nameToTransliterate = store.siteName || store.name || '';
    if (nameToTransliterate) {
        return transliterateUkToSlug(nameToTransliterate);
    }
    return rawSlug;
}

/**
 * Resolves a given URL slug (either SEO slug or legacy backend slug) to the backend slug identifier.
 * Returns null if not found.
 */
export function resolveStoreBackendSlug(slug: string): string {
    const lower = (slug || '').toLowerCase();

    // Check if it's already an SEO slug
    if (SEO_TO_BACKEND_SLUG_MAP[lower]) {
        return SEO_TO_BACKEND_SLUG_MAP[lower];
    }

    // Check if it's a legacy backend slug (e.g. shop-1)
    if (BACKEND_TO_SEO_SLUG_MAP[lower]) {
        return lower;
    }

    return lower;
}

/**
 * Checks if the given slug is a legacy backend slug that needs 301 redirect.
 * If so, returns the new SEO slug to redirect to. Otherwise returns null.
 */
export function getLegacyStoreRedirectSlug(slug: string): string | null {
    const lower = (slug || '').toLowerCase();
    if (BACKEND_TO_SEO_SLUG_MAP[lower]) {
        return BACKEND_TO_SEO_SLUG_MAP[lower];
    }
    return null;
}

/**
 * Builds the canonical relative URL for a store page.
 * e.g. /our-stores/myastoriya-na-oboloni
 */
export function getStoreHref(store: StoreSlugTarget): string {
    const seoSlug = getStoreSeoSlug(store);
    return `/our-stores/${seoSlug}`;
}
