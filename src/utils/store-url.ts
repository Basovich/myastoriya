export interface StoreSlugTarget {
    id?: string | number | null;
    slug?: string | null;
}

/**
 * Returns the exact URL slug for a given store from API.
 * If slug is missing, falls back directly to store ID.
 */
export function getStoreSeoSlug(store: StoreSlugTarget): string {
    if (store.slug) {
        return store.slug;
    }
    return String(store.id || '');
}

/**
 * Resolves a given URL slug to the backend slug identifier.
 * Uses exact slug directly without custom overrides.
 */
export function resolveStoreBackendSlug(slug: string): string {
    return slug || '';
}

const LEGACY_STORE_REDIRECTS: Record<string, string> = {
    'shop-334': 'meat-bar-vid-myastoriya-ivano-frankivsk',
    'shop-880': 'meat-bar-vid-myastoriya-lavina',
    'shop-314': 'meat-bar-vid-myastoriya-sofia',
    'shop-1': 'myastoriya-obolon',
    'shop-222': 'myastoriya-obolon',
    'shop-326': 'myastoriya-park-avenue',
    'shop-225': 'myastoriya-park-avenue',
    'shop-2': 'myastoriya-poznyaki',
    'shop-200': 'myastoriya-poznyaki',
    'shop-4': 'myastoriya-teremky',
    'shop-226': 'myastoriya-teremky',
};

/**
 * Legacy store redirect check (maps legacy shop-* slugs to actual store slugs).
 */
export function getLegacyStoreRedirectSlug(slug?: string): string | null {
    if (!slug) return null;
    return LEGACY_STORE_REDIRECTS[slug] || null;
}

import { getLocalizedHref } from './i18n-helpers';
import { Locale } from '@/i18n/config';

/**
 * Builds the canonical relative URL for a store page.
 * e.g. /ua/our-stores/m-yastoriya-vid-meat-bar/
 */
export function getStoreHref(store: StoreSlugTarget, lang?: Locale): string {
    const slug = getStoreSeoSlug(store);
    const rawPath = `/our-stores/${slug}/`;
    return lang ? getLocalizedHref(rawPath, lang) : rawPath;
}
