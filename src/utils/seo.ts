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


