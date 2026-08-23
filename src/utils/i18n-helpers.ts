import { i18n, type Locale } from '@/i18n/config';

export function getLocalizedHref(href: string, lang: Locale): string {
    // Return as is for external links, anchors, or special protocols
    if (/^(http|https|#|mailto:|tel:)/.test(href)) {
        return href;
    }

    // Return as is for empty href
    if (!href) return href;

    // If href already has a locale prefix, return as is (don't double-prefix)
    const hasLocalePrefix = i18n.locales.some(
        (locale) => href.startsWith(`/${locale}/`) || href === `/${locale}`
    );
    if (hasLocalePrefix) {
        return href;
    }

    // Ensure internal href starts with /
    const cleanHref = href.startsWith('/') ? href : `/${href}`;

    // Special rule: Root home page for default locale (UA) is / (without /ua/)
    if (lang === i18n.defaultLocale && (cleanHref === '/' || cleanHref === '')) {
        return '/';
    }

    // All internal pages (both UA and RU) must have locale prefix /ua/ or /ru/ and trailing slash
    let result = `/${lang}${cleanHref}`;
    if (!result.endsWith('/')) {
        result = `${result}/`;
    }

    return result;
}
