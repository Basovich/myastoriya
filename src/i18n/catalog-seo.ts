import type { Locale } from '@/i18n/config';

interface CatalogSeoTemplates {
    /** Title: `[Категорія] [Значення] – ...` */
    titleSuffix: string;
    /** Description, плейсхолдери: {name}, {price} */
    description: string;
    /** Description без мінімальної ціни (якщо її не вдалося отримати) */
    descriptionNoPrice: string;
}

export const CATALOG_SEO_TEMPLATES: Record<Locale, CatalogSeoTemplates> = {
    ua: {
        titleSuffix: 'купити з доставкою по Києву та Україні | Мʼясторія',
        description:
            '{name} в інтернет-магазині «Мʼясторія» ✅ Ціни від {price} грн ✅ Свіжа та якісна продукція ✅ Замовлення онлайн ✅ Доставка по Києву та Україні',
        descriptionNoPrice:
            '{name} в інтернет-магазині «Мʼясторія» ✅ Свіжа та якісна продукція ✅ Замовлення онлайн ✅ Доставка по Києву та Україні',
    },
    ru: {
        titleSuffix: 'купить с доставкой по Киеву и Украине | Мястория',
        description:
            '{name} в интернет-магазине «Мястория» ✅ Цены от {price} грн ✅ Свежая и качественная продукция ✅ Заказ онлайн ✅ Доставка по Киеву и Украине',
        descriptionNoPrice:
            '{name} в интернет-магазине «Мястория» ✅ Свежая и качественная продукция ✅ Заказ онлайн ✅ Доставка по Киеву и Украине',
    },
};

export interface CatalogSeoTexts {
    h1: string;
    title: string;
    description: string;
}

/**
 * Генерує H1, Title та Description SEO-сторінки фільтра за шаблонами.
 */
export function buildCatalogFilterSeoTexts(
    lang: Locale,
    categoryName: string,
    seoValueLabel: string,
    minPrice: number | null,
): CatalogSeoTexts {
    const tpl = CATALOG_SEO_TEMPLATES[lang] ?? CATALOG_SEO_TEMPLATES.ua;
    const h1 = `${categoryName} ${seoValueLabel}`.replace(/\s+/g, ' ').trim();
    const description = (minPrice !== null ? tpl.description : tpl.descriptionNoPrice)
        .replace('{name}', h1)
        .replace('{price}', minPrice !== null ? String(minPrice) : '');

    return {
        h1,
        title: `${h1} – ${tpl.titleSuffix}`,
        description,
    };
}

