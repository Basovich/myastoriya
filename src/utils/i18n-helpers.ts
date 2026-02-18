import { i18n, type Locale } from '@/i18n/config';

export function getLocalizedHref(href: string, lang: Locale): string {
    // Return as is for external links, anchors, or special protocols
    if (/^(http|https|#|mailto:|tel:)/.test(href)) {
        return href;
    }

    // Return as is for empty href
    if (!href) return href;

    // For default locale, ensure clean path (no /ua prefix)
    if (lang === i18n.defaultLocale) {
        return href;
    }

    // For other locales, prepend locale if not already present
    // Assumes href starts with / if it's an internal route from siteData
    const cleanHref = href.startsWith('/') ? href : `/${href}`;
    return `/${lang}${cleanHref}`;
}
