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




