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

/**
 * Legacy store redirect check (no-op since exact admin slugs are used).
 */
export function getLegacyStoreRedirectSlug(_slug: string): string | null {
    return null;
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
