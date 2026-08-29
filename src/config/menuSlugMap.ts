/**
 * Маппінг API slug магазину → menu URL slug.
 * Тільки для ресторанів (isCompanyStore: true).
 * Мітбари не потребують маппінгу — їхній API slug використовується напряму.
 */
export const RESTAURANT_MENU_SLUG_MAP: Record<string, string> = {
    'shop-1': 'obolon',
    'shop-2': 'poznyaki',
    'shop-4': 'teremky',
};

/**
 * Зворотній маппінг: menu URL slug → API slug
 */
export const MENU_SLUG_TO_SHOP_SLUG: Record<string, string> = {
    'obolon': 'shop-1',
    'poznyaki': 'shop-2',
    'teremky': 'shop-4',
};

/**
 * Отримати menu URL slug для shop (для побудови посилань).
 * Для мітбарів — повертає API slug без змін.
 */
export function getMenuSlug(apiSlug: string): string {
    return RESTAURANT_MENU_SLUG_MAP[apiSlug] ?? apiSlug;
}

/**
 * Отримати API slug за menu URL slug (для запиту при рендері сторінки меню).
 * Для мітбарів — повертає menu slug без змін (вони однакові).
 */
export function getApiSlugFromMenu(menuSlug: string): string {
    return MENU_SLUG_TO_SHOP_SLUG[menuSlug] ?? menuSlug;
}


