import { siteData } from "@/config/site";

export interface HreflangAlternates {
    canonical: string;
    languages: Record<string, string>;
}

/**
 * Generates hreflang alternate links and canonical link for SEO.
 * @param pathname The request pathname (e.g., '/ua/contacts/' or '/contacts' or '/ru/our-stores/')
 * @param currentLang The current page language ('ua', 'ru', 'uk', etc.)
 */
export function getHreflangAlternates(
    pathname: string = "/",
    currentLang: string = "ua"
): HreflangAlternates {
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || siteData.url).replace(/\/+$/, "");

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
