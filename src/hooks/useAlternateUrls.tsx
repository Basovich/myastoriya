'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type AlternateUrlsMap = Record<string, string>;

interface AlternateUrlsContextType {
    alternateUrls: AlternateUrlsMap | null;
    setAlternateUrls: (urls: AlternateUrlsMap | null) => void;
}

const AlternateUrlsContext = createContext<AlternateUrlsContextType | null>(null);

export function AlternateUrlsProvider({ children }: { children: React.ReactNode }) {
    const [alternateUrls, setAlternateUrlsState] = useState<AlternateUrlsMap | null>(null);

    const setAlternateUrls = useCallback((urls: AlternateUrlsMap | null) => {
        setAlternateUrlsState(urls);
    }, []);

    const value = useMemo(
        () => ({
            alternateUrls,
            setAlternateUrls,
        }),
        [alternateUrls, setAlternateUrls]
    );

    return (
        <AlternateUrlsContext.Provider value={value}>
            {children}
        </AlternateUrlsContext.Provider>
    );
}

export function useAlternateUrls(): AlternateUrlsContextType {
    const context = useContext(AlternateUrlsContext);
    if (!context) {
        return {
            alternateUrls: null,
            setAlternateUrls: () => {},
        };
    }
    return context;
}

/**
 * Extracts pathname + search from an absolute URL or returns relative path as-is.
 */
export function getRelativePathFromUrl(urlOrPath: string): string {
    if (!urlOrPath) return '';
    try {
        if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
            const parsed = new URL(urlOrPath);
            return parsed.pathname + parsed.search;
        }
    } catch {
        // Fallback to original string if URL parsing fails
    }
    return urlOrPath;
}

/**
 * Resolves the target language URL taking into account alternate URLs, DOM hreflang, or fallback pathname.
 */
export function resolveSwitchUrl(
    targetLang: 'ua' | 'ru',
    pathname: string | null,
    searchParams: { toString: () => string } | null,
    alternateUrls: AlternateUrlsMap | null
): string {
    // 1. Check alternateUrls context
    const alternateKey = targetLang === 'ua' ? 'uk' : 'ru';
    let customUrl = alternateUrls?.[alternateKey] || (targetLang === 'ua' ? alternateUrls?.['ua'] : undefined);

    // 2. Client-side DOM fallback
    if (!customUrl && typeof document !== 'undefined') {
        const hreflangCode = targetLang === 'ua' ? 'uk' : 'ru';
        const linkTag = document.querySelector(`link[rel="alternate"][hreflang="${hreflangCode}"]`);
        const href = linkTag?.getAttribute('href');
        if (href) {
            customUrl = href;
        }
    }

    if (customUrl) {
        const relPath = getRelativePathFromUrl(customUrl);
        const query = searchParams ? searchParams.toString() : '';
        if (query && !relPath.includes('?')) {
            return `${relPath}?${query}`;
        }
        return relPath;
    }

    // 3. Fallback for pages without custom alternates
    if (!pathname) return targetLang === 'ua' ? '/' : '/ru/';

    const segments = pathname.split('/').filter(Boolean);
    const newSegments = [...segments];

    if (segments[0] === 'ua' || segments[0] === 'ru') {
        newSegments.shift();
    }

    let basePath: string;
    if (newSegments.length === 0) {
        basePath = targetLang === 'ua' ? '/' : '/ru/';
    } else {
        basePath = `/${targetLang}/${newSegments.join('/')}/`;
    }

    const query = searchParams ? searchParams.toString() : '';
    return query ? `${basePath}?${query}` : basePath;
}
