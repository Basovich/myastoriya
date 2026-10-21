/**
 * Маппінг API slug магазину → menu URL slug.
 * Тільки для ресторанів (isCompanyStore: true).
 * Мітбари не потребують маппінгу — їхній API slug використовується напряму.
 */
export const RESTAURANT_MENU_SLUG_MAP: Record<string, string> = {
    // Позняки
    '1': 'poznyaki',
    'shop-1': 'poznyaki',
    'shop-2': 'poznyaki',
    'myastoriya-poznyaki': 'poznyaki',
    'myastoriya-pozniaky': 'poznyaki',
    'pozniaky': 'poznyaki',
    // Оболонь
    '5': 'obolon',
    'shop-5': 'obolon',
    'myastoriya-obolon': 'obolon',
    // Теремки
    '6': 'teremky',
    'shop-4': 'teremky',
    'shop-6': 'teremky',
    'myastoriya-teremky': 'teremky',
    // Парк Авеню
    '1279': 'park-avenue',
    'shop-1279': 'park-avenue',
    'myastoriya-park-avenue': 'park-avenue',
};

/**
 * Зворотній маппінг: menu URL slug → API slug
 */
export const MENU_SLUG_TO_SHOP_SLUG: Record<string, string> = {
    'obolon': 'myastoriya-obolon',
    'poznyaki': 'myastoriya-poznyaki',
    'teremky': 'myastoriya-teremky',
    'park-avenue': 'myastoriya-park-avenue',
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


