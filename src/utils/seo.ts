import { siteData } from "@/config/site";
import { getSeoByUrlApi } from "@/lib/graphql";

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

export function setRequestBreadcrumbJsonLd(data: object, pathname?: string) {
    if (pathname) {
        addRequestJsonLdScript(pathname, data);
    }
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
 * Safely formats Next.js title metadata.
 * If titleStr already ends with site brand (| М'ясторія or | Мястория), uses absolute object to prevent Next.js layout template duplication.
 * Otherwise returns string so Next.js applies layout template (%s | М'ясторія).
 */
export function formatTitleConfig(titleStr: string | undefined | null, _lang?: string): { absolute: string } | string {
    void _lang;
    if (!titleStr) return '';
    const cleanTitle = titleStr.trim();
    if (/\|\s*(М'ясторія|Мястория|Myastoriya)/i.test(cleanTitle)) {
        return { absolute: cleanTitle };
    }
    return cleanTitle;
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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : siteData.url);

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
 * Generates Schema.org BreadcrumbList JSON-LD object.
 */
export function generateBreadcrumbJsonLd(
    items: BreadcrumbJsonLdItem[],
    lang: string = "ua",
    canonicalUrl?: string,
    overrideBaseUrl?: string
) {
    const fallbackUrl = process.env.NEXT_PUBLIC_SITE_URL 
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : siteData.url);
    const baseUrl = (overrideBaseUrl || fallbackUrl).replace(/\/+$/, "");

    const normalizedLang = lang.toLowerCase() === "ru" ? "ru" : "uk";

    const itemListElement = items.map((item, index) => {
        let absoluteUrl: string;

        if (item.href) {
            const cleanHref = item.href.split("?")[0];
            if (cleanHref.startsWith("http")) {
                absoluteUrl = cleanHref;
            } else {
                const relativePath = cleanHref
                    .replace(/^\/(?:ua|ru|en)(?=\/|$)/, "")
                    .replace(/^\/+/, "")
                    .replace(/\/+$/, "");

                if (!relativePath) {
                    absoluteUrl = normalizedLang === "ru" ? `${baseUrl}/ru/` : `${baseUrl}/`;
                } else {
                    absoluteUrl = normalizedLang === "ru" ? `${baseUrl}/ru/${relativePath}/` : `${baseUrl}/ua/${relativePath}/`;
                }
            }
        } else if (index === items.length - 1 && canonicalUrl) {
            absoluteUrl = canonicalUrl;
        } else {
            absoluteUrl = `${baseUrl}/`;
        }

        return {
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
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
    const fallbackUrl = process.env.NEXT_PUBLIC_SITE_URL 
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : siteData.url);
    const baseUrl = (dynamicBaseUrl || fallbackUrl).replace(/\/+$/, "");

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
            "price": product.cost,
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
 * Generates hreflang alternate links and canonical link for SEO.
 * @param pathname The request pathname (e.g., '/ua/contacts/' or '/contacts' or '/ru/our-stores/')
 * @param currentLang The current page language ('ua', 'ru', 'uk', etc.)
 * @param overrideBaseUrl Optional dynamic base URL (e.g. from request headers 'https://domain.com')
 */
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
 * Example (UA): "Стейки – купити з доставкою... — сторінка 2"
 * Example (RU): "Стейки – купить с доставкой... — страница 2"
 */
export function formatTitleWithPage(
    title: string,
    pageNum?: number,
    lang: string = "ua"
): string {
    const p = parsePageNum(pageNum);
    if (p <= 1) return title;
    const isRu = lang === "ru";
    const suffix = isRu ? ` — страница ${p}` : ` — сторінка ${p}`;
    return `${title}${suffix}`;
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

export interface StaticPageSeoData {
    h1: string;
    title: string;
    description: string;
}

const STATIC_PAGES_SEO: Record<string, { ua: StaticPageSeoData; ru: StaticPageSeoData }> = {
    home: {
        ua: {
            h1: "М'ясторія — мережа м’ясних магазинів-ресторанів",
            title: "М'ясторія — мережа м’ясних магазинів-ресторанів",
            description: "Магазини-ресторани «М'ясторія» – справжнього м'яса територія! ✅ Стейки, свіже м'ясо та готові страви ✅ Власне виробництво ✅ Замовлення онлайн з доставкою",
        },
        ru: {
            h1: "Мястория — сеть мясных магазинов-ресторанов",
            title: "Мястория — сеть мясных магазинов-ресторанов",
            description: "Магазины-рестораны «Мястория» – настоящего мяса территория! ✅ Стейки, свежее мясо и готовые блюда ✅ Собственное производство ✅ Заказ онлайн с доставкой",
        },
    },
    "our-stores": {
        ua: {
            h1: "Заклади «М'ясторія»",
            title: "Заклади «М'ясторія»: адреси та графік роботи | М'ясторія",
            description: "Заклади «М'ясторія» у Києві та інших містах ✅ Адреси та графік роботи ✅ Актуальне меню ресторанів ✅ Телефони та контактна інформація",
        },
        ru: {
            h1: "Заведения «Мястория»",
            title: "Заведения «Мястория»: адреса и график работы | Мястория",
            description: "Заведения «Мястория» в Киеве и других городах ✅ Адреса и график работы ✅ Актуальное меню ресторанов ✅ Телефоны и контактная информация",
        },
    },
    actions: {
        ua: {
            h1: "Акції",
            title: "Акції | М'ясторія",
            description: "Акції та спеціальні пропозиції в «М'ясторія» ✅ Знижки на м'ясо, стейки та готові страви ✅ Умови участі в акціях ✅ Терміни дії пропозицій",
        },
        ru: {
            h1: "Акции",
            title: "Акции | Мястория",
            description: "Акции и специальные предложения в «Мястория» ✅ Скидки на мясо, стейки и готовые блюда ✅ Условия участия в акциях ✅ Сроки действия предложений",
        },
    },
    "complex-discounts": {
        ua: {
            h1: "Комплексні знижки",
            title: "Комплексні знижки | М'ясторія",
            description: "Комплексні знижки в «М'ясторія» ✅ Спеціальні ціни на товари при купівлі разом ✅ Вигідніше, ніж купувати окремо ✅ Економія на замовленні",
        },
        ru: {
            h1: "Комплексные скидки",
            title: "Комплексные скидки | Мястория",
            description: "Комплексные скидки в «Мястория» ✅ Специальные цены на товары при покупке вместе ✅ Выгоднее, чем покупать отдельно ✅ Экономия на заказе",
        },
    },
    blog: {
        ua: {
            h1: "Блог",
            title: "Блог | М'ясторія",
            description: "Блог «М'ясторія» про м'ясо, стейки та їх приготування ✅ Корисні статті та поради ✅ Новини та події компанії ✅ Рецепти різноманітних страв",
        },
        ru: {
            h1: "Блог",
            title: "Блог | Мястория",
            description: "Блог «Мястория» о мясе, стейках и их приготовлении ✅ Полезные статьи и советы ✅ Новости и события компании ✅ Рецепты разнообразных блюд",
        },
    },
    "blog-article": {
        ua: {
            h1: "Статті",
            title: "Статті | М'ясторія",
            description: "Статті від «М'ясторія» про м'ясо та стейки ✅ Корисні поради та рекомендації ✅ Вибір і зберігання продуктів ✅ Особливості приготування",
        },
        ru: {
            h1: "Статьи",
            title: "Статьи | Мястория",
            description: "Статьи от «Мястория» о мясе и стейках ✅ Полезные советы и рекомендации ✅ Выбор и хранение продуктов ✅ Особенности приготовления",
        },
    },
    "blog-recipe": {
        ua: {
            h1: "Рецепти",
            title: "Рецепти | М'ясторія",
            description: "Рецепти від «М'ясторія» для приготування вдома ✅ М'ясні та інші смачні страви ✅ Списки необхідних інгредієнтів ✅ Покрокове приготування",
        },
        ru: {
            h1: "Рецепты",
            title: "Рецепты | Мястория",
            description: "Рецепты от «Мястория» для приготовления дома ✅ Мясные и другие вкусные блюда ✅ Списки необходимых ингредиентов ✅ Пошаговое приготовление",
        },
    },
    delivery: {
        ua: {
            h1: "Доставка та оплата",
            title: "Доставка та оплата | М'ясторія",
            description: "Оплата та доставка з «М'ясторія» ✅ Доступні способи оплати замовлень ✅ Вартість, зони та умови доставки ✅ Терміни та умови повернення",
        },
        ru: {
            h1: "Доставка и оплата",
            title: "Доставка и оплата | Мястория",
            description: "Оплата и доставка из «Мястория» ✅ Доступные способы оплаты заказов ✅ Стоимость, зоны и условия доставки ✅ Сроки и условия возврата",
        },
    },
    contacts: {
        ua: {
            h1: "Контакти",
            title: "Контакти | М'ясторія",
            description: "Контакти мережі «М'ясторія» ✅ Адреса та телефон головного офісу ✅ Форма зворотного зв'язку ✅ Адреси, телефони та графік роботи закладів",
        },
        ru: {
            h1: "Контакты",
            title: "Контакты | Мястория",
            description: "Контакты сети «Мястория» ✅ Адрес и телефон главного офиса ✅ Форма обратной связи ✅ Адреса, телефоны и график работы заведений",
        },
    },
    careers: {
        ua: {
            h1: "Кар'єра в «М'ясторія» — ми чекаємо на тебе!",
            title: "Кар'єра в «М'ясторія»: актуальні вакансії | М'ясторія",
            description: "Кар'єра в «М'ясторія» — ми чекаємо на тебе! ✅ Можливості професійного зростання ✅ Комфортні умови праці ✅ Дружня атмосфера в колективі",
        },
        ru: {
            h1: "Карьера в «Мястория» — мы ждем тебя!",
            title: "Карьера в «Мястория»: актуальные вакансии | Мястория",
            description: "Карьера в «Мястория» — мы ждем тебя! ✅ Возможности профессионального роста ✅ Комфортные условия труда ✅ Дружеская атмосфера в коллективе",
        },
    },
    catalog: {
        ua: {
            h1: "Каталог продукції",
            title: "Каталог продукції | М'ясторія",
            description: "Каталог продукції в інтернет-магазині «М'ясторія» ✅ Стейки, свіже м'ясо та готові страви ✅ Продукція власного виробництва ✅ Онлайн-замовлення з доставкою",
        },
        ru: {
            h1: "Каталог продукции",
            title: "Каталог продукции | Мястория",
            description: "Каталог продукции в интернет-магазине «Мястория» ✅ Стейки, свежее мясо и готовые блюда ✅ Продукция собственного производства ✅ Онлайн-заказ с доставкой",
        },
    },
    "loyalty-program-rules": {
        ua: {
            h1: "Правила програми лояльності",
            title: "Правила програми лояльності | М'ясторія",
            description: "Правила програми лояльності «М'ясторія»: умови участі, порядок нарахування та використання бонусів, отримання знижок та інша інформація.",
        },
        ru: {
            h1: "Правила программы лояльности",
            title: "Правила программы лояльности | Мястория",
            description: "Правила программы лояльности «Мястория»: условия участия, порядок начисления и использования бонусов, получения скидок и другая информация.",
        },
    },
    oferta: {
        ua: {
            h1: "Публічний договір (оферта)",
            title: "Публічний договір (оферта) | М'ясторія",
            description: "Публічний договір (оферта) «М'ясторія»: порядок оформлення замовлень, умови оплати й доставки, відповідальність та інші положення договору.",
        },
        ru: {
            h1: "Публичный договор (оферта)",
            title: "Публичный договор (оферта) | Мястория",
            description: "Публичный договор (оферта) «Мястория»: порядок оформления заказов, условия оплаты и доставки, ответственность и другие положения договора.",
        },
    },
    "privacy-policy": {
        ua: {
            h1: "Правила використання та політика конфіденційності",
            title: "Правила використання та політика конфіденційності | М'ясторія",
            description: "Правила використання сайту та політика конфіденційності «М'ясторія»: умови користування сайтом, обробки, зберігання та захисту персональних даних.",
        },
        ru: {
            h1: "Правила использования и политика конфиденциальности",
            title: "Правила использования и политика конфиденциальности | Мястория",
            description: "Правила использования сайта и политика конфиденциальности «Мястория»: условия использования сайта, обработки, хранения и защиты персональных данных.",
        },
    },
};

/**
 * Generates SEO Title, Description, and H1 for main static/listing pages according to SEO requirements.
 */
export function getStaticPageSeoData(pageKey: string, lang: string = 'ua'): StaticPageSeoData {
    const isRu = lang === 'ru';
    const pageObj = STATIC_PAGES_SEO[pageKey];
    if (pageObj) {
        return isRu ? pageObj.ru : pageObj.ua;
    }
    return {
        h1: '',
        title: '',
        description: '',
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
 * Falls back to provided static/generated fallback data if API returns null/empty.
 */
export async function fetchSeoMetadataByUrl(
    url: string,
    lang: string = 'ua',
    fallback: ResolvedSeoData
): Promise<ResolvedSeoData> {
    const apiSeo = await getSeoByUrlApi(url, lang);
    if (!apiSeo || (!apiSeo.title && !apiSeo.description)) {
        return fallback;
    }

    const title = apiSeo.title?.trim() || fallback.title;
    const description = apiSeo.description?.trim() || fallback.description;
    const h1 = apiSeo.h1?.trim() || fallback.h1;

    return {
        title,
        description,
        h1,
        keywords: apiSeo.keywords ?? fallback.keywords,
        canonical: apiSeo.canonical ?? fallback.canonical,
        noindex: apiSeo.noindex ?? fallback.noindex,
    };
}




