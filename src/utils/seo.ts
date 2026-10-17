import { cache } from "react";
import { siteData } from "@/config/site";
import { getSeoByUrlApi } from "@/lib/graphql";

// Dedupes seoByUrl within a single request (generateMetadata + page render both need it)
const getSeoByUrlCached = cache((url: string, lang: string) => getSeoByUrlApi(url, lang));

const requestJsonLdMap = new Map<string, object[]>();

export function addRequestJsonLdScript(pathname: string, data: object) {
    if (!pathname) return;
    const cleanPath = pathname.trim().replace(/\/+$/, '') || '/';
    let list = requestJsonLdMap.get(cleanPath);
    if (!list) {
        list = [];
        requestJsonLdMap.set(cleanPath, list);
        setTimeout(() => {
            requestJsonLdMap.delete(cleanPath);
        }, 5000);
    }
    list.push(data);
}

export function setRequestBreadcrumbJsonLd(_data: object, _pathname?: string) {
    void _data;
    void _pathname;
    // BreadcrumbList JSON-LD is rendered universally by Breadcrumbs component.
}

export function setRequestProductJsonLd(data: object, pathname?: string) {
    if (pathname) {
        addRequestJsonLdScript(pathname, data);
    }
}

export function getRequestJsonLdScripts(pathname?: string): object[] {
    if (!pathname) return [];
    const cleanPath = pathname.trim().replace(/\/+$/, '') || '/';
    return requestJsonLdMap.get(cleanPath) || [];
}

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
 * Returns localized site name for og:site_name tag.
 */
export function getSiteName(lang: string = "ua"): string {
    const l = lang.toLowerCase();
    if (l === "ru") return "Мястория";
    if (l === "en") return "Myastoriya";
    return "М'ясторія";
}

/**
 * Decodes common HTML entities to their literal character equivalents.
 */
export function decodeHtmlEntities(text: string): string {
    if (!text) return '';
    return text
        .replace(/&nbsp;/gi, ' ')
        .replace(/&mdash;/gi, '—')
        .replace(/&ndash;/gi, '–')
        .replace(/&laquo;/gi, '«')
        .replace(/&raquo;/gi, '»')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&amp;/gi, '&')
        .replace(/&hellip;/gi, '...')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
}



export function getBaseSiteUrl(overrideBaseUrl?: string): string {
    const configured = overrideBaseUrl
        || process.env.NEXT_PUBLIC_SITE_URL
        || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
        || siteData.url;
    return configured.replace(/\/+$/, "");
}

export interface OpenGraphOptions {
    title: string;
    description: string;
    canonicalUrl: string;
    lang?: string;
    image?: string | null;
    type?: "website" | "article" | "product";
}

/**
 * Builds standard Open Graph metadata object for Next.js Metadata API.
 */
export function buildOpenGraphMetadata({
    title,
    description,
    canonicalUrl,
    lang = "ua",
    image,
    type = "website",
}: OpenGraphOptions) {
    const siteName = getSiteName(lang);
    const fallbackImage = siteData.seo.ogImage || "/images/og-image.jpg";
    const imageUrl = image || fallbackImage;
    const baseUrl = getBaseSiteUrl();

    const fullImageUrl = imageUrl.startsWith("http") 
        ? imageUrl 
        : `${baseUrl.replace(/\/+$/, "")}/${imageUrl.replace(/^\/+/, "")}`;

    const locale = lang === "ru" ? "ru_RU" : (lang === "en" ? "en_US" : "uk_UA");

    return {
        title,
        description,
        url: canonicalUrl,
        siteName,
        locale,
        type: type as "website",
        images: [
            {
                url: fullImageUrl,
                alt: title,
            },
        ],
    };
}

export interface BreadcrumbJsonLdItem {
    label: string;
    href?: string;
}

/**
 * Resolves an absolute URL for a breadcrumb item according to site locale routing.
 */
export function toAbsoluteBreadcrumbUrl(
    href: string | undefined,
    isLast: boolean,
    canonicalOrCurrentUrl?: string,
    lang: string = "ua",
    overrideBaseUrl?: string
): string {
    const baseUrl = getBaseSiteUrl(overrideBaseUrl);
    const isRu = lang.toLowerCase() === "ru";

    if (href) {
        const cleanHref = href.split(/[?#]/)[0];
        if (cleanHref.startsWith("http://") || cleanHref.startsWith("https://")) {
            return cleanHref;
        }

        const relativePath = cleanHref
            .replace(/^\/(?:ua|ru|en)(?=\/|$)/, "")
            .replace(/^\/+/, "")
            .replace(/\/+$/, "");

        if (!relativePath) {
            return isRu ? `${baseUrl}/ru/` : `${baseUrl}/`;
        }

        return isRu ? `${baseUrl}/ru/${relativePath}/` : `${baseUrl}/ua/${relativePath}/`;
    }

    if (isLast && canonicalOrCurrentUrl) {
        if (canonicalOrCurrentUrl.startsWith("http://") || canonicalOrCurrentUrl.startsWith("https://")) {
            return canonicalOrCurrentUrl;
        }
        let cleanPath = canonicalOrCurrentUrl.split(/[?#]/)[0] || "/";
        if (cleanPath !== "/" && !cleanPath.endsWith("/")) {
            cleanPath = `${cleanPath}/`;
        }
        return `${baseUrl}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
    }

    return isRu ? `${baseUrl}/ru/` : `${baseUrl}/`;
}

/**
 * Generates Schema.org BreadcrumbList JSON-LD object.
 */
export function generateBreadcrumbJsonLd(
    items: BreadcrumbJsonLdItem[],
    lang: string = "ua",
    canonicalUrl?: string,
    overrideBaseUrl?: string
) {
    const baseUrl = getBaseSiteUrl(overrideBaseUrl);

    const itemListElement = items.map((item, index) => {
        const isLast = index === items.length - 1;
        const absoluteUrl = toAbsoluteBreadcrumbUrl(item.href, isLast, canonicalUrl, lang, baseUrl);

        return {
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label.trim(),
            "item": absoluteUrl,
        };
    });

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": itemListElement,
    };
}

export interface ProductJsonLdParams {
    product: {
        id: string | number;
        name: string;
        text?: string | null;
        cost: number;
        purchaseCost?: number | null;
        available?: number | boolean | null;
        images?: Array<{ url?: { main2x?: string | null; grid2x?: string | null; grid1x?: string | null; main1x?: string | null } | null }> | null;
        image?: { url?: { main2x?: string | null; grid2x?: string | null; grid1x?: string | null; main1x?: string | null } | null } | null;
    };
    lang?: string;
    canonicalUrl: string;
    dynamicBaseUrl?: string;
    imageUrl?: string | null;
    ratingData?: {
        ratingValue?: number | null;
        ratingCount?: number | null;
    };
}

/**
 * Generates Schema.org Product JSON-LD object.
 */
export function generateProductJsonLd({
    product,
    lang = "ua",
    canonicalUrl,
    dynamicBaseUrl,
    imageUrl,
    ratingData,
}: ProductJsonLdParams) {
    const baseUrl = getBaseSiteUrl(dynamicBaseUrl);

    let resolvedImage = imageUrl;
    if (!resolvedImage) {
        const entry = product.images?.[0] ?? product.image ?? null;
        resolvedImage = entry?.url?.main2x || entry?.url?.grid2x || entry?.url?.grid1x || entry?.url?.main1x || null;
    }
    const fullImageUrl = resolvedImage
        ? (resolvedImage.startsWith("http") ? resolvedImage : `${baseUrl}/${resolvedImage.replace(/^\/+/, "")}`)
        : `${baseUrl}/images/og-image.jpg`;

    const rawDescription = product.text || "";
    const cleanDescription = rawDescription.replace(/<[^>]*>/g, "").trim() || product.name;

    const isAvailable = typeof product.available === "boolean"
        ? product.available
        : (product.available === 1 || product.available === null || product.available === undefined);
    const availability = isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock";

    const brandName = lang.toLowerCase() === "ru" ? "Мястория" : "М'ясторія";
    const effectivePrice = (typeof product.purchaseCost === 'number' && product.purchaseCost > 0)
        ? product.purchaseCost
        : product.cost;

    const schema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": [fullImageUrl],
        "description": cleanDescription,
        "sku": String(product.id),
        "brand": {
            "@type": "Brand",
            "name": brandName,
        },
        "offers": {
            "@type": "Offer",
            "url": canonicalUrl,
            "price": effectivePrice,
            "priceCurrency": "UAH",
            "availability": availability,
        },
    };

    if (ratingData && ratingData.ratingValue && ratingData.ratingCount && ratingData.ratingCount > 0) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": Number(ratingData.ratingValue.toFixed(1)),
            "ratingCount": ratingData.ratingCount,
            "bestRating": 5,
        };
    }

    return schema;
}

/**
 * Safely parses page number from searchParams value or string.
 * Returns valid page integer >= 1.
 */
export function parsePageNum(pageValue?: string | string[] | number | null): number {
    if (!pageValue) return 1;
    const val = Array.isArray(pageValue) ? pageValue[0] : pageValue;
    const parsed = typeof val === "number" ? val : parseInt(String(val), 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : 1;
}

/**
 * Appends page number to SEO title for pagination pages (page >= 2).
 * Example (UA): "Стейки – купити з доставкою... | М'ясторія — сторінка 2"
 * Example (RU): "Стейки – купить с доставкой... | Мястория — страница 2"
 */
export function formatTitleWithPage(
    title: string,
    pageNum?: number,
    lang: string = "ua"
): string {
    const p = parsePageNum(pageNum);
    if (p <= 1 || !title) return title || "";
    const isRu = lang === "ru";
    const suffix = isRu ? ` — страница ${p}` : ` — сторінка ${p}`;
    return `${title.trim()}${suffix}`;
}

/**
 * Generates hreflang alternate links and canonical link for SEO.
 * @param pathname The request pathname (e.g., '/ua/contacts/' or '/contacts' or '/ru/our-stores/')
 * @param currentLang The current page language ('ua', 'ru', 'uk', etc.)
 * @param overrideBaseUrl Optional dynamic base URL (e.g. from request headers 'https://domain.com')
 * @param pageNum Optional page number for pagination (e.g. 2)
 */
export function getHreflangAlternates(
    pathname: string = "/",
    currentLang: string = "ua",
    overrideBaseUrl?: string,
    pageNum?: number
): HreflangAlternates {
    const baseUrl = getBaseSiteUrl(overrideBaseUrl);

    // 1. Remove query string if included in pathname
    const cleanPathname = pathname.split("?")[0];

    // 2. Extract relative path after locale prefix
    // Strips leading /ua/, /ru/, /en/, /ua, /ru, /en or /
    const relativePath = cleanPathname
        .replace(/^\/(?:ua|ru|en)(?=\/|$)/, "")
        .replace(/^\/+/, "")
        .replace(/\/+$/, "");

    const p = parsePageNum(pageNum);
    const pageSuffix = p > 1 ? `?page=${p}` : "";

    let ukUrl: string;
    let ruUrl: string;

    if (!relativePath) {
        // Homepage
        ukUrl = `${baseUrl}/${pageSuffix}`;
        ruUrl = `${baseUrl}/ru/${pageSuffix}`;
    } else {
        // Any subpage
        ukUrl = `${baseUrl}/ua/${relativePath}/${pageSuffix}`;
        ruUrl = `${baseUrl}/ru/${relativePath}/${pageSuffix}`;
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
    const baseUrl = getBaseSiteUrl(overrideBaseUrl);

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

/**
 * Resolves canonical + hreflang links for a static page rendered via <HreflangLinks />.
 * Canonical from seoByUrl (API) takes priority, except pagination pages (page >= 2).
 * @param path Relative path without locale, e.g. '/contacts/'
 * @param lang Current page language ('ua', 'ru', etc.)
 * @param fallbackSeo Fallback SEO data if API returns empty metadata
 * @param dynamicBaseUrl Optional dynamic base URL from request headers
 * @param pageNum Optional pagination page number
 */
export async function resolvePageHreflangLinks(
    path: string,
    lang: string,
    fallbackSeo?: Partial<ResolvedSeoData>,
    dynamicBaseUrl?: string,
    pageNum?: number
): Promise<HreflangAlternates> {
    const alternates = getHreflangAlternates(path, lang, dynamicBaseUrl, pageNum);
    if (parsePageNum(pageNum) > 1) return alternates;
    const seo = await fetchSeoMetadataByUrl(`/${lang}${path}`, lang, fallbackSeo);
    return {
        canonical: seo.canonical || alternates.canonical,
        languages: alternates.languages,
    };
}

export interface DefaultSeoData {
    h1: string;
    title: string;
    description: string;
}

/**
 * Generates default SEO Title, Description, and H1 for technical or unconfigured pages.
 */
export function getDefaultSeoData(pageTitle: string, lang: string = 'ua'): DefaultSeoData {
    const isRu = lang === 'ru';
    const cleanTitle = pageTitle.trim();
    const siteBrand = isRu ? 'Мястория' : "М'ясторія";
    const title = `${cleanTitle} | ${siteBrand}`;

    return {
        h1: cleanTitle,
        title,
        description: "",
    };
}

export interface ResolvedSeoData {
    title: string;
    description: string;
    h1: string;
    keywords?: string | null;
    canonical?: string | null;
    noindex?: boolean | null;
}

/**
 * Fetches SEO metadata by URL from backend API (seoByUrl).
 * Falls back to provided fallback data if API returns null/empty.
 */
export async function fetchSeoMetadataByUrl(
    url: string,
    lang: string = 'ua',
    fallback?: Partial<ResolvedSeoData>
): Promise<ResolvedSeoData> {
    const apiSeo = await getSeoByUrlCached(url, lang);
    const title = apiSeo?.title?.trim() || fallback?.title || "";
    let description = apiSeo?.description?.trim() || fallback?.description || "";
    const h1 = apiSeo?.h1?.trim() || fallback?.h1 || "";

    if (description) {
        description = description.replace(/(?:\s+грн\.?){2,}/gi, ' грн').trim();
    }

    return {
        title,
        description,
        h1,
        keywords: apiSeo?.keywords ?? fallback?.keywords ?? null,
        canonical: apiSeo?.canonical ?? fallback?.canonical ?? null,
        noindex: apiSeo?.noindex ?? fallback?.noindex ?? null,
    };
}





