/**
 * Маппінг API slug магазину → menu URL slug.
 * Тільки для ресторанів (isCompanyStore: true).
 * Мітбари не потребують маппінгу — їхній API slug використовується напряму.
 */
export const RESTAURANT_MENU_SLUG_MAP: Record<string, string> = {
    'shop-1': 'obolon',
    'shop-2': 'poznyaki',
    'shop-4': 'teremky',
    'myastoriya-obolon': 'obolon',
    'myastoriya-pozniaky': 'poznyaki',
    'myastoriya-teremky': 'teremky',
};

/**
 * Зворотній маппінг: menu URL slug → API slug
 */
export const MENU_SLUG_TO_SHOP_SLUG: Record<string, string> = {
    'obolon': 'myastoriya-obolon',
    'poznyaki': 'myastoriya-pozniaky',
    'teremky': 'myastoriya-teremky',
};

/**
 * Отримати menu URL slug для shop (для побудови посилань).
 */
export function getMenuSlug(apiSlug: string): string {
    return RESTAURANT_MENU_SLUG_MAP[apiSlug] ?? apiSlug;
}

export function getApiSlugFromMenu(menuSlug: string): string {
    return MENU_SLUG_TO_SHOP_SLUG[menuSlug] ?? menuSlug;
}

export const RESTAURANT_ENGLISH_NAMES: Record<string, string> = {
    'obolon': 'Myastoriya on Obolon',
    'poznyaki': 'Myastoriya on Poznyaki',
    'teremky': 'Myastoriya on Teremky',
    'myastoriya-obolon': 'Myastoriya on Obolon',
    'myastoriya-pozniaky': 'Myastoriya on Poznyaki',
    'myastoriya-teremky': 'Myastoriya on Teremky',
};

export function getRestaurantEnglishName(slug: string, fallbackName: string): string {
    const cleanFallback = fallbackName.replace(/\s*\(.*?\)\s*$/, '').trim();
    return RESTAURANT_ENGLISH_NAMES[slug] ?? cleanFallback;
}


