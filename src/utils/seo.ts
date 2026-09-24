import { siteData } from "@/config/site";

export interface HreflangAlternates {
    canonical: string;
    languages: Record<string, string>;
}

/**
 * Extracts dynamic base URL from request headers if present.
 */
export function getDynamicBaseUrl(headersList?: Headers): string | undefined {
    if (!headersList) return undefined;
    const host = headersList.get("x-forwarded-host") || headersList.get("host");
    if (!host) return undefined;
    const proto = headersList.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
}

/**
 * Generates hreflang alternate links and canonical link for SEO.
 * @param pathname The request pathname (e.g., '/ua/contacts/' or '/contacts' or '/ru/our-stores/')
 * @param currentLang The current page language ('ua', 'ru', 'uk', etc.)
 * @param overrideBaseUrl Optional dynamic base URL (e.g. from request headers 'https://domain.com')
 */
export function getHreflangAlternates(
    pathname: string = "/",
    currentLang: string = "ua",
    overrideBaseUrl?: string
): HreflangAlternates {
    const fallbackUrl = process.env.NEXT_PUBLIC_SITE_URL 
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : siteData.url);

    const baseUrl = (overrideBaseUrl || fallbackUrl).replace(/\/+$/, "");

    // 1. Remove query string if included in pathname
    const cleanPathname = pathname.split("?")[0];

    // 2. Extract relative path after locale prefix
    // Strips leading /ua/, /ru/, /en/, /ua, /ru, /en or /
    const relativePath = cleanPathname
        .replace(/^\/(?:ua|ru|en)(?=\/|$)/, "")
        .replace(/^\/+/, "")
        .replace(/\/+$/, "");

    let ukUrl: string;
    let ruUrl: string;

    if (!relativePath) {
        // Homepage
        ukUrl = `${baseUrl}/`;
        ruUrl = `${baseUrl}/ru/`;
    } else {
        // Any subpage
        ukUrl = `${baseUrl}/ua/${relativePath}/`;
        ruUrl = `${baseUrl}/ru/${relativePath}/`;
    }

    const normalizedLang = currentLang === "ru" ? "ru" : "uk";
    const canonical = normalizedLang === "ru" ? ruUrl : ukUrl;

    return {
        canonical,
        languages: {
            uk: ukUrl,
            ru: ruUrl,
        },
    };
}

/**
 * Generates hreflang alternate links when localized paths/slugs for each language are explicitly known.
 * @param paths Map of language code ('uk'|'ua', 'ru') to relative paths (e.g. { uk: '/actions/foo/', ru: '/actions/bar/' })
 * @param currentLang Current page language
 * @param overrideBaseUrl Optional dynamic base URL
 */
export function getExplicitHreflangAlternates(
    paths: { uk: string; ru: string },
    currentLang: string = "ua",
    overrideBaseUrl?: string
): HreflangAlternates {
    const fallbackUrl = process.env.NEXT_PUBLIC_SITE_URL 
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : siteData.url);

    const baseUrl = (overrideBaseUrl || fallbackUrl).replace(/\/+$/, "");

    const formatUrl = (path: string, lang: 'uk' | 'ru') => {
        const cleanPath = path.split("?")[0].replace(/^\/(?:ua|ru|en)(?=\/|$)/, "").replace(/^\/+/, "").replace(/\/+$/, "");
        if (!cleanPath) return lang === 'ru' ? `${baseUrl}/ru/` : `${baseUrl}/`;
        return lang === 'ru' ? `${baseUrl}/ru/${cleanPath}/` : `${baseUrl}/ua/${cleanPath}/`;
    };

    const ukUrl = formatUrl(paths.uk, 'uk');
    const ruUrl = formatUrl(paths.ru, 'ru');

    const normalizedLang = currentLang === "ru" ? "ru" : "uk";
    const canonical = normalizedLang === "ru" ? ruUrl : ukUrl;

    return {
        canonical,
        languages: {
            uk: ukUrl,
            ru: ruUrl,
        },
    };
}

export interface CategorySeoData {
    title: string;
    description: string;
}

/**
 * Generates SEO Title and Description for product category pages according to SEO requirements.
 */
export function getCategorySeoData(
    categoryName: string,
    minPrice?: number | null,
    lang: string = 'ua'
): CategorySeoData {
    const isRu = lang === 'ru';
    const cleanName = categoryName.trim();

    if (isRu) {
        const title = `${cleanName} – купить с доставкой по Киеву и Украине`;
        const description = minPrice && minPrice > 0
            ? `${cleanName} в интернет-магазине «Мястория» ✅ Цены от ${Math.round(minPrice)} грн ✅ Свежая и качественная продукция ✅ Заказ онлайн ✅ Доставка по Киеву и Украине`
            : `${cleanName} в интернет-магазине «Мястория» ✅ Свежая и качественная продукция ✅ Заказ онлайн ✅ Доставка по Киеву и Украине`;
        return { title, description };
    }

    const title = `${cleanName} – купити з доставкою по Києву та Україні`;
    const description = minPrice && minPrice > 0
        ? `${cleanName} в інтернет-магазині «Мʼясторія» ✅ Ціни від ${Math.round(minPrice)} грн ✅ Свіжа та якісна продукція ✅ Замовлення онлайн ✅ Доставка по Києву та Україні`
        : `${cleanName} в інтернет-магазині «Мʼясторія» ✅ Свіжа та якісна продукція ✅ Замовлення онлайн ✅ Доставка по Києву та Україні`;

    return { title, description };
}

export interface ProductSeoData {
    title: string;
    description: string;
}

/**
 * Generates SEO Title and Description for product pages according to SEO requirements.
 */
export function getProductSeoData(
    productName: string,
    price?: number | null,
    lang: string = 'ua'
): ProductSeoData {
    const isRu = lang === 'ru';
    const cleanName = productName.trim();

    if (isRu) {
        const title = `${cleanName} | Мястория`;
        const description = price && price > 0
            ? `${cleanName} в интернет-магазине «Мястория» ✅ Цена ${Math.round(price)} грн ✅ Свежая и качественная продукция ✅ Заказ онлайн ✅ Доставка по Киеву и Украине`
            : `${cleanName} в интернет-магазине «Мястория» ✅ Свежая и качественная продукция ✅ Заказ онлайн ✅ Доставка по Киеву и Украине`;
        return { title, description };
    }

    const title = cleanName;
    const description = price && price > 0
        ? `${cleanName} в інтернет-магазині «Мʼясторія» ✅ Ціна ${Math.round(price)} грн ✅ Свіжа та якісна продукція ✅ Замовлення онлайн ✅ Доставка по Києву та Україні`
        : `${cleanName} в інтернет-магазині «Мʼясторія» ✅ Свіжа та якісна продукція ✅ Замовлення онлайн ✅ Доставка по Києву та Україні`;

    return { title, description };
}

export interface StoreSeoData {
    title: string;
    description: string;
}

/**
 * Generates SEO Title and Description for store pages according to SEO requirements.
 */
export function getStoreSeoData(
    storeName: string,
    address: string,
    lang: string = 'ua'
): StoreSeoData {
    const isRu = lang === 'ru';
    const cleanName = storeName.trim();
    const cleanAddress = address.trim();

    if (isRu) {
        const title = `${cleanName}: ${cleanAddress} | Мястория`;
        const description = `${cleanName} по адресу ${cleanAddress}. Посмотрите актуальное меню, график работы, контакты и другую информацию о заведении.`;
        return { title, description };
    }

    const title = `${cleanName}: ${cleanAddress}`;
    const description = `${cleanName} за адресою ${cleanAddress}. Перегляньте актуальне меню, графік роботи, контакти та іншу інформацію про заклад.`;

    return { title, description };
}

export interface BlogSeoData {
    title: string;
    description: string;
}

/**
 * Generates SEO Title and Description for blog publication pages according to SEO requirements.
 */
export function getBlogSeoData(
    postName: string,
    postText?: string | null,
    lang: string = 'ua'
): BlogSeoData {
    const isRu = lang === 'ru';
    const cleanTitle = postName.trim();

    let cleanDescription = '';
    if (postText) {
        cleanDescription = postText
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 155)
            .trim();
    }

    if (isRu) {
        const title = `${cleanTitle} | Мястория`;
        return { title, description: cleanDescription };
    }

    const title = cleanTitle;
    return { title, description: cleanDescription };
}

export interface ActionSeoData {
    title: string;
    description: string;
}

/**
 * Generates SEO Title and Description for promotion/action pages according to SEO requirements.
 */
export function getActionSeoData(
    actionName: string,
    actionText?: string | null,
    lang: string = 'ua'
): ActionSeoData {
    const isRu = lang === 'ru';
    const cleanTitle = actionName.trim();

    let cleanDescription = '';
    if (actionText) {
        cleanDescription = actionText
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 155)
            .trim();
    }

    if (isRu) {
        const title = `${cleanTitle} | Мястория`;
        return { title, description: cleanDescription };
    }

    const title = cleanTitle;
    return { title, description: cleanDescription };
}

export interface ComplexDiscountSeoData {
    title: string;
    description: string;
}

/**
 * Generates SEO Title and Description for complex discount pages according to SEO requirements.
 */
export function getComplexDiscountSeoData(
    discountName: string,
    discountText?: string | null,
    lang: string = 'ua'
): ComplexDiscountSeoData {
    const isRu = lang === 'ru';
    const cleanTitle = discountName.trim();

    let cleanDescription = '';
    if (discountText) {
        cleanDescription = discountText
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 155)
            .trim();
    }

    if (isRu) {
        const title = `${cleanTitle} | Мястория`;
        return { title, description: cleanDescription };
    }

    const title = cleanTitle;
    return { title, description: cleanDescription };
}



